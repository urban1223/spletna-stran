import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { members } from "@/data/members-data";

import urbanImage from "@/assets/members/urban-klancar.jpg";
import lauraImage from "@/assets/members/laura-calligaris.jpg";
import barbaraImage from "@/assets/members/barbara-kepic.jpg";
import marieImage from "@/assets/members/marie-tuhtan.jpg";
import paulinaImage from "@/assets/members/paulina-tuhtan.jpg";
import braneImage from "@/assets/members/brane-rezic.jpg";
import natalijaImage from "@/assets/members/natalija-ljubotina.jpg";
import erazemImage from "@/assets/members/erazem-zganjar.jpg";
import anaImage from "@/assets/members/ana-birsa.jpg";
import livijaImage from "@/assets/members/livija-zagar.jpg";
import domenImage from "@/assets/members/domen-gvozdanovic.jpg";
import jakobImage from "@/assets/members/jakob-istenic.jpg";
import lovroImage from "@/assets/members/lovro-tavcar.jpg";
import mojcaImage from "@/assets/members/mojca-jerman.jpg";
import lukaImage from "@/assets/members/luka-posavec.jpg";
import nezaImage from "@/assets/members/neza-gorup.jpg";

const imageMap: Record<string, string> = {
  "urban-klancar": urbanImage,
  "laura-calligaris": lauraImage,
  "barbara-kepic": barbaraImage,
  "marie-tuhtan": marieImage,
  "paulina-tuhtan": paulinaImage,
  "brane-rezic": braneImage,
  "natalija-ljubotina": natalijaImage,
  "erazem-zganjar": erazemImage,
  "ana-birsa": anaImage,
  "livija-zagar": livijaImage,
  "domen-gvozdanovic": domenImage,
  "jakob-istenic": jakobImage,
  "lovro-tavcar": lovroImage,
  "mojca-jerman": mojcaImage,
  "luka-posavec": lukaImage,
  "neza-gorup": nezaImage,
};

const MemberDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const member = members.find((m) => m.slug === slug);

  useEffect(() => {
    if (member) {
      document.title = `${member.name} – Nova akademija`;

      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute(
          "content",
          `${member.name} – ${member.role}. Inštrumenti: ${member.instruments}. ${member.shortBio}`
        );
      }

      // JSON-LD structured data
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "member-jsonld";
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": member.name,
        "description": member.shortBio,
        "jobTitle": member.role,
        "memberOf": {
          "@type": "Organization",
          "name": "Nova akademija",
          "url": "https://nova-akademija.si"
        },
        "url": `https://nova-akademija.si/clani/${member.slug}`,
      });
      document.head.appendChild(script);

      return () => {
        document.getElementById("member-jsonld")?.remove();
      };
    }
  }, [member]);

  if (!member) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-2xl text-muted-foreground">Član ni bil najden.</p>
        <Button onClick={() => navigate("/clani")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nazaj na člane
        </Button>
      </div>
    );
  }

  const image = imageMap[member.imageKey];
  const initials = member.name.split(" ").map((n) => n[0]).join("");

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-2xl">

        {/* Nazaj */}
        <button
          onClick={() => navigate("/clani")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Vsi člani
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-10 text-center">
          <Avatar className="h-56 w-56 border-4 border-accent flex-shrink-0">
            <AvatarImage src={image} alt={member.name} className="object-cover" />
            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            {member.isMentor && (
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-1">
                Mentor
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-accent">
              {member.name}
            </h1>
            <p className="text-foreground font-semibold mt-1">{member.role}</p>
            <p className="text-muted-foreground italic text-sm mt-1">
              {member.instruments}
            </p>
          </div>
        </div>

        {/* Biografija */}
        <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-justify">
          {member.fullBio}
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;