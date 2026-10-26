import Seo from "@/components/Seo";
import { openCookieSettings } from "@/lib/cookies";
import type { ReactNode } from "react";

const legal = {
  name: "Društvo za širjenje stare glasbe Nova akademija",
  shortName: "Društvo Nova akademija",
  address: "Voduškova ulica 22, 1000 Ljubljana",
  registration: "Matična številka: 2944324000; davčna številka: 85814229 (društvo ni davčni zavezanec)",
  email: "info.nova.akademija@gmail.com",
};

export const Terms = () => (
  <LegalLayout title="Pogoji uporabe" path="/pogoji-uporabe">
    <p>Ti pogoji urejajo uporabo spletnega mesta društva {legal.name}.</p>
    <h2>1. Upravljavec</h2>
    <p>{legal.name}, {legal.address}. {legal.registration}. Kontakt: <a href={`mailto:${legal.email}`}>{legal.email}</a>.</p>
    <h2>2. Uporaba vsebin</h2>
    <p>Vsebine so namenjene splošnemu obveščanju o društvu, koncertih, članih, projektih in galerijah. Društvo si prizadeva za točnost podatkov, vendar se lahko programi, termini in lokacije spremenijo. Pred obiskom dogodka preverite najnovejše objave.</p>
    <h2>3. Avtorske pravice</h2>
    <p>Besedila, fotografije, grafike in druga vsebina so zaščiteni z veljavnimi predpisi. Kopiranje, javna objava ali druga uporaba brez dovoljenja imetnika pravic ni dovoljena, razen v obsegu, ki ga dovoljuje zakon.</p>
    <h2>4. Zunanje povezave in obrazci</h2>
    <p>Spletno mesto vsebuje povezave do storitev tretjih oseb, vključno z YouTube, Instagram, Facebook in Web3Forms. Za njihovo vsebino in obdelavo podatkov veljajo njihovi pogoji in politike zasebnosti.</p>
    <h2>5. Omejitev odgovornosti</h2>
    <p>Društvo ne odgovarja za začasno nedostopnost strani, napake zunanjih storitev ali škodo, ki bi nastala zaradi uporabe informacij, če zakon ne določa drugače.</p>
    <h2>6. Spremembe</h2>
    <p>Društvo lahko pogoje posodobi. Velja različica, objavljena na tej strani.</p>
  </LegalLayout>
);

export const Privacy = () => (
  <LegalLayout title="Politika zasebnosti" path="/zasebnost">
    <p>Ta politika pojasnjuje, kako {legal.shortName} obdeluje osebne podatke obiskovalcev spletnega mesta.</p>
    <h2>1. Upravljavec in kontakt</h2>
    <p>Upravljavec je {legal.name}, {legal.address}. Za vprašanja in zahteve glede osebnih podatkov pišite na <a href={`mailto:${legal.email}`}>{legal.email}</a>. Kontaktna oseba za varstvo podatkov je Urban Klančar.</p>
    <h2>2. Katere podatke obdelujemo</h2>
    <p>Pri kontaktnih, prijavnih in rezervacijskih obrazcih lahko obdelujemo ime, e-poštni naslov, telefonsko številko, vsebino sporočila in podatke, ki jih prostovoljno vnesete. Strežnik lahko zaradi varnosti in delovanja beleži tehnične podatke, kot so čas zahtevka, IP-naslov in uporabniški agent.</p>
    <h2>3. Nameni in pravne podlage</h2>
    <p>Podatke uporabljamo za odgovor na povpraševanje, obdelavo prijave ali rezervacije, organizacijo članstva ter zagotavljanje varnosti strani. Pravna podlaga je izvedba zahteve uporabnika, zakoniti interes za varnost oziroma privolitev, kadar jo zahteva zakon.</p>
    <h2>4. Prejemniki in prenosi</h2>
    <p>Obrazci uporabljajo Web3Forms, zato se podatki, poslani prek obrazcev, lahko obdelujejo pri tem ponudniku. Stran vsebuje povezave do YouTube, Instagram in Facebook. Zunanje storitve uporabljajte skladno z njihovimi politikami zasebnosti. Google Analytics 4 se uporablja samo po izrecnem soglasju za analitične piškotke.</p>
    <h2>5. Hramba in pravice</h2>
    <p>Podatke hranimo toliko časa, kolikor je potrebno za namen, zaradi katerega so bili zbrani, oziroma kolikor zahtevajo predpisi. Zahtevate lahko dostop, popravek, izbris, omejitev obdelave, ugovor ali prenosljivost, kadar so pogoji izpolnjeni. Zahtevo pošljite na {legal.email}. Pravico imate tudi do pritožbe pri Informacijskem pooblaščencu Republike Slovenije.</p>
    <h2>6. Fotografije članov</h2>
    <p>Fotografije članov in mentorjev so objavljene za predstavitev dejavnosti društva na podlagi ustreznega dovoljenja oziroma druge veljavne pravne podlage. Za vprašanja glede posamezne fotografije nas kontaktirajte.</p>
  </LegalLayout>
);

export const Cookies = () => (
  <LegalLayout title="Politika piškotkov" path="/piskotki">
    <p>Piškotki so majhne datoteke, ki jih spletno mesto shrani v brskalnik. Soglasje lahko kadar koli spremenite s klikom na gumb za nastavitve piškotkov.</p>
    <h2>Nujni piškotki</h2>
    <p><code>nova_cookie_consent</code> si zapomni vašo izbiro soglasja do enega leta. Sejni piškotek <code>nova_home_members</code> si zapomni naključni izbor članov na domači strani do konca seje brskalnika. Piškotek <code>sidebar_state</code> si zapomni stanje stranskega menija. Ti piškotki so potrebni za zahtevano delovanje strani.</p>
    <h2>Analitični in trženjski piškotki</h2>
    <p>Po vašem izrecnem soglasju uporabljamo Google Analytics 4 za merjenje ogledov strani, navigacije in izbranih dogodkov. Google Analytics uporablja analitične piškotke, ki se ne naložijo, če izberete samo nujne piškotke. Trženjskih piškotkov trenutno ne uporabljamo.</p>
    <h2>Upravljanje soglasja</h2>
    <p>Izberete lahko samo nujne piškotke ali sprejmete vse trenutno uporabljene kategorije. Nastavitve lahko ponovno odprete tukaj:</p>
    <button className="text-accent underline" onClick={openCookieSettings}>Odpri nastavitve piškotkov</button>
  </LegalLayout>
);

const LegalLayout = ({ title, path, children }: { title: string; path: string; children: ReactNode }) => (
  <div className="min-h-screen py-20">
    <Seo title={title} path={path} />
    <article className="container mx-auto max-w-3xl px-4 text-muted-foreground leading-relaxed">
      <h1 className="mb-10 text-center text-4xl font-bold text-accent">{title}</h1>
      <div className="space-y-5 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_a]:text-accent [&_a]:underline">{children}</div>
      <p className="mt-10 border-t border-border pt-5 text-sm">Zadnja posodobitev: 26. 10. 2026</p>
    </article>
  </div>
);
