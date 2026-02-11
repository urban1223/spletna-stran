import { Card } from "@/components/ui/card";
import { Mail, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import { SOCIAL_MEDIA, CONTACT } from "@/lib/constants";

const About = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-16 text-accent text-center">
          O NAS
        </h1>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Vision and Mission Section */}
          <Card className="p-8 bg-card border-border">
            <h2 className="text-3xl font-bold mb-6 text-accent">
              Vizija in poslanstvo
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-justify">
              Nova akademija je kulturno-izobraževalno društvo, ki deluje na področju stare glasbe v Sloveniji. Združujemo glasbenike, raziskovalce in ljubitelje umetnosti, ki jih povezuje strast do glasbe iz preteklih stoletij. Navdih črpamo iz Academie Philharmonicorum, ustanovljene leta 1701, ene prvih glasbenih ustanov pri nas, ki je pomembno oblikovala kulturno življenje na Slovenskem. Njeno tradicijo želimo prenesti v sodoben čas in mladim glasbenikom omogočiti priložnost za učenje, raziskovanje in izvajanje stare glasbe na izvoren način. Preko koncertov, delavnic, izobraževanj in raziskovalnih projektov spodbujamo zanimanje za staro glasbo ter krepimo njeno prisotnost v slovenski kulturni krajini. Naš cilj je pokazati, da je glasba preteklih stoletij živ, dinamičen in še vedno pomemben del naše dediščine.
              </p>
          </Card>

          {/* Contact Section */}
          <Card className="p-8 bg-card border-border">
            <h2 className="text-3xl font-bold mb-6 text-accent">
              Kontakt
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Elektronska pošta</h3>
                    <a 
                      href={`mailto:${CONTACT.EMAIL}`}
                      className="text-accent hover:underline"
                    >
                      {CONTACT.EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Naslov</h3>
                    <p className="text-muted-foreground">
                      Voduškova ulica 22<br />
                      1000 Ljubljana
                    </p>
                  </div>
                </div>
              </div>

              {/* Official Data */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Davčna številka društva</h3>
                  <p className="text-muted-foreground font-mono">85814229</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Matična številka društva</h3>
                  <p className="text-muted-foreground font-mono">2944324000</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">TRR društva</h3>
                  <p className="text-muted-foreground font-mono">SI56 6100 0003 0933 259</p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="font-semibold text-lg mb-4">Sledite nam na družbenih omrežjih</h3>
              
              <div className="flex flex-wrap gap-4">
                <a
                  href={SOCIAL_MEDIA.INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background hover:bg-muted transition-colors group"
                >
                  <Instagram className="w-5 h-5 text-accent" />
                  <span className="font-semibold group-hover:text-accent transition-colors">Instagram</span>
                </a>

                <a
                  href={SOCIAL_MEDIA.FACEBOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background hover:bg-muted transition-colors group"
                >
                  <Facebook className="w-5 h-5 text-accent" />
                  <span className="font-semibold group-hover:text-accent transition-colors">Facebook</span>
                </a>

                <a
                  href={SOCIAL_MEDIA.YOUTUBE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background hover:bg-muted transition-colors group"
                >
                  <Youtube className="w-5 h-5 text-accent" />
                  <span className="font-semibold group-hover:text-accent transition-colors">YouTube</span>
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
