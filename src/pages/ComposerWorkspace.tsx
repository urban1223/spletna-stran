import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminSession, loginAdmin, logoutAdmin } from "@/lib/events-api";
import {
  backupComposerData,
  createComposer,
  deleteComposer,
  extractComposer,
  getComposerCatalog,
  getComposerSettings,
  getComposer,
  getComposers,
  updateComposer,
  updateComposerSettings,
  type ComposerCatalogItem,
  type ComposerSettings,
  type Composer,
  type ComposerEvent,
} from "@/lib/composers-api";

const emptyComposer = (): Composer => ({
  id: 0,
  slug: "",
  name: "",
  birthYear: null,
  deathYear: null,
  birthPlace: "",
  deathPlace: "",
  biography: "",
  sourceUrl: "",
  sourceText: "",
  status: "draft",
  events: [],
});

const eventTypes: ComposerEvent["type"][] = [
  "birth",
  "death",
  "education",
  "employment",
  "composition",
  "premiere",
  "travel",
  "award",
  "other",
];

const highlightSourceExcerpt = (source: string, excerpt: string, active: boolean) => {
  if (!excerpt.trim()) return source;
  const index = source.toLowerCase().indexOf(excerpt.trim().toLowerCase());
  if (index < 0) return source;
  return (
    <>
      {source.slice(0, index)}
      <mark className={active ? "bg-amber-300/90 text-black rounded px-0.5" : "bg-amber-200/40 rounded px-0.5"}>
        {source.slice(index, index + excerpt.trim().length)}
      </mark>
      {source.slice(index + excerpt.trim().length)}
    </>
  );
};

export default function ComposerWorkspace() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [composers, setComposers] = useState<Composer[]>([]);
  const [composer, setComposer] = useState<Composer>(emptyComposer);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");
  const [catalog, setCatalog] = useState<ComposerCatalogItem[]>([]);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ComposerSettings | null>(null);
  const [openAiKey, setOpenAiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [hoveredEventIndex, setHoveredEventIndex] = useState<number | null>(null);

  const filteredComposers = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return composers.filter((item) => !needle || item.name.toLowerCase().includes(needle));
  }, [composers, filter]);

  const reloadComposers = async () => {
    const list = await getComposers();
    setComposers(list);
  };

  useEffect(() => {
    getAdminSession()
      .then((session) => setAuthenticated(session.authenticated))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);
    Promise.all([reloadComposers(), getComposerCatalog(), getComposerSettings()])
      .then(async ([, catalogItems, composerSettings]) => {
        setCatalog(catalogItems);
        setSettings(composerSettings);
      })
      .then(async () => {
        const list = await getComposers();
        if (list.length) {
          const next = list.find((item) => item.status !== "complete") || list[0];
          setComposer(await getComposer(next.slug));
        }
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Napaka pri nalaganju"))
      .finally(() => setLoading(false));
  }, [authenticated]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await loginAdmin(username, password);
      setAuthenticated(true);
      setPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Prijava ni uspela");
    }
  };

  const selectComposer = async (slug: string) => {
    try {
      setLoading(true);
      setComposer(await getComposer(slug));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Skladatelja ni mogoče naložiti");
    } finally {
      setLoading(false);
    }
  };

  const createNewComposer = async () => {
    const name = window.prompt("Ime skladatelja:");
    if (!name?.trim()) return;
    try {
      setLoading(true);
      const { composer: created } = await createComposer({ name: name.trim(), status: "draft" });
      await reloadComposers();
      setComposer(await getComposer(created.slug));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Skladatelja ni mogoče ustvariti");
    } finally {
      setLoading(false);
    }
  };

  const runExtraction = async () => {
    if (!composer.name.trim()) {
      toast.error("Najprej vnesite ime skladatelja");
      return;
    }
    if (composer.sourceText.trim().length < 40) {
      toast.error("Prilepite krajšo ali daljšo biografijo");
      return;
    }
    setExtracting(true);
    try {
      const result = await extractComposer(composer.name, composer.sourceText);
      setComposer((current) => ({
        ...current,
        birthYear: result.birthYear,
        deathYear: result.deathYear,
        birthPlace: result.birthPlace,
        deathPlace: result.deathPlace,
        status: "in-progress",
        events: result.events.map((event, index) => ({ ...event, sortOrder: index })),
      }));
      toast.success(`Izvlečeno ${result.events.length} dogodkov (${result.provider})`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Izvlek ni uspel");
    } finally {
      setExtracting(false);
    }
  };

  const saveComposer = async () => {
    if (!composer.slug) return;
    setSaving(true);
    try {
      const { composer: saved } = await updateComposer(composer.slug, composer);
      setComposer(saved);
      await reloadComposers();
      toast.success("Shranjeno v SQLite");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Shranjevanje ni uspelo");
    } finally {
      setSaving(false);
    }
  };

  const createBackup = async () => {
    try {
      await backupComposerData();
      toast.success("Rezervna kopija ustvarjena");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Backup ni uspel");
    }
  };

  const importCatalogComposer = async (item: ComposerCatalogItem) => {
    try {
      setLoading(true);
      if (item.slug) {
        await selectComposer(item.slug);
        setCatalogOpen(false);
        return;
      }
      const { composer: created } = await createComposer({ name: item.name, status: "draft" });
      await reloadComposers();
      setComposer(await getComposer(created.slug));
      setCatalogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Uvoz skladatelja ni uspel");
    } finally {
      setLoading(false);
    }
  };

  const saveApiSettings = async () => {
    try {
      const nextSettings = await updateComposerSettings(openAiKey, geminiKey);
      setSettings(nextSettings);
      setOpenAiKey("");
      setGeminiKey("");
      toast.success("API nastavitve so shranjene");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nastavitve niso shranjene");
    }
  };

  const removeComposer = async () => {
    if (!composer.slug || !window.confirm(`Izbrišem ${composer.name}?`)) return;
    try {
      await deleteComposer(composer.slug);
      await reloadComposers();
      setComposer(emptyComposer());
      toast.success("Skladatelj izbrisan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Brisanje ni uspelo");
    }
  };

  const updateEvent = (index: number, patch: Partial<ComposerEvent>) => {
    setComposer((current) => ({
      ...current,
      events: (current.events || []).map((event, eventIndex) => (eventIndex === index ? { ...event, ...patch } : event)),
    }));
  };

  const moveToNext = async () => {
    await saveComposer();
    const currentIndex = composers.findIndex((item) => item.slug === composer.slug);
    const next = composers
      .slice(currentIndex + 1)
      .find((item) => item.status !== "complete") ||
      composers.find((item) => item.status !== "complete");
    if (next && next.slug !== composer.slug) await selectComposer(next.slug);
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLower === "s") {
        event.preventDefault();
        void saveComposer();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        void runExtraction();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (authLoading) {
    return <div className="container mx-auto px-4 py-24 text-muted-foreground">Preverjanje prijave…</div>;
  }

  if (!authenticated) {
    return (
      <div className="min-h-[70vh] px-4 py-20 flex items-center justify-center">
        <Seo title="Urejanje skladateljev" path="/admin-skladatelji" />
        <Card className="w-full max-w-md p-6">
          <h1 className="text-2xl font-bold mb-5">Prijava v delovni prostor</h1>
          <form onSubmit={login} className="space-y-4">
            <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Uporabniško ime" />
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Geslo" />
            <Button type="submit" className="w-full">Prijava</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 py-6 md:px-5">
      <Seo title="Delovni prostor skladateljev" path="/admin-skladatelji" />
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold md:text-2xl">Skladatelji — hitro urejanje</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={createBackup}>Backup</Button>
          <Button variant="outline" onClick={() => setCatalogOpen((open) => !open)}>Uvozi skladatelja</Button>
          <Button variant="outline" onClick={() => setSettingsOpen((open) => !open)}>API ključi</Button>
          <Button variant="outline" onClick={async () => { await logoutAdmin(); setAuthenticated(false); }}>Odjava</Button>
        </div>
      </div>

      {settingsOpen && (
        <Card className="p-4 mb-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[260px] flex-1">
              <label className="text-sm">OpenAI API ključ
                <Input type="password" value={openAiKey} onChange={(event) => setOpenAiKey(event.target.value)} placeholder={settings?.openAiKeyMasked || "sk-..."} />
              </label>
            </div>
            <div className="min-w-[260px] flex-1">
              <label className="text-sm">Gemini API ključ
                <Input type="password" value={geminiKey} onChange={(event) => setGeminiKey(event.target.value)} placeholder={settings?.geminiKeyMasked || "AIza..."} />
              </label>
            </div>
            <Button onClick={saveApiSettings}>Shrani ključe</Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Trenutni ponudnik: {settings?.provider === "openai" ? "OpenAI" : settings?.provider === "gemini" ? "Gemini" : "ni nastavljen"}.
            Ključ se v SQLite shrani šifrirano. Prazno polje ob obstoječem ključu ne izbriše ključa.
          </p>
        </Card>
      )}

      {catalogOpen && (
        <Card className="p-4 mb-3">
          <div className="flex flex-wrap gap-2">
            {catalog.map((item) => (
              <Button
                key={item.slug || item.name}
                variant={item.slug ? "secondary" : "outline"}
                onClick={() => void importCatalogComposer(item)}
              >
                {item.name}{item.slug ? " · uvožen" : ""}
              </Button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(320px,0.9fr)_minmax(420px,1.1fr)] gap-3">
        <Card className="p-3 h-fit lg:sticky lg:top-24">
          <Button className="w-full mb-3" onClick={createNewComposer}>+ Nov skladatelj</Button>
          <Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Išči skladatelja…" className="mb-3" />
          <div className="space-y-1 max-h-[70vh] overflow-auto">
            {filteredComposers.map((item) => (
              <button
                type="button"
                key={item.slug}
                onClick={() => void selectComposer(item.slug)}
                className={`w-full text-left rounded px-3 py-2 border transition ${composer.slug === item.slug ? "border-accent bg-accent/10" : "border-transparent hover:bg-muted"}`}
              >
                <span className="block font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.status} · {item.eventCount || 0} dogodkov</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <label className="col-span-2 text-sm">
              Ime
              <Input value={composer.name} onChange={(event) => setComposer((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label className="text-sm">
              Rojstvo
              <Input type="number" value={composer.birthYear ?? ""} onChange={(event) => setComposer((current) => ({ ...current, birthYear: event.target.value ? Number(event.target.value) : null }))} />
            </label>
            <label className="text-sm">
              Smrt
              <Input type="number" value={composer.deathYear ?? ""} onChange={(event) => setComposer((current) => ({ ...current, deathYear: event.target.value ? Number(event.target.value) : null }))} />
            </label>
            <label className="text-sm">
              Kraj rojstva
              <Input value={composer.birthPlace} onChange={(event) => setComposer((current) => ({ ...current, birthPlace: event.target.value }))} />
            </label>
            <label className="text-sm">
              Kraj smrti
              <Input value={composer.deathPlace} onChange={(event) => setComposer((current) => ({ ...current, deathPlace: event.target.value }))} />
            </label>
            <label className="col-span-2 text-sm">
              Vir / URL
              <Input value={composer.sourceUrl} onChange={(event) => setComposer((current) => ({ ...current, sourceUrl: event.target.value }))} />
            </label>
            <label className="col-span-2 text-sm">
              Status
              <select
                value={composer.status}
                onChange={(event) => setComposer((current) => ({ ...current, status: event.target.value as Composer["status"] }))}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="draft">Osnutek</option>
                <option value="in-progress">V delu</option>
                <option value="review">Pregled</option>
                <option value="complete">Končano</option>
              </select>
            </label>
          </div>
          <Textarea
            className="mt-3 min-h-[440px]"
            value={composer.sourceText}
            onChange={(event) => setComposer((current) => ({ ...current, sourceText: event.target.value }))}
            placeholder="Sem prilepite celotno biografijo ali besedilo vira…"
          />
          {composer.sourceText && (
            <Card className="mt-3 p-3 max-h-[300px] overflow-auto">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Označen izvor · hover nad dogodkom</p>
              <p className="whitespace-pre-wrap leading-7 text-sm">
                {hoveredEventIndex !== null
                  ? highlightSourceExcerpt(
                      composer.sourceText,
                      (composer.events || [])[hoveredEventIndex]?.sourceExcerpt || "",
                      true,
                    )
                  : composer.sourceText}
              </p>
            </Card>
          )}
          <p className="mt-2 text-xs text-muted-foreground">Ctrl/⌘ + Enter izvleče dogodke · Ctrl/⌘ + S shrani</p>
        </Card>

        <Card className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={runExtraction} disabled={extracting || loading}>
              {extracting ? "Izvlečno…" : "Izvleci dogodke"}
            </Button>
            <Button variant="outline" onClick={saveComposer} disabled={saving || !composer.slug}>
              {saving ? "Shranjujem…" : "Shrani"}
            </Button>
            <Button variant="secondary" onClick={moveToNext} disabled={!composer.slug}>
              Shrani in naslednji
            </Button>
            <Button variant="destructive" onClick={removeComposer} disabled={!composer.slug}>Izbriši</Button>
          </div>

          <div className="space-y-3 max-h-[72vh] overflow-auto pr-1">
            {(composer.events || []).map((event, index) => (
              <Card
                key={index}
                className={`p-3 transition ${hoveredEventIndex === index ? "ring-2 ring-amber-400" : ""}`}
                onMouseEnter={() => setHoveredEventIndex(index)}
                onMouseLeave={() => setHoveredEventIndex(null)}
              >
                <div className="grid grid-cols-2 md:grid-cols-[130px_80px_1fr] gap-2">
                  <select
                    value={event.type}
                    onChange={(input) => updateEvent(index, { type: input.target.value as ComposerEvent["type"] })}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {eventTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <Input
                    type="number"
                    value={event.year ?? ""}
                    onChange={(input) => updateEvent(index, { year: input.target.value ? Number(input.target.value) : null })}
                    placeholder="leto"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={event.verified}
                      onChange={(input) => updateEvent(index, { verified: input.target.checked })}
                    />
                    preverjeno
                  </label>
                  <Input value={event.dateText} onChange={(input) => updateEvent(index, { dateText: input.target.value })} placeholder="Datum" />
                  <Input value={event.place} onChange={(input) => updateEvent(index, { place: input.target.value })} placeholder="Kraj" className="md:col-span-2" />
                  <Input value={event.title} onChange={(input) => updateEvent(index, { title: input.target.value })} placeholder="Naslov / delo" className="md:col-span-3" />
                  <Textarea value={event.description} onChange={(input) => updateEvent(index, { description: input.target.value })} placeholder="Opis" className="md:col-span-3 min-h-[70px]" />
                  <Textarea value={event.sourceExcerpt} onChange={(input) => updateEvent(index, { sourceExcerpt: input.target.value })} placeholder="Izsek iz vira" className="md:col-span-3 min-h-[55px]" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs ${event.confidence === "high" ? "text-green-600" : event.confidence === "low" ? "text-red-600" : "text-amber-600"}`}>
                    Zanesljivost: {event.confidence}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setComposer((current) => ({
                      ...current,
                      events: (current.events || []).filter((_, eventIndex) => eventIndex !== index),
                    }))}
                  >
                    Odstrani
                  </Button>
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setComposer((current) => ({
                ...current,
                events: [...(current.events || []), {
                  type: "other",
                  year: null,
                  yearEnd: null,
                  dateText: "",
                  place: "",
                  title: "",
                  description: "",
                  sourceExcerpt: "",
                  confidence: "medium",
                  verified: false,
                  sortOrder: (current.events || []).length,
                }],
              }))}
            >
              + Dodaj dogodek ročno
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
