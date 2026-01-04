import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Projects = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-16 text-accent text-center">
          PROJEKTI IN IZOBRAŽEVANJA
        </h1>

        {/* EDUCATION SECTION */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-4xl font-bold text-foreground">Izobraževanja</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* === DELAVNICA: GENERALNI BAS === */}
            <Card className="p-8 bg-card border-border flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-accent mb-4">
                  Delavnica: Generalni bas
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-6 text-justify">
                  Basso continuo ali generalni bas je vrsta glasbenega zapisa, pri katerem so pod 
                  basovsko linijo zapisana števila, ki označujejo akorde. S teorijo in veliko prakse 
                  je znanje generalbasa eno izmed ključnih znanj za vsakega izvajalca glasbe med 16. 
                  in 18. stoletjem. Delavnica se <strong>prek igranja na čembalo ali lutnjo </strong> 
                  osredotoča na pravila harmonije in improvizacijo generalnega basa, preostali člani 
                  društva pa omogočajo, da se znanje prenese v prakso s skupnim muziciranjem.
                </p>

                <div className="space-y-2 text-muted-foreground mb-6">
                  <p>
                    <span className="font-semibold text-foreground">Mentor:</span>
                    <span className="ml-2">Branimir Rezić, asistent na AG LJ</span>
                  </p>

                  <div>
                    <span className="font-semibold text-foreground">Kotizacija za 10 ur:</span>
                    <ul className="list-disc list-inside mt-2">
                      <li>Skupinski pouk: 150€</li>
                      <li>Individualni pouk: 300€</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => window.location.href = "/o-nas"}
              >
                PRIJAVA NA DELAVNICO PO E-POŠTI
              </Button>
            </Card>

            {/* === MENTORSTVO MLADIH GLASBENIKOV === */}
            <Card className="p-8 bg-card border-border flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-accent mb-4">
                  Mentorstvo mladih glasbenikov
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-6 text-justify">
                  Ker se v društvu zavedamo, da lahko člani najbolje napredujejo pod kvalitetnim 
                  mentorstvom, smo stopili v stik z vrhunskimi glasbeniki in pedagogi stare glasbe. 
                  Mentorji se nam pridružijo ob koncertih, vajah in srečanjih, redno odgovarjajo na 
                  vprašanja članov ter delijo svoje dolgoletne izkušnje. Mnogi med njimi poučujejo 
                  na mednarodno priznanih akademijah ter nastopajo na pomembnih koncertnih prizoriščih.
                </p>
              </div>

              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => window.location.href = "/clani"}
              >
                PREGLEJ MENTORJE
              </Button>
            </Card>

            {/* === SEMINAR: JONATHAN BERK === */}
            <Card className="p-8 bg-card border-border flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-accent mb-4">
                  Gost: Jonathan Berk (historični inštrumenti s tipkami)
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-6 text-justify">
                  V januarju bomo z veseljem gostili Jonathana Berka, čembalista z Univerze za glasbo 
                  in uprizoritvene umetnosti v Gradcu (KUG). Predstavil bo dve predavanji, ki se 
                  poglabljata v nemško glasbo prve polovice 18. stoletja. Po predavanjih sledi krajši 
                  koncert ter pogovor z izvajalcem. 
                </p>

                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                  <li>
                    Predavanje 1: Raziskovanje Matthesonovih komentarjev o značilnostih tonalitet 
                    <span className="italic">
                      {" "} (On exploring Mattheson’s comments on key characteristics with German music from the first half of the 18th century).
                    </span>
                  </li>
                  <li>
                    Predavanje 2:
                    <span className="italic">
                      {" "} (Wind performance practice with new keyboard instruments at the Dresden court of the first half of the 18th century).
                    </span>
                  </li>
                </ul>

                <div className="space-y-2">
                  <p className="font-semibold text-foreground">
                    Predavatelj:
                    <span className="font-normal text-muted-foreground ml-2">Jonathan Berk, KUG</span>
                  </p>

                  <p className="font-semibold text-foreground">
                    Youtube:
                    <a
                      href="https://youtube.com/@jonathanberk-earlykeyboard1608?si=L8W3CHTxmMTwQCeI"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-normal text-accent hover:text-accent/80 underline ml-2"
                    >
                      Jonathan Berk – Early Keyboards
                    </a>
                  </p>

                  <p className="font-semibold text-foreground">
                    Termin in kraj:
                    <span className="font-normal text-muted-foreground ml-2">
                      5. 1. 2026, v času pouka HIP1 in HIP2 na lokaciji predmeta.
                    </span>
                  </p>

                  <p className="font-semibold text-foreground">
                    Vstop prost!
                  </p>
                </div>
              </div>

              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-4"
                onClick={() => window.location.href = "/o-nas"}
              >
                PRIJAVA NA SEMINAR PO E-POŠTI
              </Button>
            </Card>
          </div>
        </section>

        {/* RESEARCH SECTION */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-4xl font-bold text-foreground">Raziskovalni projekti</h2>
          </div>

          <Card className="p-8 bg-card border-border">
            <h3 className="text-2xl font-bold text-accent mb-4">
              Digitalizacija notnega arhiva v cerkvi svetega Kancijana, Kranj
            </h3>

            <div className="space-y-4 mb-6">
              <p className="text-muted-foreground leading-relaxed text-justify">
                Po dolgoletnem delovanju različnih zborov v zgodovini Župnije Kranj se je njihova aktivnost močno ohranila v obliki notnih partitur, pisem skladateljev, prepisov in raznih zapiskov. Vsa ta dokumentacija je dolgo ležala na kranjskem koru, v zadnjih letih pa so jo prenesli v Župnijski urad. Ob preučevanju gradiva smo hitro opazili, kako bogata je bila liturgična glasba v 19. in 20. stoletju v župnijski cerkvi. Mnoge partiture, parti in celotni zapisi o izvajanju dokazujejo redno sodelovanje vsaj 30-članskega zbora in ob praznikih celo orkestra, vključno s pihali, trobili in tolkali. Po pogovoru z župnikom Andrejem Nagličem smo se dogovorili, da dokumentacijo skrbno preučimo in jo digitaliziramo ter na ta način širši javnosti predstavimo bogato kulturno dediščino kranjske župnije.
              </p>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Odgovorni za projekt:</h4>
                <p className="text-muted-foreground">Urban Klančar, Franc Jerala.</p>
              </div>
            </div>

            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => window.location.href = "/podprite-nas"}
            >
              PODPRITE TA RAZISKOVALNI PROJEKT
            </Button>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Projects;
