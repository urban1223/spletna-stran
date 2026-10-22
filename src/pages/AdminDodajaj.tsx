import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import type { Event } from "@/data/events-data";
import { deleteEvent, getAdminSession, getEvents, loginAdmin, logoutAdmin, saveEvent } from "@/lib/events-api";

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

  useEffect(() => {
    getAdminSession()
      .then((session) => {
        setAuthenticated(session.authenticated);
        if (session.authenticated) return getEvents().then(setEvents);
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
      .sort((a, b) => (b.isoDate || "").localeCompare(a.isoDate || ""));
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
        return getEvents().then(setEvents);
      })
      .catch((error: Error) => setLoginError(error.message || "Prijava ni uspela."));
  };

  const handleLogout = () => {
    logoutAdmin().finally(() => {
      setAuthenticated(false);
      setEvents([]);
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
            <button className="admin-button admin-gold" type="button" onClick={startNew}>
              + Nov koncert
            </button>
          </div>
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

        {showPreview && (
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
      </div>
    </main>
  );
}
