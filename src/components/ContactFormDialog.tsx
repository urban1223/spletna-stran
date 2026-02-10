import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WEB3FORMS_ACCESS_KEY = "600f6776-ced9-416d-bd21-a6c5b66c8dec";

const ContactFormDialog = ({ open, onOpenChange }: ContactFormDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Prosimo, izpolnite vsa obvezna polja.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || "Prijava – Tečaj bassa continua",
          message: message.trim(),
          from_name: "Nova Akademija - Spletna stran",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Sporočilo je bilo uspešno poslano!");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        onOpenChange(false);
      } else {
        toast.error("Napaka pri pošiljanju. Prosimo, poskusite znova.");
      }
    } catch {
      toast.error("Napaka pri povezavi. Prosimo, poskusite znova.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent">
            Prijava po e-pošti
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Izpolnite spodnji obrazec in kliknite "Pošlji". Vaše sporočilo
            bo poslano neposredno na naš e-poštni naslov.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="contact-name" className="text-foreground">
              Ime in priimek <span className="text-accent">*</span>
            </Label>
            <Input
              id="contact-name"
              placeholder="Vaše ime in priimek"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              disabled={sending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email" className="text-foreground">
              E-pošta <span className="text-accent">*</span>
            </Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="vaš.email@primer.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              disabled={sending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-subject" className="text-foreground">
              Zadeva
            </Label>
            <Input
              id="contact-subject"
              placeholder="npr. Prijava na tečaj bassa continua"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              disabled={sending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message" className="text-foreground">
              Sporočilo <span className="text-accent">*</span>
            </Label>
            <Textarea
              id="contact-message"
              placeholder="Napišite svoje sporočilo..."
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
              disabled={sending}
            />
          </div>

          {/* Honeypot spam protection */}
          <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />

          <Button
            onClick={handleSend}
            disabled={sending}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-2"
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                POŠILJANJE...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                POŠLJI
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormDialog;
