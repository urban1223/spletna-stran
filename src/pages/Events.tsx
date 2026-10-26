import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Music } from "lucide-react";
import { getEvents } from "@/lib/events-api";

const Events = () => {
  const navigate = useNavigate();
  const { data: events = [], isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });
  const upcomingEvents = events.filter((event) => !event.past);
  const pastEvents = events
    .filter((event) => event.past)
    .sort((a, b) => (b.isoDate || "").localeCompare(a.isoDate || ""));

  return (
    <div className="min-h-screen py-20">
      <Seo
        title="Koncerti in dogodki"
        path="/dogodki"
        description="Prihajajoči in pretekli koncerti ansambla Nova akademija – stara glasba na historičnih inštrumentih po Sloveniji."
      />
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-16 text-accent text-center">
          KONCERTI
        </h1>

        {isLoading && <p className="text-muted-foreground">Nalaganje koncertov …</p>}
        {isError && <p className="text-destructive">Koncertov trenutno ni mogoče naložiti.</p>}

        {/* Upcoming Events */}
        {!isLoading && !isError && <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Prihajajoči koncerti
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <Card
                key={event.slug}
                className="p-6 bg-card border-border hover:border-accent transition-all flex flex-col cursor-pointer"
                onClick={() => navigate(`/dogodki/${event.slug}`)}
              >
                <h3 className="text-2xl font-bold text-accent mb-4">
                  {event.title}
                </h3>

                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <Calendar className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p>{event.date}</p>
                      <p className="text-sm">ob {event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p>{event.location}</p>
                  </div>

                  <div className="flex items-start gap-3 text-muted-foreground">
                    <Music className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p className="mb-1">{event.description}</p>
                      <p className="text-sm font-semibold text-foreground">
                        Program: {event.program}
                      </p>
                      {event.conductor && (
                        <p className="text-sm mt-1">{event.conductor}</p>
                      )}
                      {event.admission && (
                        <p className="text-sm mt-1 font-bold text-foreground">
                          {event.admission}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dogodki/${event.slug}`);
                  }}
                >
                  VEČ INFO
                </Button>
              </Card>
            ))}
          </div>
        </section>}

        {/* Past Events Archive */}
        {!isLoading && !isError && <section>
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Arhiv preteklih koncertov
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pastEvents.map((event) => (
              <Card
                key={event.slug}
                className="p-6 bg-card border-border opacity-75"
              >
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {event.title}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4 mt-1 flex-shrink-0" />
                    <div>
                      <p>{event.date}</p>
                      <p>ob {event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                    <p>{event.location}</p>
                  </div>

                  <div className="flex items-start gap-3 text-muted-foreground text-sm">
                    <Music className="w-4 h-4 mt-1 flex-shrink-0" />
                    <div>
                      <p className="mb-1">{event.description}</p>
                      <p className="font-semibold">Program: {event.program}</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" disabled>
                  DOGODEK JE POTEKEL
                </Button>
              </Card>
            ))}
          </div>
        </section>}
      </div>
    </div>
  );
};

export default Events;