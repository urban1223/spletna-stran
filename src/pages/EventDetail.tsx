import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Music, ArrowLeft, Ticket, Share2 } from "lucide-react";
import ReservationFormDialog from "@/components/ReservationFormDialog";
import Seo from "@/components/Seo";
import { getEvent } from "@/lib/events-api";
import { toast } from "sonner";

const calendarDate = (event: { isoDate: string; time: string }) => {
  const date = event.isoDate.replace(/-/g, "");
  const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(event.time) ? event.time.replace(":", "") + "00" : null;
  return time ? `${date}T${time}` : date;
};

const nextDay = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10).replace(/-/g, "");
};

const calendarDateFromLocalTime = (isoDate: string, time: string) => {
  const date = new Date(`${isoDate}T${time}:00`);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
};

const addToGoogleCalendar = (event: {
  title: string;
  description: string;
  program: string;
  isoDate: string;
  time: string;
  location: string;
}) => {
  const start = calendarDate(event);
  const hasTime = start.includes("T");
  const end = hasTime
    ? calendarDateFromLocalTime(event.isoDate, (() => {
        const date = new Date(`${event.isoDate}T${event.time}:00`);
        date.setHours(date.getHours() + 2);
        const pad = (value: number) => String(value).padStart(2, "0");
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
      })())
    : nextDay(event.isoDate);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: `${event.description}\nProgram: ${event.program}`,
    location: event.location,
  });
  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, "_blank", "noopener,noreferrer");
};

const shareEvent = async (event: { title: string }) => {
  const url = window.location.href;
  if (navigator.share) {
    await navigator.share({ title: event.title, url });
    return;
  }
  try {
    if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(url);
    toast.success("Povezava do dogodka je kopirana.");
  } catch {
    toast.error("Povezave ni mogoče kopirati.");
  }
};

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [reservationOpen, setReservationOpen] = useState(false);
  const { data: event, isLoading } = useQuery({
    queryKey: ["event", slug],
    queryFn: () => getEvent(slug || ""),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Nalaganje koncerta …</div>;
  }

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
      <Seo
        title={event.title}
        path={`/dogodki/${event.slug}`}
        type="article"
        description={`${event.title} – ${event.date}, ${event.location}. Program: ${event.program}. ${event.admission ?? ""}`.trim()}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "MusicEvent",
          name: event.title,
          description: `${event.description}. Program: ${event.program}`,
          startDate: `${event.isoDate}T${event.time}:00`,
          location: {
            "@type": "Place",
            name: event.location,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Ljubljana",
              addressCountry: "SI",
            },
          },
          organizer: {
            "@type": "Organization",
            name: "Nova akademija",
            url: "https://nova-akademija.si",
          },
          isAccessibleForFree:
            event.admission?.toLowerCase().includes("prost") ?? false,
        }}
      />
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

        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          {!event.past && (
            <Button variant="outline" className="flex-1" onClick={() => addToGoogleCalendar(event)}>
              <Calendar className="h-4 w-4" />
              DODAJ V KOLEDAR
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => shareEvent(event).catch(() => toast.error("Deljenje dogodka ni uspelo."))}
          >
            <Share2 className="h-4 w-4" />
            DELI DOGODEK
          </Button>
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