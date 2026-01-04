import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Music } from "lucide-react";

const Events = () => {
  const upcomingEvents = [

    
    {
      title: "Zven Veličastja - SAKRALNI ABONMA",
      date: "Sreda, 7. januar 2026",
      time: "19:30",
      location: "Uršulinska cerkev Sv. Trojice, Ljubljana",
      description: "AKADEMSKI PEVSKI ZBOR FRANCE PREŠEREN KRANJ, solisti in priložnostni baročni orkester",
      program: "I. Posch, J. L. Bach, G. Allegri, M. A. Charpentier",
      conductor: "Dirigent: Erik Šmid",
      cta: "OGLEJTE SI LOKACIJO",
      link: "https://maps.app.goo.gl/JxPjxvEoyTzeZ4FC8",
    },
  ];

  const pastEvents = [
        {
    title: "Gloria in excelsis Deo",
    date: "Četrtek, 25. december 2025",
    time: "19:30",
    location: "Stolnica sv. Nikolaja v Ljubljani",
    description: "Božični koncert v sodelovanju s Consortium musicum, Slovenskim Baročnim Orkestrom, Baročnim orkestrom UL AG",
    program: "J.S. Bach (BWV 191), G.F. Händel (HWV 56, 1. del)",
    conductor: "Dirigent: Egon Mihajlović",
    admission: "VSTOP PROST",
    cta: "OGLEJTE SI LOKACIJO",
    link: "https://maps.app.goo.gl/Y4r5z95X6oMNYhFB6", 
    },  
    {
      title: "Zven Veličastja",
      date: "Sobota, 27. december 2025",
      time: "17:00",
      location: "Dvorana Gimnazije Kranj",
      description: "AKADEMSKI PEVSKI ZBOR FRANCE PREŠEREN KRANJ, solisti in priložnostni baročni orkester",
      program: "I. Posch, J. L. Bach, G. Allegri, M. A. Charpentier",
      conductor: "Dirigent: Erik Šmid",
      cta: "KUPI VSTOPNICE",
      link: "https://www.facebook.com/photo/?fbid=1505282407718468&set=a.848350820078300",
    },
    {
      title: "Zven Veličastja",
      date: "Nedelja, 27. december 2025",
      time: "19:00",
      location: "Dvorana Gimnazije Kranj",
      description: "AKADEMSKI PEVSKI ZBOR FRANCE PREŠEREN KRANJ, solisti in priložnostni baročni orkester",
      program: "I. Posch, J. L. Bach, G. Allegri, M. A. Charpentier",
      conductor: "Dirigent: Erik Šmid",
      cta: "KUPI VSTOPNICE",
      link: "https://www.facebook.com/photo/?fbid=1505282407718468&set=a.848350820078300",
    },
        {
      title: "Baročna polifonija",
      date: "Sreda, 22. oktober 2025",
      time: "18:45",
      location: "Cerkev svetega Kancijana in tovarišev, Kranj",
      description: "Sodelovanje pri maši in krajši koncert",
      program: "J. S. Bach, G. P. Telemann",
      price: "Vstop prost, prostovoljni prispevki zaželeni",
      cta: "OGLEJTE SI LOKACIJO",
      link: "https://maps.app.goo.gl/BV7MQP2aFzGoyZ6r8",
    },

    {
      title: "Bachu v spomin",
      date: "Četrtek, 16. oktober 2025",
      time: "19:00",
      location: "Cerkev Svetega Petra, Ilirska Bistrica",
      description: "V okviru Festivala Reka Reka",
      program: "J. S. Bach in C. P. E. Bach",
      cta: "KUPI VSTOPNICE",
      link: "https://www.ilirska-bistrica.si/dogodek/1174450",
    },
    

  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-16 text-accent text-center">
          KONCERTI
        </h1>

        {/* Upcoming Events */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Prihajajoči koncerti
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.map((event, index) => (
              <Card key={index} className="p-6 bg-card border-border hover:border-accent transition-all flex flex-col">
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
                      <p className="text-sm font-semibold text-foreground">Program: {event.program}</p>
                      {event.conductor && <p className="text-sm mt-1">{event.conductor}</p>}
                    </div>
                  </div>


                </div>

                <Button 
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-auto"
                  onClick={() => window.open(event.link, '_blank')}
                >
                  {event.cta}
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Past Events Archive */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Arhiv preteklih koncertov
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pastEvents.map((event, index) => (
              <Card key={index} className="p-6 bg-card border-border opacity-75">
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

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {}}
                >
                  DOGODEK JE POTEKEL
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Events;
