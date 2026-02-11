import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";

const Projects = () => {
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-16 text-accent text-center">
          PROJEKTI IN IZOBRAŽEVANJA
        </h1>

        {/* PROGRAMI IN IZOBRAŽEVANJA */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-4xl font-bold text-foreground">
              Programi in izobraževanja
            </h2>
          </div>
            
         

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8 bg-card border-border flex flex-col h-full">
              <h3 className="text-2xl font-bold text-accent">
                Tečaj bassa continua
              </h3>
              
              <p className="text-muted-foreground leading-relaxed mb-6 text-justify">
                  Basso continuo je harmonska glasbena struktura, po navadi sestavljena iz
                  basovske linije in akordičnih simbolov, ki so značilni za baročno glasbo.
                  Igranje continua pripomore k boljšemu razumevanju baročnih stilov, zato je priporočljivo,
                  da vsak, ki se ukvarja z baročno glasbo (pa tudi kasnejšo) obladuje vsaj osnovne tehnike igranja continua.
                  V sklopu društva ponujamo različne tečaje glede na predznanje:
                  <ul className="list-none space-y-1 font-semibold text-foreground">
                    <li className="before:content-['\2022'] before:mr-2 before:text-accent">
                      Osnovni tečaj za začetnike
                    </li>
                    <li className="before:content-['\2022'] before:mr-2 before:text-accent">
                      Nadaljevalni tečaj (razlike med francoskim, italijanskim in nemškim stilom)
                    </li>
                    <li className="before:content-['\2022'] before:mr-2 before:text-accent">
                      Igranje partimentov
                    </li>
                    <li className="before:content-['\2022'] before:mr-2 before:text-accent">
                      Continuo 17. stoletja
                    </li>
                  </ul>
                </p>
                <div className="space-y-3 text-muted-foreground">
      <p>
        <span className="font-semibold text-foreground">Cena:</span>
        <span className="ml-2">po dogovoru, odvisno od velikosti skupine</span>
      </p>

      <p>
        <span className="font-semibold text-foreground">Obseg:</span>
        <span className="ml-2">10 terminov po 4 šolske ure (40 ur)</span>
      </p>

      <p>
        <span className="font-semibold text-foreground">Oblika pouka:</span>
        <span className="ml-2">individualni ali skupinski pouk</span>
      </p>

      <p>
        <span className="font-semibold text-foreground">Termini:</span>
        <span className="ml-2">
          med tednom (tudi dopoldne) ali ob vikendih po dogovoru
        </span>
      </p>
      <p> 
      </p>
    </div>
              

              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => setContactDialogOpen(true)}
              >
                PRIJAVA PO E-POŠTI
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
                onClick={() => navigate("/clani")}
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
                      6. 1. 2026, v času pouka HIP1 in HIP2 na lokaciji predmeta.
                    </span>
                  </p>

                  <p className="font-semibold text-foreground">
                    Vstop prost!
                  </p>
                  <div>
                  </div>
                </div>
              </div>

              <Button 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  DOGODEK JE POTEKEL
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
              onClick={() => navigate("/podprite-nas")}
            >
              PODPRITE RAZISKOVALNI PROJEKT
            </Button>
          </Card>
        </section>
      </div>

      <ContactFormDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
      />
    </div>
  );
};

export default Projects;
