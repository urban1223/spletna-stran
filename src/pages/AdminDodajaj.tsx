import { useMemo, useState, type FormEvent, type CSSProperties } from "react";

type ConcertForm = {
  title: string;
  date: string;
  time: string;
  location: string;
  composers: string;
  conductor: string;
  admission: string;
  cta: string;
  link: string;
  reservation: boolean;
};

const initialForm: ConcertForm = {
  title: "",
  date: "",
  time: "19:30",
  location: "",
  composers: "",
  conductor: "",
  admission: "Vstop prost!",
  cta: "",
  link: "",
  reservation: false,
};

const slugify = (value: string) =>
  value
    .toLocaleLowerCase("sl-SI")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Prva, lokalna različica obrazca za dodajanje koncertov.
 * Trenutno samo preveri podatke in pokaže predogled — še ne objavlja na GitHub.
 */
const EXISTING_LOCATIONS = [
  "DSO Pristan, Vipava",
  "Župnijska cerkev sv. štefana, Vipava",
  "Cerkev sv. Jakoba, Ljubljana",
  "Župnijska cerkev sv. Petra, Radovljica",
  "Stolna cerkev, Maribor",
  "Staro mestno jedro Kranja",
  "Cerkev sv. Jožefa, Ljubljana",
  "Evangeličanska cerkev Primoža Trubarja, Ljubljana",
  "Baročna dvorana, Radovljica",
  "Atrij ZRC SAZU, Ljubljana",
  "Župnijska cerkev sv. Marije Vnebovzete, Pirniče",
  "Atrij Pretorske palače, Koper",
  "Cerkev sv. Petra, Radovljica",
  "Stolnica sv. Nikolaja, Ljubljana",
  "Cerkev Marije pomočnice na Rakovniku, Ljubljana",
  "Cerkev sv. Kancijana in tovarišev, Kranj",
  "Cerkev sv. Antona Padovanskega, Ljubljana",
  "Uršulinska cerkev Sv. Trojice, Ljubljana",
  "Dvorana Gimnazije Kranj",
  "Cerkev svetega Kancijana in tovarišev, Kranj",
  "Cerkev Svetega Petra, Ilirska Bistrica",
];

const EXISTING_COMPOSERS = [
  "J. van Eyck", "G. P. Telemann", "G.P. Telemann", "G. Händel", "G.F. Händel",
  "J. M. Hotteterre", "J. S. Bach", "J.S. Bach", "W. A. Mozart", "D. Buxtehude",
  "G. Ph. Telemann", "J. D. Zelenka", "J. Gallus", "J. K. Dolar",
  "M. A. Charpentier", "A. Vivaldi", "M. Zahnhausen", "P. A. Locatelli",
  "A. Lotti", "J. J. Quantz", "G. Tartini", "G. B. Fontana", "W. Byrd",
  "T. Morley", "A. Corelli", "I. Posch", "J. L. Bach", "C. P. E. Bach",
];

const mergeSuggestions = (defaults: string[], saved: string[]) =>
  [...defaults, ...saved.filter((item) => !defaults.some((known) => known.toLocaleLowerCase("sl-SI") === item.toLocaleLowerCase("sl-SI")))];

const readSuggestions = (key: string): string[] => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
};

const rememberSuggestion = (key: string, value: string) => {
  const cleaned = value.trim();
  if (!cleaned) return;
  const current = readSuggestions(key);
  const updated = [cleaned, ...current.filter((item) => item.toLocaleLowerCase("sl-SI") !== cleaned.toLocaleLowerCase("sl-SI"))].slice(0, 30);
  localStorage.setItem(key, JSON.stringify(updated));
};

/**
 * Historical venue and composer suggestions are seeded from the current concert
 * archive. New entries are also remembered in this browser for future use.
 */
export default function AdminDodajaj() {
  const [form, setForm] = useState<ConcertForm>(initialForm);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>(() => mergeSuggestions(EXISTING_LOCATIONS, readSuggestions("nova-akademija-admin-locations")));
  const [composerSuggestions, setComposerSuggestions] = useState<string[]>(() => mergeSuggestions(EXISTING_COMPOSERS, readSuggestions("nova-akademija-admin-composers")));
  const [notice, setNotice] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [composerInputFocused, setComposerInputFocused] = useState(false);
  const slug = useMemo(() => slugify(form.title), [form.title]);

  const update = (key: keyof ConcertForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setNotice("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowPreview(true);
    try {
      rememberSuggestion("nova-akademija-admin-locations", form.location);
      form.composers.split(",").forEach((composer) => rememberSuggestion("nova-akademija-admin-composers", composer));
      setLocationSuggestions(mergeSuggestions(EXISTING_LOCATIONS, readSuggestions("nova-akademija-admin-locations")));
      setComposerSuggestions(mergeSuggestions(EXISTING_COMPOSERS, readSuggestions("nova-akademija-admin-composers")));
    } catch {
      // Preview still works if browser storage is unavailable.
    }
    setNotice(
      "Predogled je pripravljen. To je testna različica: koncert še ni shranjen na GitHub in ni objavljen na spletni strani."
    );
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    borderRadius: 10,
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
    options: { required?: boolean; placeholder?: string; type?: string; multiline?: boolean; step?: number; suggestions?: string[]; listId?: string } = {}
  ) => (
    <label style={labelStyle}>
      <span>{label}{options.required ? " *" : ""}</span>
      {options.multiline ? (
        <textarea
          value={String(form[key])}
          onChange={(e) => update(key, e.target.value)}
          placeholder={options.placeholder}
          required={options.required}
          rows={4}
          style={{ ...inputStyle, resize: "vertical", minHeight: 105 }}
        />
      ) : (
        <input
          type={options.type ?? "text"}
          value={String(form[key])}
          onChange={(e) => update(key, e.target.value)}
          placeholder={options.placeholder}
          required={options.required}
          step={options.step}
          list={options.listId}
          style={inputStyle}
        />
      )}
      {options.listId && options.suggestions && (
        <datalist id={options.listId}>
          {options.suggestions.map((suggestion) => <option value={suggestion} key={suggestion} />)}
        </datalist>
      )}
    </label>
  );

  return (
    <main className="admin-concerts" style={{ minHeight: "100vh", background: "hsl(220 25% 8%)", color: "hsl(40 15% 92%)", padding: "28px 16px 56px", fontFamily: "inherit" }}>
      <style>{`
        .admin-concerts * { box-sizing: border-box; }
        .admin-concerts .admin-wrap { max-width: 880px; margin: 0 auto; }
        .admin-concerts .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .admin-concerts .admin-card { background: hsl(220 20% 12%); border: 1px solid hsl(220 20% 22%); border-radius: 16px; padding: 22px; }
        .admin-concerts .admin-full { grid-column: 1 / -1; }
        .admin-concerts .admin-button { border: 0; border-radius: 10px; padding: 13px 18px; font: inherit; font-weight: 750; cursor: pointer; }
        .admin-concerts .admin-button:focus-visible { outline: 3px solid hsl(45 85% 65%); outline-offset: 3px; }
        .admin-concerts .admin-gold { background: hsl(45 85% 65%); color: hsl(220 35% 12%); }
        .admin-concerts .admin-secondary { background: hsl(220 20% 18%); color: hsl(40 15% 92%); border: 1px solid hsl(220 20% 27%); }
        .admin-concerts .admin-check { display: flex; gap: 10px; align-items: center; font-size: 14px; }
        .admin-concerts .admin-check input { width: 18px; height: 18px; accent-color: hsl(45 85% 65%); }
        @media (max-width: 620px) {
          .admin-concerts { padding: 18px 12px 36px !important; }
          .admin-concerts .admin-grid { grid-template-columns: 1fr; gap: 14px; }
          .admin-concerts .admin-card { padding: 17px; }
          .admin-concerts .admin-full { grid-column: auto; }
          .admin-concerts .admin-actions { display: grid !important; grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="admin-wrap">
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: "hsl(45 85% 65%)", textTransform: "uppercase", letterSpacing: ".16em", fontSize: 11, fontWeight: 800, marginBottom: 10 }}>NOVA AKADEMIJA · ADMIN</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", lineHeight: 1.1, margin: "0 0 10px", fontWeight: 750 }}>Dodaj koncert</h1>
          <p style={{ margin: 0, color: "hsl(220 8% 68%)", lineHeight: 1.6, maxWidth: 620 }}>Izpolni podatke o dogodku. Polja z zvezdico so obvezna. Na tej stopnji lahko obrazec preizkusiš lokalno, brez sprememb na objavljeni spletni strani.</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-card" style={{ display: "grid", gap: 22 }}>
          <section>
            <h2 style={{ margin: "0 0 16px", fontSize: 17 }}>Osnovni podatki</h2>
            <div className="admin-grid">
              {field("Naslov koncerta", "title", { required: true, placeholder: "Npr. Večer klasične glasbe" })}
              {field("Prizorišče / lokacija", "location", { required: true, placeholder: "Začni pisati ali izberi prejšnji vnos", listId: "admin-location-suggestions", suggestions: locationSuggestions })}
              {field("Datum", "date", { required: true, type: "date" })}
              {field("Ura", "time", { required: true, type: "time", step: 900 })}
              <p className="admin-full" style={{ margin: "-4px 0 0", color: "hsl(220 8% 65%)", fontSize: 12, lineHeight: 1.5 }}>Privzeto je nastavljena ura 19.30. Uro lahko spremeniš v korakih po 15 minut (npr. 19.45 ali 20.00).</p>
              <div className="admin-full" style={{ display: "grid", gap: 7 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Povezava (slug) — ustvari se samodejno</div>
                <div style={{ border: "1px solid hsl(220 20% 22%)", background: "hsl(220 20% 10%)", borderRadius: 10, padding: "12px 13px", color: slug ? "hsl(45 85% 65%)" : "hsl(220 8% 55%)", overflowWrap: "anywhere" }}>{slug || "naslov-koncertа"}</div>
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ margin: "0 0 16px", fontSize: 17 }}>Izvajalci in vstopnina</h2>
            <div className="admin-grid">
              <div style={{ position: "relative" }}>
                <label style={labelStyle}>
                  <span>Skladatelji</span>
                  <input
                    type="text"
                    value={form.composers}
                    placeholder="Izberi ali vpiši skladatelja"
                    autoComplete="off"
                    onFocus={() => setComposerInputFocused(true)}
                    onBlur={() => window.setTimeout(() => setComposerInputFocused(false), 150)}
                    onChange={(e) => update("composers", e.target.value)}
                    style={inputStyle}
                    aria-label="Skladatelji, ločeni z vejico"
                  />
                </label>
                {composerInputFocused && (() => {
                  const parts = form.composers.split(",");
                  const current = (parts[parts.length - 1] ?? "").trim().toLocaleLowerCase("sl-SI");
                  const matches = composerSuggestions.filter((item) => !current || item.toLocaleLowerCase("sl-SI").includes(current)).slice(0, 8);
                  return matches.length ? (
                    <div role="listbox" aria-label="Predlogi skladateljev" style={{ position: "absolute", zIndex: 10, top: "100%", left: 0, right: 0, marginTop: 4, maxHeight: 220, overflowY: "auto", border: "1px solid hsl(220 20% 27%)", borderRadius: 10, background: "hsl(220 20% 12%)", boxShadow: "0 10px 24px #0006" }}>
                      {matches.map((composer) => (
                        <button
                          key={composer}
                          type="button"
                          role="option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            const prefix = parts.slice(0, -1).map((part) => part.trim()).filter(Boolean);
                            if (!prefix.some((part) => part.toLocaleLowerCase("sl-SI") === composer.toLocaleLowerCase("sl-SI"))) prefix.push(composer);
                            update("composers", `${prefix.join(", ")}, `);
                            setComposerInputFocused(true);
                            document.querySelector<HTMLInputElement>('input[aria-label="Skladatelji, ločeni z vejico"]')?.focus();
                          }}
                          style={{ display: "block", width: "100%", textAlign: "left", border: 0, borderBottom: "1px solid hsl(220 20% 20%)", padding: "10px 12px", background: "transparent", color: "hsl(40 15% 92%)", cursor: "pointer", font: "inherit" }}
                        >{composer}</button>
                      ))}
                    </div>
                  ) : null;
                })()}
                <p style={{ margin: "7px 0 0", color: "hsl(220 8% 68%)", fontSize: 12, lineHeight: 1.6 }}>Po vsakem skladatelju dodaj vejico. Nato se lahko prikažejo predlogi za naslednjega. Nove vnose si obrazec zapomni v tem brskalniku.</p>
              </div>
              {field("Dirigent / izvajalci", "conductor", { placeholder: "Neobvezno" })}
              {field("Vstopnina", "admission", { placeholder: "Vstop prost!" })}
            </div>
          </section>

          <section>
            <h2 style={{ margin: "0 0 16px", fontSize: 17 }}>Povezava in rezervacije</h2>
            <div className="admin-grid">
              {field("Besedilo gumba", "cta", { placeholder: "Npr. Rezerviraj vstopnice" })}
              {field("Spletna povezava gumba", "link", { type: "url", placeholder: "https://..." })}
              <div className="admin-full">
                <label className="admin-check">
                  <input type="checkbox" checked={form.reservation} onChange={(e) => update("reservation", e.target.checked)} />
                  Za ta koncert uporabimo obrazec za rezervacije na spletni strani
                </label>
              </div>
            </div>
          </section>

          <div className="admin-actions" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", borderTop: "1px solid hsl(220 20% 22%)", paddingTop: 20 }}>
            <button className="admin-button admin-gold" type="submit">Pripravi predogled</button>
            <button className="admin-button admin-secondary" type="button" onClick={() => { setForm(initialForm); setShowPreview(false); setNotice(""); }}>Počisti obrazec</button>
          </div>
          {notice && <div role="status" style={{ border: "1px solid hsl(45 60% 35%)", background: "hsl(45 35% 13%)", color: "hsl(45 85% 75%)", borderRadius: 10, padding: 14, lineHeight: 1.5 }}>{notice}</div>}
        </form>

        {showPreview && (
          <section className="admin-card" style={{ marginTop: 18 }}>
            <div style={{ color: "hsl(45 85% 65%)", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", marginBottom: 10 }}>PREDOGLED PODATKOV</div>
            <h2 style={{ margin: "0 0 12px", fontSize: 24 }}>{form.title || "Brez naslova"}</h2>
            <p style={{ color: "hsl(220 8% 70%)", margin: "0 0 14px", lineHeight: 1.6 }}>{form.date} {form.time && `· ${form.time}`} {form.location && `· ${form.location}`}</p>
            {form.composers && <p><strong>Skladatelji:</strong> {form.composers}</p>}
            {form.conductor && <p><strong>Dirigent / izvajalci:</strong> {form.conductor}</p>}
            {form.admission && <p><strong>Vstopnina:</strong> {form.admission}</p>}
            <p style={{ color: "hsl(45 85% 65%)", overflowWrap: "anywhere" }}>Slug: {slug || "—"}</p>
            <details style={{ marginTop: 16 }}>
              <summary style={{ cursor: "pointer", color: "hsl(220 8% 72%)" }}>Pokaži podatke kot JSON</summary>
              <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 12, lineHeight: 1.5, background: "hsl(220 20% 9%)", padding: 14, borderRadius: 10, marginTop: 10 }}>{JSON.stringify({ title: form.title, slug, date: form.date, isoDate: form.date, time: form.time, location: form.location, program: form.composers, conductor: form.conductor, admission: form.admission, cta: form.cta, link: form.link, reservation: form.reservation, past: false }, null, 2)}</pre>
            </details>
          </section>
        )}
        <p style={{ textAlign: "center", color: "hsl(220 8% 55%)", fontSize: 12, marginTop: 22 }}>Lokalni test · še ni povezano z GitHubom</p>
      </div>
    </main>
  );
}
