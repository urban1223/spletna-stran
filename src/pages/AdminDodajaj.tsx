import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import type { Event } from "@/data/events-data";
import { members as legacyMembers } from "@/data/members-data";
import { deleteMember, getMembers, migrateMemberImages, saveMember, type AdminMember } from "@/lib/members-api";
import { deleteEvent, getAdminSession, getEvents, loginAdmin, logoutAdmin, saveEvent } from "@/lib/events-api";
import {
  addNewsImage,
  createNews,
  deleteNews,
  deleteNewsImage,
  getNews,
  updateNews,
  updateNewsImage,
  type NewsItem,
  type NewsLink,
} from "@/lib/news-api";
import {
  createGallery,
  deleteGallery,
  deleteGalleryImage,
  getGallery,
  moveGallery,
  uploadGalleryImage,
  updateGallery,
  updateGalleryImage,
  type GalleryAlbum,
} from "@/lib/gallery-api";

type ConcertForm = {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  program: string;
  conductor: string;
  admission: string;
  cta: string;
  link: string;
  reservation: boolean;
  past: boolean;
};

/** Payload ready to paste into events-data.ts (does not mutate source data). */
type ConcertExport = {
  slug: string;
  title: string;
  date: string;
  isoDate: string;
  time: string;
  location: string;
  description: string;
  program: string;
  conductor: string;
  admission: string;
  cta: string;
  link: string | null;
  reservation: boolean;
  past?: boolean;
};

const emptyForm: ConcertForm = {
  title: "",
  date: "",
  time: "19:30",
  location: "",
  description: "",
  program: "",
  conductor: "",
  admission: "Vstop prost!",
  cta: "VEČ O KONCERTU",
  link: "",
  reservation: false,
  past: false,
};

type MemberForm = Omit<AdminMember, "slug" | "imageUrl" | "imageData"> & {
  imageUrl: string;
  imageData: string;
  slug: string;
};

type NewsDraft = Omit<NewsItem, "id"> & { id?: number };

const emptyNewsDraft: NewsDraft = {
  title: "",
  description: "",
  detailDescription: "",
  heroData: null,
  heroAlt: "",
  images: [],
  links: [],
};
const emptyMemberForm: MemberForm = {
  slug: "",
  name: "",
  role: "",
  instruments: "",
  imageKey: "",
  imageUrl: "",
  imageData: "",
  shortBio: "",
  fullBio: "",
  isMentor: false,
};

const ensureManagedMembers = (loadedMembers: AdminMember[]) =>
  loadedMembers.length
    ? Promise.resolve(loadedMembers)
    : Promise.all(legacyMembers.map((member) => saveMember({ ...member, imageUrl: null, imageData: null }).then(({ member: saved }) => saved)));

const composerSuggestions = [
  "J. S. Bach",
  "G. P. Telemann",
  "G. F. Händel",
  "A. Vivaldi",
  "J. van Eyck",
  "A. Corelli",
  "P. A. Locatelli",
  "G. Tartini",
  "J. D. Zelenka",
  "M. A. Charpentier",
  "W. A. Mozart",
  "G. B. Fontana",
  "W. Byrd",
  "T. Morley",
  "J. J. Quantz",
];

const locationSuggestions = [
  "Cerkev sv. Jožefa, Ljubljana",
  "Cerkev sv. Jakoba, Ljubljana",
  "Stolnica sv. Nikolaja, Ljubljana",
  "Župnijska cerkev sv. Petra, Radovljica",
  "Cerkev sv. Kancijana in tovarišev, Kranj",
  "Dvorana Gimnazije Kranj",
  "Atrij ZRC SAZU, Ljubljana",
  "Baročna dvorana, Radovljica",
  "DSO Pristan, Vipava",
];

const PERSISTENCE_WARNING =
  "Spremembe se po uspešni objavi trajno shranijo v strežniško podatkovno bazo in so takoj vidne na javni strani.";

const slugify = (value: string) =>
  value
    .toLocaleLowerCase("sl-SI")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const formatSlovenianDate = (isoDate: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return isoDate;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day, 12, 0, 0);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return isoDate;
  }
  const weekday = new Intl.DateTimeFormat("sl-SI", { weekday: "long" }).format(parsed);
  const monthName = new Intl.DateTimeFormat("sl-SI", { month: "long" }).format(parsed);
  const capitalizedWeekday = weekday.charAt(0).toLocaleUpperCase("sl-SI") + weekday.slice(1);
  return `${capitalizedWeekday}, ${day}. ${monthName} ${year}`;
};

const canvaCsvColumns = [
  "title",
  "date",
  "time",
  "location",
  "program",
  "conductor",
  "description",
  "admission",
  "cta",
  "link",
  "event_url",
];

const csvCell = (value: string | null | undefined): string => {
  const normalized = (value || "").replace(/\r?\n/g, " ").trim();
  return `"${normalized.replace(/"/g, '""')}"`;
};

const downloadCanvaCsv = (events: Event[], filename: string) => {
  const origin = window.location.origin;
  const rows = events.map((event) => [
    event.title,
    event.date,
    event.time,
    event.location,
    event.program,
    event.conductor,
    event.description,
    event.admission,
    event.cta,
    event.link,
    `${origin}/dogodki/${event.slug}`,
  ]);
  const csv = [
    canvaCsvColumns.join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ].join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const eventToForm = (event: Event, isPast: boolean): ConcertForm => ({
  title: event.title,
  date: event.isoDate || "",
  time: event.time || "",
  location: event.location || "",
  description: event.description || "",
  program: event.program || "",
  conductor: event.conductor || "",
  admission: event.admission || "",
  cta: event.cta || "",
  link: event.link || "",
  reservation: Boolean(event.reservation),
  past: isPast || Boolean(event.past),
});

const buildConcertExport = (
  form: ConcertForm,
  slug: string,
  originalIsoDate: string | null,
  originalDisplayDate: string | null,
): ConcertExport => {
  const isoDate = form.date.trim();
  const dateUnchanged =
    originalIsoDate !== null &&
    originalDisplayDate !== null &&
    isoDate === originalIsoDate;
  const date = dateUnchanged ? originalDisplayDate : formatSlovenianDate(isoDate);

  const payload: ConcertExport = {
    slug,
    title: form.title.trim(),
    date,
    isoDate,
    time: form.time.trim(),
    location: form.location.trim(),
    description: form.description.trim(),
    program: form.program.trim(),
    conductor: form.conductor.trim(),
    admission: form.admission.trim(),
    cta: form.cta.trim(),
    link: form.link.trim() ? form.link.trim() : null,
    reservation: Boolean(form.reservation),
  };

  if (form.past) {
    payload.past = true;
  }

  return payload;
};

export default function AdminDodajaj() {
  const [events, setEvents] = useState<Event[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ConcertForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [originalIsoDate, setOriginalIsoDate] = useState<string | null>(null);
  const [originalDisplayDate, setOriginalDisplayDate] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [notice, setNotice] = useState("");
  const [copyNotice, setCopyNotice] = useState("");
  const [activeTab, setActiveTab] = useState<"events" | "gallery" | "members" | "news">("events");
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [memberForm, setMemberForm] = useState<MemberForm>(emptyMemberForm);
  const [editingMemberSlug, setEditingMemberSlug] = useState<string | null>(null);
  const [memberNotice, setMemberNotice] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>([]);
  const [selectedGalleryId, setSelectedGalleryId] = useState<number | null>(null);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [newGalleryInstagram, setNewGalleryInstagram] = useState("");
  const [galleryNotice, setGalleryNotice] = useState("");
  const [uploadingGalleryId, setUploadingGalleryId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [csvNotice, setCsvNotice] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsDraft, setNewsDraft] = useState<NewsDraft>(emptyNewsDraft);
  const [newsNotice, setNewsNotice] = useState("");
  const [savingNews, setSavingNews] = useState(false);

  useEffect(() => {
    getAdminSession()
      .then((session) => {
        setAuthenticated(session.authenticated);
        if (session.authenticated) {
          return Promise.all([getEvents(), getGallery(), getMembers(), getNews()]).then(([loadedEvents, loadedGallery, loadedMembers, loadedNews]) =>
            ensureManagedMembers(loadedMembers).then((managedMembers) =>
              migrateMemberImages().then(() => getMembers()).then((migratedMembers) => {
            setEvents(loadedEvents);
            setGalleryAlbums(loadedGallery);
            setMembers(migratedMembers);
            setNews(loadedNews);
          })));
        }
        return undefined;
      })
      .catch(() => setLoginError("Povezava s strežnikom ni uspela."))
      .finally(() => setCheckingSession(false));
  }, []);

  const pastSlugs = useMemo(() => new Set(events.filter((event) => event.past).map((event) => event.slug)), [events]);

  const visibleEvents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("sl-SI");
    return events
      .filter((event) => {
        const isPast = pastSlugs.has(event.slug) || Boolean(event.past);
        if (filter === "past" && !isPast) return false;
        if (filter === "upcoming" && isPast) return false;
        if (!query) return true;
        return (event.title || "").toLocaleLowerCase("sl-SI").includes(query);
      })
      .sort((a, b) => {
        const aPast = pastSlugs.has(a.slug) || Boolean(a.past);
        const bPast = pastSlugs.has(b.slug) || Boolean(b.past);
        if (aPast !== bPast) return aPast ? 1 : -1;
        const comparison = (a.isoDate || "").localeCompare(b.isoDate || "");
        return aPast ? -comparison : comparison;
      });
  }, [events, filter, pastSlugs, search]);

  const slug = editingSlug || slugify(form.title);

  const exportPayload = useMemo(
    () => buildConcertExport(form, slug, originalIsoDate, originalDisplayDate),
    [form, slug, originalIsoDate, originalDisplayDate],
  );

  const exportJson = useMemo(() => JSON.stringify(exportPayload, null, 2), [exportPayload]);

  const update = (key: keyof ConcertForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setNotice("");
    setCopyNotice("");
  };

  const addComposerSuggestion = (composer: string) => {
    const current = form.program.trim();
    const composers = current
      .split(",")
      .map((item) => item.trim().toLocaleLowerCase("sl-SI"))
      .filter(Boolean);
    if (composers.includes(composer.toLocaleLowerCase("sl-SI"))) return;
    update("program", current ? `${current.replace(/,\s*$/, "")}, ${composer}` : composer);
  };

  const startNew = () => {
    setForm(emptyForm);
    setEditingSlug(null);
    setOriginalIsoDate(null);
    setOriginalDisplayDate(null);
    setShowPreview(false);
    setCopyNotice("");
    setNotice("Obrazec za nov koncert je pripravljen. Obstoječi koncerti v events-data.ts ostanejo nespremenjeni.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editEvent = (event: Event) => {
    const isPast = pastSlugs.has(event.slug) || Boolean(event.past);
    setForm(eventToForm(event, isPast));
    setEditingSlug(event.slug);
    setOriginalIsoDate(event.isoDate || null);
    setOriginalDisplayDate(event.date || null);
    setShowPreview(false);
    setCopyNotice("");
    setNotice(`Urejaš koncert »${event.title}«. Obrazec je odprt neposredno pod tem koncertom.`);
    window.setTimeout(() => {
      document.getElementById(`admin-event-${event.slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setShowPreview(false);
    setCopyNotice("");
    saveEvent(exportPayload, editingSlug || undefined)
      .then(({ event: savedEvent }) => {
        setEvents((current) => {
          const withoutSaved = current.filter((item) => item.slug !== savedEvent.slug);
          return [...withoutSaved, savedEvent];
        });
        setNotice(editingSlug ? "Koncert je uspešno posodobljen in objavljen." : "Koncert je uspešno shranjen in objavljen.");
        setForm(emptyForm);
        setEditingSlug(null);
        setOriginalIsoDate(null);
        setOriginalDisplayDate(null);
      })
      .catch((error: Error) => setNotice(`Objava ni uspela: ${error.message}`))
      .finally(() => setSaving(false));
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    loginAdmin(username, password)
      .then(() => {
        setAuthenticated(true);
        setPassword("");
        return Promise.all([getEvents(), getMembers(), getNews()]).then(([loadedEvents, loadedMembers, loadedNews]) =>
          ensureManagedMembers(loadedMembers).then(() =>
            migrateMemberImages().then(() => getMembers()).then((migratedMembers) => {
          setEvents(loadedEvents);
          setMembers(migratedMembers);
          setNews(loadedNews);
        })));
      })
      .catch((error: Error) => setLoginError(error.message || "Prijava ni uspela."));
  };

  const handleLogout = () => {
    logoutAdmin().finally(() => {
      setAuthenticated(false);
      setEvents([]);
      setGalleryAlbums([]);
      setMembers([]);
      setNews([]);
    });
  };

  const handleDelete = (event: Event) => {
    if (!window.confirm(`Ali res želiš izbrisati koncert »${event.title}«? Tega dejanja ni mogoče razveljaviti.`)) {
      return;
    }
    setNotice("");
    deleteEvent(event.slug)
      .then(() => {
        setEvents((current) => current.filter((item) => item.slug !== event.slug));
        if (editingSlug === event.slug) {
          startNew();
        }
        setNotice(`Koncert »${event.title}« je bil izbrisan.`);
      })
      .catch((error: Error) => setNotice(`Brisanje ni uspelo: ${error.message}`));
  };

  const exportCanvaEvents = (onlyUpcoming: boolean) => {
    const exportEvents = events
      .filter((event) => !onlyUpcoming || !pastSlugs.has(event.slug))
      .sort((a, b) => (a.isoDate || "").localeCompare(b.isoDate || ""));
    if (exportEvents.length === 0) {
      setCsvNotice("Za izvoz ni koncertov.");
      return;
    }
    downloadCanvaCsv(
      exportEvents,
      onlyUpcoming ? "koncerti-prihodnji-canva.csv" : "koncerti-vsi-canva.csv",
    );
    setCsvNotice(`Izvoženih koncertov: ${exportEvents.length}. CSV lahko zdaj uvoziš v Canvin Bulk Create.`);
  };

  const exportSingleCanvaEvent = (event: Event) => {
    downloadCanvaCsv([event], `koncert-${event.slug}-canva.csv`);
    setCsvNotice(`Izvožen je koncert »${event.title}«. CSV lahko zdaj uvoziš v Canvin Bulk Create.`);
  };

  const refreshGallery = () => getGallery().then(setGalleryAlbums);

  const createGalleryAlbum = () => {
    if (!newGalleryTitle.trim()) {
      setGalleryNotice("Vpiši naslov galerije, nato klikni »Shrani in objavi galerijo«.");
      return;
    }
    createGallery(newGalleryTitle, newGalleryInstagram)
      .then(() => {
        setNewGalleryTitle("");
        setNewGalleryInstagram("");
        setGalleryNotice("Galerija je ustvarjena.");
        return refreshGallery();
      })
      .catch((error: Error) => setGalleryNotice(`Galerije ni mogoče ustvariti: ${error.message}`));
  };

  const createGalleryFromEvent = (event: Event) => {
    setNewGalleryTitle(event.title);
    setNewGalleryInstagram("");
    setGalleryNotice(`Naslov galerije za »${event.title}« je predizpolnjen. Dopolni podatke in jo shrani.`);
    setActiveTab("gallery");
    window.setTimeout(() => document.getElementById("admin-gallery-title")?.focus(), 0);
  };

  const editMember = (member: AdminMember) => {
    setMemberForm({ ...member, imageUrl: member.imageUrl || "", imageData: member.imageData || "" });
    setEditingMemberSlug(member.slug);
    setMemberNotice(`Urejaš člana »${member.name}«.`);
  };

  const startNewMember = () => {
    setMemberForm(emptyMemberForm);
    setEditingMemberSlug(null);
    setMemberNotice("Obrazec za novega člana je pripravljen.");
  };

  const handleMemberSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      ...memberForm,
      slug: memberForm.slug || slugify(memberForm.name),
      imageUrl: memberForm.imageUrl || null,
      imageData: memberForm.imageData || null,
    };
    saveMember(payload, editingMemberSlug || undefined)
      .then(({ member }) => {
        setMembers((current) => [...current.filter((item) => item.slug !== (editingMemberSlug || member.slug)), member]);
        setMemberForm(emptyMemberForm);
        setEditingMemberSlug(null);
        setMemberNotice(`Član »${member.name}« je uspešno shranjen.`);
      })
      .catch((error: Error) => setMemberNotice(`Shranjevanje ni uspelo: ${error.message}`));
  };

  const handleMemberDelete = (member: AdminMember) => {
    if (!window.confirm(`Ali res želiš izbrisati člana »${member.name}«?`)) return;
    deleteMember(member.slug)
      .then(() => {
        setMembers((current) => current.filter((item) => item.slug !== member.slug));
        setMemberNotice(`Član »${member.name}« je bil izbrisan.`);
      })
      .catch((error: Error) => setMemberNotice(`Brisanje ni uspelo: ${error.message}`));
  };

  const handleGalleryMove = (album: GalleryAlbum, direction: "up" | "down") => {
    moveGallery(album.id, direction)
      .then(() => refreshGallery())
      .then(() => setGalleryNotice(`Galerija »${album.title}« je premaknjena ${direction === "up" ? "navzgor" : "navzdol"}.`))
      .catch((error: Error) => setGalleryNotice(`Premik ni uspel: ${error.message}`));
  };

  const resizeImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const scale = Math.min(1, 2000 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Resizer ni na voljo."));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        let quality = 0.82;
        const createData = () => canvas.toDataURL("image/jpeg", quality);
        let data = createData();
        while (data.length * 0.75 > 200 * 1024 && quality > 0.2) {
          quality -= 0.08;
          data = createData();
        }
        if (data.length * 0.75 > 200 * 1024) {
          reject(new Error("Slike ni mogoče zmanjšati pod 200 KB."));
          return;
        }
        resolve(data);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Slike ni mogoče prebrati."));
      };
      image.src = objectUrl;
    });

  const handleGalleryUpload = async (album: GalleryAlbum, file: File) => {
    try {
      setUploadingGalleryId(album.id);
      setUploadProgress(10);
      setGalleryNotice(`Galerija »${album.title}«: pripravljam sliko …`);
      const data = await resizeImage(file);
      setUploadProgress(55);
      setGalleryNotice(`Galerija »${album.title}«: nalagam sliko …`);
      await uploadGalleryImage(album.id, data, file.name);
      setUploadProgress(85);
      setGalleryNotice(`Galerija »${album.title}«: osvežujem galerijo …`);
      await refreshGallery();
      setUploadProgress(100);
      setGalleryNotice("Slika je bila zmanjšana pod 200 KB in objavljena.");
    } catch (error) {
      setGalleryNotice(`Slike ni mogoče objaviti: ${(error as Error).message}`);
    } finally {
      setUploadingGalleryId(null);
      setUploadProgress(0);
    }
  };

  const handleMemberImageChange = async (file: File) => {
    try {
      setMemberNotice("Pripravljam fotografijo …");
      const imageData = await resizeImage(file);
      setMemberForm((current) => ({ ...current, imageData, imageUrl: "" }));
      setMemberNotice("Fotografija je pripravljena za shranjevanje.");
    } catch (error) {
      setMemberNotice(`Fotografije ni mogoče pripraviti: ${(error as Error).message}`);
    }
  };

  const handleGalleryDelete = (album: GalleryAlbum) => {
    if (!window.confirm(`Ali res želiš izbrisati galerijo »${album.title}«?`)) return;
    deleteGallery(album.id)
      .then(() => {
        setGalleryAlbums((current) => current.filter((item) => item.id !== album.id));
        setGalleryNotice("Galerija je izbrisana.");
      })
      .catch((error: Error) => setGalleryNotice(`Brisanje ni uspelo: ${error.message}`));
  };

  const handleGalleryImageDelete = (album: GalleryAlbum, imageId: number) => {
    if (!window.confirm("Ali res želiš izbrisati to sliko?")) return;
    deleteGalleryImage(album.id, imageId)
      .then(() => refreshGallery())
      .then(() => setGalleryNotice("Slika je izbrisana."))
      .catch((error: Error) => setGalleryNotice(`Brisanje ni uspelo: ${error.message}`));
  };

  const handleGalleryImageAltUpdate = (album: GalleryAlbum, imageId: number, alt: string) => {
    updateGalleryImage(album.id, imageId, alt)
      .then(() => setGalleryNotice("Opis slike je shranjen."))
      .catch((error: Error) => setGalleryNotice(`Opisa slike ni mogoče shraniti: ${error.message}`));
  };

  const updateNewsDraft = <K extends keyof NewsDraft>(key: K, value: NewsDraft[K]) => {
    setNewsDraft((current) => ({ ...current, [key]: value }));
    setNewsNotice("");
  };

  const startNews = () => {
    setNewsDraft(emptyNewsDraft);
    setNewsNotice("");
  };

  const editNews = (item: NewsItem) => {
    setNewsDraft({ ...item, links: item.links.map((link) => ({ ...link })), images: [...item.images] });
    setNewsNotice(`Urejaš aktualno novico »${item.title}«.`);
    window.setTimeout(() => document.getElementById(`admin-news-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const saveNewsDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingNews(true);
    const request = newsDraft.id ? updateNews(newsDraft as NewsItem) : createNews(newsDraft);
    request
      .then(({ news: saved }) => {
        setNews((current) => {
          const withoutSaved = current.filter((item) => item.id !== saved.id);
          return [...withoutSaved, saved];
        });
        setNewsDraft(saved);
        setNewsNotice("Aktualna novica je shranjena in objavljena.");
      })
      .catch((error: Error) => setNewsNotice(`Novice ni mogoče shraniti: ${error.message}`))
      .finally(() => setSavingNews(false));
  };

  const handleNewsHeroUpload = async (file: File) => {
    try {
      const data = await resizeImage(file);
      updateNewsDraft("heroData", data);
      if (!newsDraft.heroAlt) updateNewsDraft("heroAlt", file.name.replace(/\.[^.]+$/, ""));
      setNewsNotice("Glavna slika je pripravljena. Klikni »Shrani novico«.");
    } catch (error) {
      setNewsNotice(`Glavne slike ni mogoče pripraviti: ${(error as Error).message}`);
    }
  };

  const handleNewsImageUpload = async (file: File) => {
    if (!newsDraft.id) {
      setNewsNotice("Najprej shrani novico, nato lahko dodaš manjše slike.");
      return;
    }
    if (newsDraft.images.length >= 3) {
      setNewsNotice("Dodane so lahko največ 3 manjše slike.");
      return;
    }
    try {
      const data = await resizeImage(file);
      const { image } = await addNewsImage(newsDraft.id, data, file.name.replace(/\.[^.]+$/, ""));
      setNewsDraft((current) => ({ ...current, images: [...current.images, image] }));
      setNews((current) => current.map((item) => (item.id === newsDraft.id ? { ...item, images: [...item.images, image] } : item)));
      setNewsNotice("Manjša slika je dodana.");
    } catch (error) {
      setNewsNotice(`Slike ni mogoče dodati: ${(error as Error).message}`);
    }
  };

  const handleNewsImageDelete = (imageId: number) => {
    if (!newsDraft.id) return;
    deleteNewsImage(newsDraft.id, imageId)
      .then(() => {
        setNewsDraft((current) => ({ ...current, images: current.images.filter((image) => image.id !== imageId) }));
        setNews((current) => current.map((item) => item.id === newsDraft.id ? { ...item, images: item.images.filter((image) => image.id !== imageId) } : item));
        setNewsNotice("Manjša slika je izbrisana.");
      })
      .catch((error: Error) => setNewsNotice(`Slike ni mogoče izbrisati: ${error.message}`));
  };

  const handleNewsImageAltUpdate = (image: NewsItem["images"][number]) => {
    if (!newsDraft.id) return;
    updateNewsImage(newsDraft.id, image)
      .then(() => setNewsNotice("Opis slike je shranjen."))
      .catch((error: Error) => setNewsNotice(`Opisa slike ni mogoče shraniti: ${error.message}`));
  };

  const deleteNewsItem = (item: NewsItem) => {
    if (!window.confirm(`Ali res želiš izbrisati aktualno novico »${item.title}«?`)) return;
    deleteNews(item.id)
      .then(() => {
        setNews((current) => current.filter((newsItem) => newsItem.id !== item.id));
        if (newsDraft.id === item.id) setNewsDraft(emptyNewsDraft);
        setNewsNotice("Aktualna novica je izbrisana.");
      })
      .catch((error: Error) => setNewsNotice(`Novice ni mogoče izbrisati: ${error.message}`));
  };

  const addNewsLink = () => updateNewsDraft("links", [...newsDraft.links, { label: "", url: "" }]);

  const updateNewsLink = (index: number, key: keyof NewsLink, value: string) => {
    updateNewsDraft(
      "links",
      newsDraft.links.map((link, linkIndex) => (linkIndex === index ? { ...link, [key]: value } : link)),
    );
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopyNotice("JSON je kopiran v odložišče. Prilepi ga ročno v events-data.ts — to še ne shrani in ne objavi koncerta.");
    } catch {
      setCopyNotice("Kopiranje ni uspelo. Izberi in skopiraj JSON spodaj ročno.");
    }
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    borderRadius: 9,
    border: "1px solid hsl(220 20% 27%)",
    background: "hsl(220 20% 10%)",
    color: "hsl(40 15% 92%)",
    font: "inherit",
    outlineColor: "hsl(45 85% 65%)",
  };
  const labelStyle: CSSProperties = {
    display: "grid",
    gap: 7,
    color: "hsl(40 15% 88%)",
    fontSize: 14,
    fontWeight: 600,
  };
  const field = (
    label: string,
    key: keyof ConcertForm,
    options: { required?: boolean; type?: string; multiline?: boolean; placeholder?: string; list?: string } = {},
  ) => (
    <label style={labelStyle}>
      <span>
        {label}
        {options.required ? " *" : ""}
      </span>
      {options.multiline ? (
        <textarea
          value={String(form[key])}
          onChange={(e) => update(key, e.target.value)}
          required={options.required}
          placeholder={options.placeholder}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      ) : (
        <input
          type={options.type || "text"}
          value={String(form[key])}
          onChange={(e) => update(key, e.target.value)}
          required={options.required}
          placeholder={options.placeholder}
          list={options.list}
          style={inputStyle}
        />
      )}
    </label>
  );

  if (checkingSession) {
    return <main style={{ padding: 32 }}>Preverjam prijavo …</main>;
  }

  if (!authenticated) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "hsl(220 25% 8%)",
          color: "hsl(40 15% 92%)",
          padding: 16,
        }}
      >
        <form onSubmit={handleLogin} className="admin-card" style={{ width: "min(100%, 420px)", display: "grid", gap: 16 }}>
          <h1 style={{ margin: 0 }}>Administracija koncertov</h1>
          <label style={labelStyle}>
            Uporabniško ime
            <input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
          </label>
          <label style={labelStyle}>
            Geslo
            <input
              id="admin-gallery-title"
              style={inputStyle}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {loginError && <div role="alert" style={{ color: "hsl(0 75% 75%)" }}>{loginError}</div>}
          <button className="admin-button admin-gold" type="submit">Prijava</button>
        </form>
      </main>
    );
  }

  const editorForm = (
    <form onSubmit={handleSubmit} className="admin-card" style={{ display: "grid", gap: 20, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: 21 }}>{editingSlug ? "Uredi koncert" : "Dodaj koncert"}</h2>
        {editingSlug && (
          <button className="admin-button admin-secondary" type="button" onClick={startNew}>
            Prekliči urejanje
          </button>
        )}
      </div>
      {editingSlug && (
        <p style={{ margin: 0, color: "hsl(220 8% 68%)", fontSize: 13 }}>
          Obstoječi slug je zaklenjen, da se povezava do koncerta ne spremeni po nesreči.
        </p>
      )}
      <section>
        <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Osnovni podatki</h3>
        <div className="admin-grid">
          {field("Naslov koncerta", "title", { required: true, placeholder: "Npr. Večer klasične glasbe" })}
          {field("Prizorišče / lokacija", "location", { required: true, list: "admin-location-suggestions" })}
          {field("Datum", "date", { required: true, type: "date" })}
          {field("Ura", "time", { required: true, type: "time" })}
          {field("Nastopajoči", "description", { multiline: true, placeholder: "Npr. orkester, solisti, zbor …" })}
          <div style={{ display: "grid", gap: 7 }}>
            {field("Program / skladatelji", "program", { multiline: true, placeholder: "Izberi predlog ali vpiši ročno; več skladateljev loči z vejico." })}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {composerSuggestions.map((composer) => (
                <button
                  key={composer}
                  type="button"
                  className="admin-button admin-secondary"
                  style={{ padding: "6px 9px", fontSize: 12 }}
                  onClick={() => addComposerSuggestion(composer)}
                >
                  + {composer}
                </button>
              ))}
            </div>
            <datalist id="admin-location-suggestions">
              {locationSuggestions.map((location) => (
                <option key={location} value={location} />
              ))}
            </datalist>
            <span style={{ color: "hsl(220 8% 68%)", fontSize: 12 }}>
              Predlogi skladateljev se dodajo z vejico. Besedilo lahko kadarkoli ročno dopolniš.
            </span>
          </div>
          {field("Dirigent", "conductor")}
          {field("Vstopnina", "admission")}
          {field("Besedilo gumba", "cta", { required: true })}
          {field("Spletna povezava gumba", "link", {
            type: "url",
            placeholder: "https://… (pusti prazno, če ni povezave)",
          })}
        </div>
        <div style={{ marginTop: 15, display: "grid", gap: 12 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14 }}>
            <input
              type="checkbox"
              checked={form.reservation}
              onChange={(e) => update("reservation", e.target.checked)}
            />{" "}
            Uporabi obrazec za rezervacije
          </label>
          <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14 }}>
            <input type="checkbox" checked={form.past} onChange={(e) => update("past", e.target.checked)} /> Označi
            kot pretekli koncert
          </label>
        </div>
      </section>
      <div style={{ borderTop: "1px solid hsl(220 20% 22%)", paddingTop: 16 }}>
        <div style={{ color: "hsl(220 8% 68%)", fontSize: 12, marginBottom: 6 }}>Slug / naslov povezave</div>
        <code style={{ color: "hsl(45 85% 65%)", overflowWrap: "anywhere" }}>{slug || "naslov-koncerta"}</code>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button className="admin-button admin-gold" type="submit">
          {saving ? "Shranjujem …" : "Objavi koncert"}
        </button>
        <button className="admin-button admin-secondary" type="button" onClick={startNew}>
          Počisti / nov koncert
        </button>
      </div>
      {notice && (
        <div
          role="status"
          style={{
            border: "1px solid hsl(45 60% 35%)",
            background: "hsl(45 35% 13%)",
            color: "hsl(45 85% 75%)",
            borderRadius: 9,
            padding: 12,
            lineHeight: 1.5,
          }}
        >
          {notice}
        </div>
      )}
    </form>
  );

  const newsEditor = (
    <section className="admin-card" style={{ display: "grid", gap: 18 }}>
      <div>
        <h2 style={{ margin: "0 0 8px", fontSize: 21 }}>Aktualno</h2>
        <p style={{ margin: 0, color: "hsl(220 8% 68%)", lineHeight: 1.5 }}>
          Objavi največ 3 aktualne novice na prvi strani. Glavna slika je neobvezna in se prikaže na levi.
        </p>
      </div>
      <form onSubmit={saveNewsDraft} style={{ display: "grid", gap: 14 }}>
        <label style={labelStyle}>
          Naslov
          <input style={inputStyle} value={newsDraft.title} onChange={(e) => updateNewsDraft("title", e.target.value)} required />
        </label>
        <label style={labelStyle}>
          Kratek opis za prvo stran
          <textarea
            style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
            value={newsDraft.description}
            onChange={(e) => updateNewsDraft("description", e.target.value)}
            required
          />
        </label>
        <label style={labelStyle}>
          Opis v podrobnem pogledu
          <textarea
            style={{ ...inputStyle, minHeight: 180, resize: "vertical" }}
            value={newsDraft.detailDescription}
            onChange={(e) => updateNewsDraft("detailDescription", e.target.value)}
            placeholder="Daljši opis. Povezavo v besedilu vpiši kot [Besedilo povezave](https://primer.si)."
            required
          />
        </label>
        <div className="admin-grid">
          <label style={labelStyle}>
            Glavna slika (neobvezno)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleNewsHeroUpload(file);
                e.currentTarget.value = "";
              }}
            />
          </label>
          <label style={labelStyle}>
            Opis glavne slike
            <input style={inputStyle} value={newsDraft.heroAlt} onChange={(e) => updateNewsDraft("heroAlt", e.target.value)} />
          </label>
        </div>
        {newsDraft.heroData && (
          <img src={newsDraft.heroData} alt={newsDraft.heroAlt || "Predogled glavne slike"} style={{ maxHeight: 220, width: "100%", objectFit: "cover", borderRadius: 8 }} />
        )}
        <div style={{ display: "grid", gap: 10 }}>
          <strong>Manjše slike v podrobnem pogledu (največ 5)</strong>
          <label className="admin-button admin-secondary" style={{ width: "fit-content" }}>
            + Dodaj manjšo sliko
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleNewsImageUpload(file);
                e.currentTarget.value = "";
              }}
            />
          </label>
          {newsDraft.images.map((image) => (
            <div key={image.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr auto", gap: 10, alignItems: "center" }}>
              <img src={image.data} alt={image.alt} style={{ width: 80, height: 56, objectFit: "cover", borderRadius: 6 }} />
              <input
                style={inputStyle}
                value={image.alt}
                aria-label="Opis manjše slike"
                onChange={(e) =>
                  setNewsDraft((current) => ({
                    ...current,
                    images: current.images.map((currentImage) =>
                      currentImage.id === image.id ? { ...currentImage, alt: e.target.value } : currentImage,
                    ),
                  }))
                }
                onBlur={() => handleNewsImageAltUpdate(image)}
              />
              <button className="admin-button admin-secondary" type="button" onClick={() => handleNewsImageDelete(image.id)}>
                Izbriši
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <strong>Povezave v podrobnem pogledu</strong>
          {newsDraft.links.map((link, index) => (
            <div key={index} className="admin-grid">
              <input
                style={inputStyle}
                placeholder="Besedilo povezave, npr. Več o koncertu"
                value={link.label}
                onChange={(e) => updateNewsLink(index, "label", e.target.value)}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={inputStyle}
                  placeholder="URL ali notranja pot, npr. /dogodki"
                  value={link.url}
                  onChange={(e) => updateNewsLink(index, "url", e.target.value)}
                />
                <button
                  className="admin-button admin-secondary"
                  type="button"
                  onClick={() => updateNewsDraft("links", newsDraft.links.filter((_, linkIndex) => linkIndex !== index))}
                >
                  Odstrani
                </button>
              </div>
            </div>
          ))}
          <button className="admin-button admin-secondary" type="button" onClick={addNewsLink} style={{ width: "fit-content" }}>
            + Dodaj povezavo
          </button>
        </div>
        <button className="admin-button admin-gold" type="submit" disabled={savingNews}>
          {savingNews ? "Shranjujem …" : newsDraft.id ? "Shrani spremembe" : "Objavi aktualno novico"}
        </button>
      </form>
      {newsNotice && <div role="status" style={{ color: "hsl(45 85% 75%)" }}>{newsNotice}</div>}
      <div style={{ display: "grid", gap: 12 }}>
        {news.map((item) => (
          <article id={`admin-news-${item.id}`} key={item.id} className="admin-event">
            <div>
              <strong>{item.title}</strong>
              <div style={{ color: "hsl(220 8% 68%)", fontSize: 13, marginTop: 4 }}>{item.description}</div>
              <div style={{ color: "hsl(220 8% 68%)", fontSize: 13, marginTop: 6 }}>
                Javna povezava:{" "}
                <a href={`/aktualno/${item.id}`} style={{ color: "hsl(45 85% 75%)" }}>
                  /aktualno/{item.id}
                </a>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="admin-button admin-secondary" type="button" onClick={() => editNews(item)}>Uredi</button>
              <button className="admin-button admin-secondary" type="button" onClick={() => deleteNewsItem(item)}>Izbriši</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const galleryEditor = (
    <section className="admin-card" style={{ display: "grid", gap: 18 }}>
      <div>
        <h2 style={{ margin: "0 0 8px", fontSize: 21 }}>Uredi slike</h2>
        <p style={{ margin: 0, color: "hsl(220 8% 68%)", lineHeight: 1.5 }}>
          Vsaka slika se pred objavo samodejno zmanjša. Največja dovoljena velikost je <strong>200 KB</strong>.
          Slike se shranijo kot 1.jpg, 2.jpg, 3.jpg …
        </p>
        <p style={{ margin: "10px 0 0", color: "hsl(45 85% 75%)", lineHeight: 1.5 }}>
          Ko klikneš »Shrani in objavi galerijo«, se galerija takoj prikaže na javni strani <strong>/galerija</strong>.
          Nato v posamezni galeriji klikni »Naloži sliko«, da dodaš fotografije.
        </p>
      </div>
      <div className="admin-grid">
        <label style={labelStyle}>
          Naslov nove galerije
          <input style={inputStyle} value={newGalleryTitle} onChange={(e) => setNewGalleryTitle(e.target.value)} />
        </label>
        <label style={labelStyle}>
          Instagram povezava (neobvezno)
          <input style={inputStyle} type="url" value={newGalleryInstagram} onChange={(e) => setNewGalleryInstagram(e.target.value)} />
        </label>
      </div>
      <button className="admin-button admin-gold" type="button" onClick={createGalleryAlbum}>
        + Shrani in objavi galerijo
      </button>
      {galleryNotice && <div role="status" style={{ color: "hsl(45 85% 75%)" }}>{galleryNotice}</div>}
      <div style={{ display: "grid", gap: 18 }}>
        {galleryAlbums.map((album, albumIndex) => (
          <article key={album.id} className="admin-card" style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  className="admin-button admin-secondary"
                  type="button"
                  disabled={albumIndex === 0}
                  onClick={() => handleGalleryMove(album, "up")}
                  aria-label={`Premakni galerijo ${album.title} navzgor`}
                >
                  ↑ Gor
                </button>
                <button
                  className="admin-button admin-secondary"
                  type="button"
                  disabled={albumIndex === galleryAlbums.length - 1}
                  onClick={() => handleGalleryMove(album, "down")}
                  aria-label={`Premakni galerijo ${album.title} navzdol`}
                >
                  ↓ Dol
                </button>
                <input
                  style={{ ...inputStyle, maxWidth: 500 }}
                  value={album.title}
                  onChange={(e) =>
                    setGalleryAlbums((current) =>
                      current.map((item) => (item.id === album.id ? { ...item, title: e.target.value } : item)),
                    )
                  }
                  onBlur={() => updateGallery(album).catch((error: Error) => setGalleryNotice(error.message))}
                />
              </div>
              <button className="admin-button admin-secondary" type="button" onClick={() => handleGalleryDelete(album)}>
                Izbriši galerijo
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12 }}>
              {album.images.map((image) => (
                <div key={image.id} style={{ display: "grid", gap: 6 }}>
                  <img src={image.src} alt={image.alt} style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 8 }} />
                  <label style={{ ...labelStyle, fontSize: 12 }}>
                    Opis slike (za Google in dostopnost)
                    <input
                      style={inputStyle}
                      value={image.alt}
                      aria-label={`Opis slike v galeriji ${album.title}`}
                      onChange={(e) =>
                        setGalleryAlbums((current) =>
                          current.map((item) =>
                            item.id === album.id
                              ? {
                                  ...item,
                                  images: item.images.map((currentImage) =>
                                    currentImage.id === image.id ? { ...currentImage, alt: e.target.value } : currentImage,
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                      onBlur={(e) => handleGalleryImageAltUpdate(album, image.id, e.target.value)}
                    />
                  </label>
                  <button className="admin-button admin-secondary" type="button" onClick={() => handleGalleryImageDelete(album, image.id)}>
                    Izbriši sliko
                  </button>
                </div>
              ))}
            </div>
            {uploadingGalleryId === album.id && (
              <div role="status" aria-live="polite" style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "hsl(220 8% 68%)" }}>
                  <span>Nalaganje slike …</span>
                  <span>{uploadProgress}%</span>
                </div>
                <progress value={uploadProgress} max={100} style={{ width: "100%", accentColor: "hsl(45 85% 65%)" }} />
              </div>
            )}
            <label
              className="admin-button admin-gold"
              style={{
                display: "inline-block",
                width: "fit-content",
                opacity: uploadingGalleryId !== null ? 0.6 : 1,
                pointerEvents: uploadingGalleryId !== null ? "none" : "auto",
              }}
            >
              + Naloži sliko (samodejni resizer, največ 200 KB)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                disabled={uploadingGalleryId !== null}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleGalleryUpload(album, file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <main
      className="admin-concerts"
      style={{
        minHeight: "100vh",
        background: "hsl(220 25% 8%)",
        color: "hsl(40 15% 92%)",
        padding: "28px 16px 56px",
      }}
    >
      <style>{`
        .admin-concerts * { box-sizing: border-box; }
        .admin-wrap { max-width: 1050px; margin: 0 auto; }
        .admin-card { background: hsl(220 20% 12%); border: 1px solid hsl(220 20% 22%); border-radius: 15px; padding: 20px; }
        .admin-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 15px; }
        .admin-button { border: 0; border-radius: 9px; padding: 11px 15px; font: inherit; font-weight: 750; cursor: pointer; }
        .admin-gold { background: hsl(45 85% 65%); color: hsl(220 35% 12%); }
        .admin-secondary { background: hsl(220 20% 18%); color: hsl(40 15% 92%); border: 1px solid hsl(220 20% 27%); }
        .admin-event { display:flex; flex-wrap:wrap; justify-content:space-between; gap:16px; align-items:center; padding:14px 0; border-bottom:1px solid hsl(220 20% 22%); }
        .admin-event:last-child { border-bottom:0; }
        @media(max-width:650px) { .admin-grid { grid-template-columns:1fr; } .admin-event { align-items:flex-start; flex-direction:column; } .admin-concerts { padding:16px 10px 32px !important; } }
      `}</style>
      <div className="admin-wrap">
        <header style={{ marginBottom: 22 }}>
          <div
            style={{
              color: "hsl(45 85% 65%)",
              textTransform: "uppercase",
              letterSpacing: ".15em",
              fontSize: 11,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            NOVA AKADEMIJA · ADMIN
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", margin: "0 0 8px" }}>Upravljanje koncerti</h1>
          <p style={{ color: "hsl(220 8% 68%)", lineHeight: 1.6, margin: "0 0 12px" }}>
            Preglej obstoječe koncerte, odpri podatke za urejanje ali pripravi nov koncert.
          </p>
          <p
            role="note"
            style={{
              margin: 0,
              border: "1px solid hsl(45 60% 35%)",
              background: "hsl(45 35% 13%)",
              color: "hsl(45 85% 75%)",
              borderRadius: 9,
              padding: 12,
              lineHeight: 1.5,
              fontSize: 13,
            }}
          >
            {PERSISTENCE_WARNING}
          </p>
          <button className="admin-button admin-secondary" type="button" onClick={handleLogout} style={{ marginTop: 12 }}>
            Odjava
          </button>
        </header>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
          <button
            className={`admin-button ${activeTab === "events" ? "admin-gold" : "admin-secondary"}`}
            type="button"
            onClick={() => setActiveTab("events")}
          >
            Uredi koncert
          </button>
          <button
            className={`admin-button ${activeTab === "gallery" ? "admin-gold" : "admin-secondary"}`}
            type="button"
            onClick={() => setActiveTab("gallery")}
          >
            Uredi slike
          </button>
          <button
            className={`admin-button ${activeTab === "members" ? "admin-gold" : "admin-secondary"}`}
            type="button"
            onClick={() => setActiveTab("members")}
          >
            Uredi člane
          </button>
          <button
            className={`admin-button ${activeTab === "news" ? "admin-gold" : "admin-secondary"}`}
            type="button"
            onClick={() => setActiveTab("news")}
          >
            Uredi aktualno
          </button>
        </div>

        {activeTab === "events" && (
          <>
            {!editingSlug && editorForm}
            <section className="admin-card" style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 15,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 21 }}>Objavljeni koncerti ({visibleEvents.length})</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="admin-button admin-secondary" type="button" onClick={() => exportCanvaEvents(true)}>
                Izvozi prihodnje za Canvo
              </button>
              <button className="admin-button admin-secondary" type="button" onClick={() => exportCanvaEvents(false)}>
                Izvozi vse za Canvo
              </button>
              <button className="admin-button admin-gold" type="button" onClick={startNew}>
                + Nov koncert
              </button>
            </div>
          </div>
          <p style={{ margin: "0 0 14px", color: "hsl(220 8% 68%)", fontSize: 13, lineHeight: 1.5 }}>
            CSV je pripravljen za <strong>Canva → Apps → Bulk Create</strong>. Vsebuje besedilna polja in javno povezavo do koncerta.
          </p>
          {csvNotice && (
            <div role="status" style={{ marginBottom: 14, color: "hsl(45 85% 75%)" }}>
              {csvNotice}
            </div>
          )}
          <div className="admin-grid" style={{ marginBottom: 12 }}>
            <label style={labelStyle}>
              Iskanje po naslovu
              <input
                style={inputStyle}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Npr. Božični oratorij …"
              />
            </label>
            <label style={labelStyle}>
              Prikaži
              <select
                style={inputStyle}
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
              >
                <option value="all">Vse koncerte</option>
                <option value="upcoming">Prihajajoče koncerte</option>
                <option value="past">Pretekle koncerte</option>
              </select>
            </label>
          </div>
          {visibleEvents.length === 0 ? (
            <p style={{ color: "hsl(220 8% 68%)" }}>Ni zadetkov za izbrano iskanje.</p>
          ) : (
            visibleEvents.map((event) => {
              const isPast = pastSlugs.has(event.slug) || Boolean(event.past);
              return (
                <div className="admin-event" id={`admin-event-${event.slug}`} key={event.slug}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "hsl(45 85% 65%)", fontSize: 12, marginBottom: 4 }}>
                      {event.date} · {event.time}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 750, overflowWrap: "anywhere" }}>{event.title}</div>
                    <div style={{ color: "hsl(220 8% 68%)", fontSize: 13, marginTop: 4 }}>{event.location}</div>
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 7,
                        fontSize: 11,
                        padding: "3px 7px",
                        borderRadius: 5,
                        background: isPast ? "hsl(220 15% 20%)" : "hsl(145 35% 18%)",
                        color: isPast ? "hsl(220 8% 75%)" : "hsl(145 55% 75%)",
                      }}
                    >
                      {isPast ? "Pretekli" : "Prihajajoči"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className="admin-button admin-secondary"
                      type="button"
                      onClick={() => editEvent(event)}
                    >
                      Uredi koncert
                    </button>
                    <button
                      className="admin-button admin-secondary"
                      type="button"
                      onClick={() => exportSingleCanvaEvent(event)}
                    >
                      Izvozi za Canvo
                    </button>
                    <button className="admin-button admin-secondary" type="button" onClick={() => createGalleryFromEvent(event)}>
                      Ustvari galerijo
                    </button>
                    <button
                      className="admin-button admin-secondary"
                      type="button"
                      onClick={() => handleDelete(event)}
                      style={{ color: "hsl(0 75% 75%)", borderColor: "hsl(0 45% 35%)" }}
                    >
                      Izbriši
                    </button>
                  </div>
                  {editingSlug === event.slug && (
                    <div style={{ flexBasis: "100%", width: "100%" }}>{editorForm}</div>
                  )}
                </div>
              );
            })
          )}
            </section>
          </>
        )}

        {activeTab === "events" && showPreview && (
          <section id="admin-preview" className="admin-card" style={{ marginTop: 18 }}>
            <div
              style={{
                color: "hsl(45 85% 65%)",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: ".14em",
                marginBottom: 10,
              }}
            >
              PREDOGLED
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: 24 }}>{exportPayload.title || "Brez naslova"}</h2>
            <p style={{ color: "hsl(220 8% 70%)", lineHeight: 1.6 }}>
              {exportPayload.date} · {exportPayload.time} · {exportPayload.location}
            </p>
            {exportPayload.description && <p>{exportPayload.description}</p>}
            {exportPayload.program && (
              <p>
                <strong>Program:</strong> {exportPayload.program}
              </p>
            )}
            {exportPayload.conductor && (
              <p>
                <strong>Dirigent:</strong> {exportPayload.conductor}
              </p>
            )}
            {exportPayload.admission && (
              <p>
                <strong>Vstopnina:</strong> {exportPayload.admission}
              </p>
            )}
            <p style={{ color: "hsl(45 85% 65%)" }}>
              Slug: {exportPayload.slug} · {exportPayload.past ? "Pretekli koncert" : "Prihajajoči koncert"}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "14px 0" }}>
              <button className="admin-button admin-gold" type="button" onClick={copyJson}>
                Kopiraj JSON
              </button>
            </div>
            {copyNotice && (
              <p role="status" style={{ color: "hsl(45 85% 75%)", fontSize: 13, lineHeight: 1.5 }}>
                {copyNotice}
              </p>
            )}
            <details open>
              <summary style={{ cursor: "pointer" }}>Podatki za ročni vnos v events-data.ts (JSON)</summary>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  fontSize: 12,
                  lineHeight: 1.5,
                  background: "hsl(220 20% 9%)",
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 10,
                }}
              >
                {exportJson}
              </pre>
            </details>
            <p style={{ marginBottom: 0, color: "hsl(45 85% 75%)", fontSize: 13, lineHeight: 1.5 }}>
              {PERSISTENCE_WARNING}
            </p>
          </section>
        )}

        {activeTab === "news" && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button className="admin-button admin-gold" type="button" onClick={startNews} disabled={news.length >= 3}>
                + Nova aktualna novica
              </button>
            </div>
            {newsEditor}
          </>
        )}

        {activeTab === "gallery" && galleryEditor}

        {activeTab === "members" && (
          <section className="admin-card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 15 }}>
              <h2 style={{ margin: 0, fontSize: 21 }}>Člani in mentorji ({members.length})</h2>
              <button className="admin-button admin-gold" type="button" onClick={startNewMember}>+ Dodaj člana</button>
            </div>
            {memberNotice && <div role="status" style={{ color: "hsl(45 85% 75%)", marginBottom: 14 }}>{memberNotice}</div>}
            <div className="admin-grid" style={{ marginBottom: 14 }}>
              <label style={labelStyle}>
                Iskanje po imenu
                <input style={inputStyle} value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} />
              </label>
            </div>
            <form onSubmit={handleMemberSubmit} className="admin-card" style={{ marginBottom: 18 }}>
              <h3 style={{ marginTop: 0 }}>{editingMemberSlug ? "Uredi člana" : "Nov član"}</h3>
              <div className="admin-grid">
                {([
                  ["name", "Ime", true],
                  ["role", "Vloga", false],
                  ["instruments", "Inštrumenti", false],
                  ["imageKey", "Ključ obstoječe fotografije", false],
                  ["imageUrl", "URL ali pot zunanje fotografije", false],
                ] as const).map(([key, label, required]) => (
                  <label key={key} style={labelStyle}>
                    {label}
                    <input
                      style={inputStyle}
                      required={required}
                      value={memberForm[key]}
                      onChange={(e) => setMemberForm((current) => ({ ...current, [key]: e.target.value }))}
                    />
                  </label>
                ))}
                <label style={labelStyle}>
                  Naloži fotografijo
                  <input
                    style={inputStyle}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleMemberImageChange(file);
                    }}
                  />
                </label>
                <label style={labelStyle}>
                  Kategorija
                  <select
                    style={inputStyle}
                    value={memberForm.isMentor ? "mentor" : "member"}
                    onChange={(e) => setMemberForm((current) => ({ ...current, isMentor: e.target.value === "mentor" }))}
                  >
                    <option value="member">Član</option>
                    <option value="mentor">Mentor</option>
                  </select>
                </label>
              </div>
              {memberForm.imageData && (
                <img
                  src={memberForm.imageData}
                  alt="Predogled fotografije člana"
                  style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 12 }}
                />
              )}
              <label style={labelStyle}>
                Kratek opis
                <textarea style={inputStyle} value={memberForm.shortBio} onChange={(e) => setMemberForm((current) => ({ ...current, shortBio: e.target.value }))} />
              </label>
              <label style={labelStyle}>
                Daljši opis
                <textarea style={inputStyle} value={memberForm.fullBio} onChange={(e) => setMemberForm((current) => ({ ...current, fullBio: e.target.value }))} />
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="admin-button admin-gold" type="submit">Shrani člana</button>
                <button className="admin-button admin-secondary" type="button" onClick={startNewMember}>Počisti</button>
              </div>
            </form>
            {members.filter((member) => member.name.toLocaleLowerCase("sl-SI").includes(memberSearch.toLocaleLowerCase("sl-SI"))).map((member) => (
              <div className="admin-event" key={member.slug}>
                <div>
                  <div style={{ color: "hsl(45 85% 65%)", fontSize: 12 }}>{member.isMentor ? "Mentor" : "Član"}</div>
                  <div style={{ fontSize: 16, fontWeight: 750 }}>{member.name}</div>
                  <div style={{ color: "hsl(220 8% 68%)", fontSize: 13 }}>{member.role}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="admin-button admin-secondary" type="button" onClick={() => editMember(member)}>Uredi</button>
                  <button className="admin-button admin-secondary" type="button" onClick={() => handleMemberDelete(member)} style={{ color: "hsl(0 75% 75%)", borderColor: "hsl(0 45% 35%)" }}>Izbriši</button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
