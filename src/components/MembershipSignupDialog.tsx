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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

interface MembershipSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

const MembershipSignupDialog = ({ open, onOpenChange }: MembershipSignupDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Prosimo, izpolnite vsa obvezna polja.");
      return;
    }

    setSending(true);

    try {
      const formData = {
        access_key: WEB3FORMS_ACCESS_KEY,
        name: name.trim(),
        email: email.trim(),
        subject: `Nova prijava za članstvo – ${name.trim()}`,
        message: `Nova oseba se želi včlaniti v društvo Nova akademija.\n\nIme: ${name.trim()}\nE-pošta: ${email.trim()}\nTelefon: ${phone.trim() || "Ni navedeno"}`,
      };

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Vaša prijava je bila poslana! Kmalu vas bomo kontaktirali.");
        setName("");
        setEmail("");
        setPhone("");
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
            Včlanitev v društvo
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Izpolnite spodnji obrazec in postanite del Nove akademije. 
            Kmalu vas bomo kontaktirali z dodatnimi informacijami.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="signup-name" className="text-foreground">
              Ime in priimek <span className="text-accent">*</span>
            </Label>
            <Input
              id="signup-name"
              placeholder="Vaše ime in priimek"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              disabled={sending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-foreground">
              E-pošta <span className="text-accent">*</span>
            </Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="vaš.email@primer.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              disabled={sending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-phone" className="text-foreground">
              Telefon (opcijsko)
            </Label>
            <Input
              id="signup-phone"
              type="tel"
              placeholder="040 123 456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              disabled={sending}
            />
          </div>

          {/* Honeypot spam protection */}
          <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />

          <Button
            onClick={handleSubmit}
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
                POŠLJI PRIJAVO
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MembershipSignupDialog;
