import { Instagram, Facebook, Youtube } from "lucide-react";
import { SOCIAL_MEDIA, CONTACT, BANK_ACCOUNT } from "@/lib/constants";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-accent mb-4">Nova akademija</h3>
            <p className="text-muted-foreground text-sm">
              Društvo za širjenje stare glasbe
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Kontakt</h4>
            <p className="text-sm text-muted-foreground mb-2">
              {BANK_ACCOUNT.ADDRESS}
            </p>
            <p className="text-sm text-muted-foreground">
              {CONTACT.EMAIL}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Sledite nam</h4>
            <div className="flex space-x-4">
              <a
                href={SOCIAL_MEDIA.INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Instagram size={24} />
              </a>
              <a
                href={SOCIAL_MEDIA.FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Facebook size={24} />
              </a>
              <a
                href={SOCIAL_MEDIA.YOUTUBE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Youtube size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Društvo za širjenje stare glasbe Nova akademija. Vse pravice pridržane.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
