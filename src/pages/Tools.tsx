import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const TOOLS: {
  id: string;
  title: string;
  description: string;
  link: string;
  external?: boolean;
}[] = [
  {
    id: "pretvornik",
    title: "Pretvornik faksimilov",
    description:
      "Zdi se nam pomembno, da staro glasbo beremo in izvajamo iz originalnih zapisov ter faksimilov, saj nam ti ponujajo najbolj pristen vpogled v glasbeno misel tistega časa. Ker pa so originalni rokopisi v barvah kdaj neprijazni za tisk, smo razvili orodje, ki barvne skene pretvori v čiste, visokokontrastne črno-bele oblike, ki so bolj primerne za tiskanje.",
    link: "/bw-converter/",
  },
  {
    id: "uglasevalec",
    title: "Zgodovinski uglaševalec",
    description:
      "V preteklosti so glasbeniki inštrumente s tipkami uglaševali precej drugače kot današnji moderni klavir. Skozi stoletja so različni teoretiki razvili svoje sisteme uglasitev, da bi poudarili določene zvočne barve. Ker so kopije zgodovinskih inštrumentov danes grajene in igrane s tem ozirom, smo za lažje uglaševanje razvili aplikacijo, ki ponuja širok nabor zgodovinskih temperamentov in referenčnih višin.",
    link: "/Historical-tuner/",
  },
  {
    id: "obrezovalnik",
    title: "Obrezovalnik manuskriptov",
    description:
      "Rokopisi in faksimili, iz katerih se trudimo igrati, so ob digitalizaciji običajno skenirani z velikimi, nepotrebnimi robovi. Ti zavzamejo preveč prostora na zaslonu in niso prijazni, če bi želeli gradivo natisniti. Zato smo razvili preprosto orodje, s katerim lahko hitro in natančno obrežete ter poravnate strani rokopisov za lažje branje.",
    link: "/manuscript-cropper/",
  },
  {
    id: "casovnice",
    title: "Časovnice skladateljev",
    description:
      "Vsak, ki se začne ukvarjati s staro glasbo, hitro spozna, da je ta svet veliko večji in bogatejši, kot se zdi na prvi pogled. Da bi dobili čim boljšo predstavo in širši vpogled v kronologijo skladateljev iz preteklosti, smo razvili interaktivno časovnico. Ta vam pomaga umestiti glasbenike v pravi zgodovinski kontekst in raziskati, kdo je ustvarjal v istem času.",
    link: "https://timelines.nova-akademija.si/",
    external: true,
  },
];

const Tools = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-16 text-accent text-center">
          NAŠA ORODJA
        </h1>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {TOOLS.map((tool) => {
            return (
              <Card
                key={tool.id}
                className="p-8 bg-card border-border flex flex-col h-full hover:border-accent/50 transition-colors group"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-accent">
                    {tool.title}
                  </h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed flex-grow text-justify">
                  {tool.description}
                </p>

                <div className="mt-8 pt-6 border-t border-border">
                  <a
                    href={tool.link}
                    {...(tool.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="inline-flex items-center gap-2 text-accent font-semibold hover:opacity-80 transition-opacity"
                  >
                    Odpri
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Tools;