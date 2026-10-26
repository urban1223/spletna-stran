import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getCookieConsent, setCookieConsent, type CookieConsent } from "@/lib/cookies";

const CookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsent | null>(() => getCookieConsent());
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const openSettings = () => setSettingsOpen(true);
    window.addEventListener("open-cookie-settings", openSettings);
    return () => window.removeEventListener("open-cookie-settings", openSettings);
  }, []);

  const saveConsent = (value: CookieConsent) => {
    setCookieConsent(value);
    setConsent(value);
    setSettingsOpen(false);
  };

  if (consent && !settingsOpen) return null;

  return (
    <aside
      role="dialog"
      aria-label="Nastavitve piškotkov"
      className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-3xl rounded-lg border border-border bg-card p-5 shadow-2xl"
    >
      <h2 className="mb-2 text-lg font-bold text-accent">Piškotki in zasebnost</h2>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Uporabljamo nujne sej­ne piškotke za delovanje strani in izbiro članov na prvi strani.
        Analitični in trženjski piškotki so privzeto izklopljeni. Več informacij je v{" "}
        <a className="text-accent underline" href="/zasebnost">politiki zasebnosti</a> in{" "}
        <a className="text-accent underline" href="/piskotki">politiki piškotkov</a>.
      </p>
      {settingsOpen && (
        <div className="mb-4 rounded border border-border bg-background p-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <strong>Nujni piškotki</strong>
              <p className="mt-1 text-muted-foreground">Vedno aktivni; potrebni za sejo, soglasje in osnovno delovanje strani.</p>
            </div>
            <span className="text-accent">Vedno aktivni</span>
          </div>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <strong>Analitika in trženje</strong>
              <p className="mt-1 text-muted-foreground">Trenutno ni aktivnih analitičnih ali trženjskih skript.</p>
            </div>
            <span className="text-muted-foreground">Izklopljeno</span>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => saveConsent("necessary")}>Samo nujni</Button>
        <Button onClick={() => saveConsent("all")} className="bg-accent text-accent-foreground hover:bg-accent/90">Sprejmi vse</Button>
        {!settingsOpen && <Button variant="ghost" onClick={() => setSettingsOpen(true)}>Nastavitve</Button>}
        {settingsOpen && <Button variant="ghost" onClick={() => saveConsent("necessary")}>Shrani izbiro</Button>}
      </div>
    </aside>
  );
};

export default CookieConsent;
