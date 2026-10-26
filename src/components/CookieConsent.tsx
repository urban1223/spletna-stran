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
      className="fixed inset-x-0 bottom-0 z-[100] w-full border-t border-border bg-card p-4 shadow-2xl sm:p-5"
    >
      <h2 className="mb-2 text-lg font-bold text-accent">Piškotki in zasebnost</h2>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Za pravilno delovanje uporabljamo nujne tehnične podatke. Google Analytics uporabljamo samo za anonimno statistiko obiska in ga vključimo šele, ko to dovolite. Izbiro lahko kadar koli spremenite na strani. Več informacij je v{" "}
        <a className="text-accent underline" href="/zasebnost">politiki zasebnosti</a> in{" "}
        <a className="text-accent underline" href="/piskotki">politiki piškotkov</a>.
      </p>
      {settingsOpen && (
        <div className="mb-4 rounded border border-border bg-background p-3 text-sm">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:gap-4">
            <div>
              <strong>Nujni piškotki</strong>
              <p className="mt-1 text-muted-foreground">Vedno aktivni; potrebni za sejo, soglasje in osnovno delovanje strani.</p>
            </div>
            <span className="text-accent">Vedno aktivni</span>
          </div>
          <div className="mt-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:gap-4">
            <div>
              <strong>Analitika in trženje</strong>
              <p className="mt-1 text-muted-foreground">Google Analytics 4 se naloži samo po soglasju; trženjskih skript ne uporabljamo.</p>
            </div>
            <span className="text-muted-foreground">Izklopljeno</span>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button className="w-full sm:w-auto" variant="outline" onClick={() => saveConsent("necessary")}>Samo nujni</Button>
        <Button className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => saveConsent("all")}>Sprejmi vse</Button>
        {!settingsOpen && <Button className="w-full sm:w-auto" variant="ghost" onClick={() => setSettingsOpen(true)}>Nastavitve</Button>}
        {settingsOpen && <Button className="w-full sm:w-auto" variant="ghost" onClick={() => saveConsent("necessary")}>Shrani izbiro</Button>}
      </div>
    </aside>
  );
};

export default CookieConsent;
