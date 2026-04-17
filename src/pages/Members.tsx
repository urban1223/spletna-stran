import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight } from "lucide-react";
import MembershipSignupDialog from "@/components/MembershipSignupDialog";
import { regularMembers, mentors } from "@/data/members-data";

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
};

const MemberCard = ({ member, navigate }: { member: any; navigate: any }) => (
  <Card
    className="p-8 bg-card border-border hover:border-accent transition-colors cursor-pointer"
    onClick={() => navigate(`/clani/${member.slug}`)}
  >
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-accent mb-1">{member.name}</h3>
          <p className="text-sm font-semibold text-foreground mb-2">{member.role}</p>
          <p className="text-sm text-muted-foreground italic">{member.instruments}</p>
        </div>
        <Avatar className="h-16 w-16 border-2 border-accent">
          <AvatarImage src={imageMap[member.imageKey]} alt={member.name} />
          <AvatarFallback>
            {member.name.split(" ").map((n: string) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
      </div>
      <p className="text-muted-foreground leading-relaxed flex-grow">{member.shortBio}</p>
      <div className="flex justify-end mt-auto">
        <ArrowRight className="w-6 h-6 text-accent" />
      </div>
    </div>
  </Card>
);

const Members = () => {
  const navigate = useNavigate();
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-6 text-accent text-center">
          ČLANI IN MENTORJI DRUŠTVA
        </h1>
        <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-16">
          Član Nove akademije lahko postane vsak, ki se ljubiteljsko ali profesionalno ukvarja s staro glasbo.
          Nekateri člani so mednarodno izobraženi slovenski glasbeniki, ki prinašajo svež
          zagon in nove ideje na slovensko sceno stare glasbe.
        </p>

        {/* Člani */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-accent mb-8 text-center">Člani</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {regularMembers.map((member) => (
              <MemberCard key={member.slug} member={member} navigate={navigate} />
            ))}
          </div>
        </div>

        {/* Mentorji */}
        <div>
          <h2 className="text-3xl font-bold text-accent mb-8 text-center">Mentorji</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {mentors.map((member) => (
              <MemberCard key={member.slug} member={member} navigate={navigate} />
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={() => setSignupDialogOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
          >
            VČLANITE SE
          </Button>
        </div>

        <MembershipSignupDialog
          open={signupDialogOpen}
          onOpenChange={setSignupDialogOpen}
        />
      </div>
    </div>
  );
};

export default Members;