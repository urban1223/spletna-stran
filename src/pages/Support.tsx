import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { BANK_ACCOUNT } from "@/lib/constants";

const Support = () => {
  const navigate = useNavigate();
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopiran!`);
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-6 text-accent text-center">
          PODPRITE NAS
        </h1>
        <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-16">
          Vaša podpora nam omogoča nadaljevanje raziskovanja, izobraževanja in 
          širjenja stare glasbe v Sloveniji in širše.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Donation */}
          <Card className="p-8 bg-card border-border hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <div className="flex flex-col flex-grow justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
                  Donacija za nakup baročnih lokov
                </h2>

                <p className="text-base text-muted-foreground text-justify mb-6">
                  Baročni loki so nepogrešljivi za pristno izvajanje zgodovinskega repertoarja. Za študente, ki predstavljajo velik del našega društva, je nakup loka pogosto finančna ovira, ki otežuje izvorno izvajanje. Z vašo podporo jim lahko pomagamo premagati to oviro in omogočimo kakovostno izvajanje stare glasbe, ki bogati našo kulturno dediščino.
                </p>
              </div>

              <div className="space-y-3 max-w-md mx-auto text-justify">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Ime:</p>
                  <p className="text-foreground text-sm leading-relaxed">
                    {BANK_ACCOUNT.NAME}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Naslov:</p>
                  <p className="text-foreground text-sm leading-relaxed">
                    {BANK_ACCOUNT.ADDRESS}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">TRR:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-foreground text-sm font-mono">{BANK_ACCOUNT.IBAN}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(BANK_ACCOUNT.IBAN, "TRR")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">BIC:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-foreground text-sm font-mono">{BANK_ACCOUNT.BIC}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(BANK_ACCOUNT.BIC, "BIC")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Namen:</p>
                  <p className="text-foreground text-sm leading-relaxed">
                    Donacija za baročni lok
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* General Support */}
          <Card className="p-8 bg-card border-border hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <div className="flex flex-col flex-grow justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
                  Podpora delovanju društva
                </h2>

                <p className="text-base text-muted-foreground mb-6 text-justify">
                  Nova akademija je novo kulturno-izobraževalno društvo, ki mladim glasbenikom omogoča stik s svetom stare glasbe. Vašo podporo nam lahko izkažete z obiski koncertov, seminarjev in delavnic, tako da delite delovanje društva z ostalimi, ki bi jih to področje zanimalo, ter s finančno pomočjo.
                </p>
              </div>

              <div className="space-y-3 max-w-md mx-auto text-justify">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Ime:</p>
                  <p className="text-foreground text-sm leading-relaxed">
                    {BANK_ACCOUNT.NAME}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Naslov:</p>
                  <p className="text-foreground text-sm leading-relaxed">
                    {BANK_ACCOUNT.ADDRESS}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">TRR:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-foreground text-sm font-mono">{BANK_ACCOUNT.IBAN}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(BANK_ACCOUNT.IBAN, "TRR")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">BIC:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-foreground text-sm font-mono">{BANK_ACCOUNT.BIC}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(BANK_ACCOUNT.BIC, "BIC")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Namen:</p>
                  <p className="text-foreground text-sm leading-relaxed">
                    Podpora delovanju društva
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Sponsorship */}
          <Card className="p-8 bg-card border-border hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <div className="flex flex-col flex-grow justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
                  Sponzorstvo
                </h2>

                <p className="text-base text-muted-foreground mb-6 text-justify">
                  Postanite sponzor naših dogodkov in projektov. Ponujamo različne pakete 
                  s prepoznavnostjo na naših dogodkih in promocijskih materialih.
                </p>
              </div>

              <Button 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => navigate('/o-nas')}
              >
                KONTAKTIRAJTE NAS ZA SPONZORSTVO
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-16 text-center max-w-2xl mx-auto">
  <p className="text-muted-foreground italic text-center">
    Vsak prispevek, ne glede na velikost, nam pomaga ohraniti in širiti 
    bogato dediščino evropske stare glasbe. Hvala za vašo podporo!
  </p>
</div>
      </div>
    </div>
  );
};

export default Support;
