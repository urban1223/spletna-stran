import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import emailjs from "@emailjs/browser";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Ime mora vsebovati vsaj 2 znaka.",
  }),
  email: z.string().email({
    message: "Prosimo, vnesite veljaven e-poštni naslov.",
  }),
  courseName: z.string().min(1, {
    message: "Ime tečaja je obvezno.",
  }),
  message: z.string().min(10, {
    message: "Sporočilo mora vsebovati vsaj 10 znakov.",
  }),
  honeypot: z.string().optional(),
});

interface ContactModalProps {
  courseName: string;
  triggerButton?: React.ReactNode;
}

export function ContactModal({ courseName, triggerButton }: ContactModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStartTime, setFormStartTime] = useState<number>(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      courseName: courseName,
      message: "",
      honeypot: "",
    },
  });

  // Set form start time when modal opens
  useEffect(() => {
    if (open) {
      setFormStartTime(Date.now());
      form.reset({
        name: "",
        email: "",
        courseName: courseName,
        message: "",
        honeypot: "",
      });
    }
  }, [open, courseName, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Spam protection: honeypot check
    if (values.honeypot && values.honeypot.length > 0) {
      console.log("Honeypot triggered - potential spam");
      return;
    }

    // Spam protection: time-based validation (minimum 3 seconds)
    const formFillTime = Date.now() - formStartTime;
    if (formFillTime < 3000) {
      toast.error("Prosimo, počakajte trenutek pred oddajo obrazca.");
      return;
    }

    setIsSubmitting(true);

    try {
      // EmailJS configuration
      // These need to be set up in EmailJS dashboard:
      // 1. Create an account at emailjs.com
      // 2. Create an email service
      // 3. Create an email template with variables: {{from_name}}, {{from_email}}, {{course_name}}, {{message}}, {{to_email}}
      // 4. Get your Public Key, Service ID, and Template ID
      // 5. Set environment variables in .env file (see .env.example)
      
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      // Validate EmailJS configuration
      if (!serviceId || !templateId || !publicKey || 
          serviceId.includes("YOUR_") || templateId.includes("YOUR_") || publicKey.includes("YOUR_")) {
        console.error("EmailJS is not properly configured. Please set up environment variables.");
        toast.error("Kontaktni obrazec ni pravilno konfiguriran. Prosimo, uporabite e-pošto: info.nova.akademija@gmail.com");
        return;
      }

      const templateParams = {
        from_name: values.name,
        from_email: values.email,
        course_name: values.courseName,
        message: values.message,
        to_email: "info.nova.akademija@gmail.com",
      };

      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      toast.success("Sporočilo je bilo uspešno poslano! Kmalu se vam bomo oglasili.");
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("EmailJS error:", error);
      toast.error("Napaka pri pošiljanju sporočila. Prosimo, poskusite znova ali nas kontaktirajte na: info.nova.akademija@gmail.com");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            PRIJAVA PO E-POŠTI
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-accent">
            Poizvedba o tečaju
          </DialogTitle>
          <DialogDescription>
            Izpolnite spodnji obrazec za poizvedbo o tečaju. Odgovorili vam bomo v najkrajšem možnem času.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ime in priimek *</FormLabel>
                  <FormControl>
                    <Input placeholder="Vaše ime" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-poštni naslov *</FormLabel>
                  <FormControl>
                    <Input placeholder="vas.email@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="courseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tečaj</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="bg-muted" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sporočilo *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Vaše sporočilo ali vprašanje..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Honeypot field - hidden from users */}
            <FormField
              control={form.control}
              name="honeypot"
              render={({ field }) => (
                <div style={{ position: "absolute", left: "-9999px" }}>
                  <FormControl>
                    <Input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                </div>
              )}
            />
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Prekliči
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isSubmitting ? "Pošiljanje..." : "Pošlji"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
