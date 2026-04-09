import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Music, ArrowLeft, Ticket } from "lucide-react";
import { allEvents } from "@/data/events-data";
import ReservationFormDialog from "@/components/ReservationFormDialog";

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [reservationOpen, setReservationOpen] = useState(false);

  const event = allEvents.find((e) => e.slug === slug);

  useEffect(() => {
    if (event) {
      document.title = `${event.title} – Nova akademija`;

      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute(
          "content",
          `${event.title} – ${event.date}, ${event.location}. Program: ${event.program}. ${event.admission ?? ""}`
        );
      }

      // JSON-LD structured data
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "event-jsonld";
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "MusicEvent",
        "name": event.title,
        "description": `${event.description}. Program: ${event.program}`,
        "startDate": `${event.isoDate}T${event.time}:00`,
        "location": {
          "@type": "Place",
          "name": event.location,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Ljubljana",
            "addressCountry": "SI"
          }
        },
        "organizer": {
          "@type": "Organization",
          "name": "Nova akademija",
          "url": "https://nova-akademija.si"
        },
        "isAccessibleForFree": event.admission?.toLowerCase().includes("prost") ?? false,
      });
      document.head.appendChild(script);

      return () => {
        document.getElementById("event-jsonld")?.remove();
      };
    }
  }, [event]);

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-2xl text-muted-foreground">Koncert ni bil najden.</p>
        <Button onClick={() => navigate("/dogodki")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nazaj na koncerte
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-2xl">

        {/* Nazaj */}
        <button
          onClick={() => navigate("/dogodki")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Vsi koncerti
        </button>

        {/* Naslov */}
        <h1 className="text-4xl md:text-5xl font-bold text-accent mb-10">
          {event.title}
        </h1>

        {/* Detajli */}
        <div className="space-y-6 mb-12">

          <div className="flex items-start gap-4 text-muted-foreground">
            <Calendar className="w-5 h-5 mt-1 flex-shrink-0 text-accent" />
            <div>
              <p className="text-foreground font-semibold">{event.date}</p>
              <p>ob {event.time}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 text-muted-foreground">
            <MapPin className="w-5 h-5 mt-1 flex-shrink-0 text-accent" />
            <p>{event.location}</p>
          </div>

          <div className="flex items-start gap-4 text-muted-foreground">
            <Music className="w-5 h-5 mt-1 flex-shrink-0 text-accent" />
            <div className="space-y-1">
              <p>{event.description}</p>
              <p className="font-semibold text-foreground">Program: {event.program}</p>
              {event.conductor && <p>{event.conductor}</p>}
            </div>
          </div>

          {event.admission && (
            <div className="flex items-start gap-4">
              <Ticket className="w-5 h-5 mt-1 flex-shrink-0 text-accent" />
              <p className="font-bold text-foreground text-lg">{event.admission}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        {event.past ? (
          <Button variant="outline" className="w-full" disabled>
            DOGODEK JE POTEKEL
          </Button>
        ) : event.reservation ? (
          <Button
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-base py-6"
            onClick={() => setReservationOpen(true)}
          >
            {event.cta}
          </Button>
        ) : (
          <Button
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-base py-6"
            onClick={() => window.open(event.link!, "_blank")}
          >
            {event.cta}
          </Button>
        )}
      </div>

      <ReservationFormDialog
        open={reservationOpen}
        onOpenChange={setReservationOpen}
      />
    </div>
  );
};

export default EventDetail;