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
import { Send, Loader2, Minus, Plus, Info } from "lucide-react";

interface ReservationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  concertTitle?: string;
}

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

const ReservationFormDialog = ({
  open,
  onOpenChange,
  concertTitle = "Victimae paschali, 12. april 2026",
}: ReservationFormDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentCount, setStudentCount] = useState(0);
  const [adultCount, setAdultCount] = useState(0);
  const [sending, setSending] = useState(false);

  const total = studentCount * 13 + adultCount * 15;

  const handleSend = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Prosimo, izpolnite ime in e-pošto.");
      return;
    }
    if (studentCount + adultCount === 0) {
      toast.error("Izberite vsaj eno karto.");
      return;
    }

    setSending(true);

    const message =
      `Rezervacija kart – ${concertTitle}\n\n` +
      `Študentska / upokojenski (13€): ${studentCount} kart\n` +
      `Odrasla (15€): ${adultCount} kart\n` +
      `Skupaj: ${total}€`;

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: name.trim(),
          email: email.trim(),
          subject: `Rezervacija – ${concertTitle}`,
          message,
          from_name: "Nova Akademija - Rezervacija",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Rezervacija uspešno oddana!");
        setName("");
        setEmail("");
        setStudentCount(0);
        setAdultCount(0);
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

  const Counter = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (v: number) => void;
  }) => (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={sending || value === 0}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent disabled:opacity-30 transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-5 text-center font-semibold text-foreground">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(20, value + 1))}
        disabled={sending}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent disabled:opacity-30 transition-colors"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent">
            Rezervacija kart
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {concertTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">

          {/* Info obvestilo */}
          <div className="flex items-start gap-3 bg-accent/10 border border-accent/20 rounded-lg p-3">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" />
            <p className="text-sm text-muted-foreground">
              Karte je možno prevzeti <span className="font-semibold text-foreground">3 dni pred koncertom</span> na blagajni Stolnice sv. Nikolaja, kjer jih tudi plačate.
            </p>
          </div>

          {/* Zadeva - predizpolnjeno */}
          <div className="space-y-2">
            <Label className="text-foreground">Zadeva</Label>
            <Input
              value={`Rezervacija – ${concertTitle}`}
              readOnly
              className="bg-muted border-border text-muted-foreground cursor-default"
            />
          </div>

          {/* Ime */}
          <div className="space-y-2">
            <Label className="text-foreground">
              Ime in priimek <span className="text-accent">*</span>
            </Label>
            <Input
              placeholder="Vaše ime in priimek"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              disabled={sending}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-foreground">
              E-pošta <span className="text-accent">*</span>
            </Label>
            <Input
              type="email"
              placeholder="vaš.email@primer.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              disabled={sending}
            />
          </div>

          {/* Izbira kart */}
          <div className="space-y-3">
            <Label className="text-foreground">Izbira kart <span className="text-accent">*</span></Label>

            <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground text-sm">Študentska / upokojenska</p>
                <p className="text-accent font-bold">13 €</p>
              </div>
              <Counter value={studentCount} onChange={setStudentCount} />
            </div>

            <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground text-sm">Odrasla</p>
                <p className="text-accent font-bold">15 €</p>
              </div>
              <Counter value={adultCount} onChange={setAdultCount} />
            </div>
          </div>

          {/* Skupaj */}
          {total > 0 && (
            <div className="flex justify-between items-center pt-1 border-t border-border">
              <span className="text-muted-foreground text-sm">Skupaj</span>
              <span className="text-foreground font-bold text-lg">{total} €</span>
            </div>
          )}

          {/* Honeypot */}
          <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />

          <Button
            onClick={handleSend}
            disabled={sending}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                POŠILJANJE...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                ODDAJ REZERVACIJO
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationFormDialog;