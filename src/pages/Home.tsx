import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { members as legacyMembers, type Member } from "@/data/members-data";
import { getMembers, type AdminMember } from "@/lib/members-api";
import { getNews, type NewsItem } from "@/lib/news-api";
import { getSessionCookie, setSessionCookie } from "@/lib/cookies";
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
import luka1Image from "@/assets/members/luka-poljanec.jpg";
import martinImage from "@/assets/members/martin-tavcar.jpg";
import vesnaImage from "@/assets/members/vesna-gostic.jpg";

const imageMap: Record<string, string> = {
  "urban-klancar": urbanImage, "laura-calligaris": lauraImage, "barbara-kepic": barbaraImage,
  "marie-tuhtan": marieImage, "paulina-tuhtan": paulinaImage, "brane-rezic": braneImage,
  "natalija-ljubotina": natalijaImage, "erazem-zganjar": erazemImage, "ana-birsa": anaImage,
  "livija-zagar": livijaImage, "domen-gvozdanovic": domenImage, "jakob-istenic": jakobImage,
  "lovro-tavcar": lovroImage, "mojca-jerman": mojcaImage, "luka-posavec": lukaImage,
  "neza-gorup": nezaImage, "luka-poljanec": luka1Image, "martin-tavcar": martinImage,
  "vesna-gostic": vesnaImage,
};

type HomeMember = Member & { imageUrl?: string | null };

const chooseMembers = (available: HomeMember[]) => {
  const saved = getSessionCookie("nova_home_members")?.split(",") || [];
  const savedMembers = saved.map((slug) => available.find((member) => member.slug === slug)).filter(Boolean) as HomeMember[];
  if (savedMembers.length === 3) return savedMembers;
  const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 3);
  setSessionCookie("nova_home_members", shuffled.map((member) => member.slug).join(","));
  return shuffled;
};

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Home = () => {
  const navigate = useNavigate();
  const [homeMembers, setHomeMembers] = useState<HomeMember[]>(() => chooseMembers(legacyMembers));
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    getMembers()
      .then((loadedMembers: AdminMember[]) => setHomeMembers(chooseMembers(loadedMembers)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    getNews().then(setNews).catch(() => undefined);
  }, []);

  const galleryImages = [
    { id: 1, src: '/images/slika-1.jpg', alt: 'Baročni ansambel Nova akademija' },
    { id: 2, src: '/images/slika-2.jpg', alt: 'Vaja v Stolnici Ljubljana' },
    { id: 3, src: '/images/slika-3.jpg', alt: 'Tartini junior' },
    { id: 4, src: '/images/slika-4.jpg', alt: 'Te Deum pihalci' },
    { id: 5, src: '/images/slika-5.jpg', alt: 'Koncert v Kranju' },
    { id: 6, src: '/images/slika-6.jpg', alt: 'Baročni orkester Nova akademija' },
    { id: 7, src: '/images/slika-7.jpg', alt: 'Koncert v Kranju' },
    { id: 8, src: '/images/slika-8.jpg', alt: 'Ansambel Nova akademija' },
    { id: 9, src: '/images/slika-9.jpg', alt: 'Komorna glasba' },
    { id: 10, src: '/images/slika-10.jpg', alt: 'Violinistka na koncertu' },
    { id: 11, src: '/images/slika-11.jpg', alt: 'Tartini v Ljubljani' },
  ];

  return (
    <div className="min-h-screen">
      <Seo
        title="Društvo za širjenje stare glasbe"
        path="/"
      />

      {/* Hero Section */}
      <section 
        className="relative min-h-[500px] flex items-center justify-center py-6 md:py-12"
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <p className="text-accent text-lg md:text-xl font-semibold tracking-wider mb-4">
            Društvo za širjenje stare glasbe
          </p>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white"> 
            Nova akademija
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed"> 
            Povezujemo bogato evropsko glasbeno tradicijo z novo generacijo izvajalcev. 
            Staro glasbo želimo v sodobnem okolju prenesti med različne generacije, 
            podprti z zgodovinsko ozaveščenim izvajanjem.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/dogodki")}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8 py-6 text-base"
          >
           NASLEDNJI KONCERT
          </Button>
        </div>
      </section>

      {news.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-accent sm:text-4xl mb-9 text-center">
              Aktualno
            </h2>
            <div className="mx-auto max-w-5xl space-y-5">
              {news.slice(0, 3).map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col sm:flex-row overflow-hidden rounded-lg border border-accent/30 bg-background/80 shadow-lg"
                >
                  {item.heroData ? (
                    <img
                      src={item.heroData}
                      alt={item.heroAlt || item.title}
                      className="h-52 w-full object-cover sm:h-auto sm:w-2/5"
                    />
                  ) : (
                    <div className="hidden sm:block sm:w-2/5 bg-accent/10" aria-hidden="true" />
                  )}
                  <div className="flex flex-1 items-center justify-between gap-5 p-5 sm:p-7">
                    <div className="min-w-0">
                      <h3 className="text-2xl font-semibold text-accent">{item.title}</h3>
                      <p className="mt-3 line-clamp-3 leading-relaxed text-foreground/85">{item.description}</p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setSelectedNews(item)}
                      className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Preberi več
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      <section className="pt-28 pb-8">
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-accent sm:text-4xl mb-9 text-center">
            Vizualni utrinki
          </h2>

          <div className="max-w-6xl mx-auto px-1 sm:px-4 md:px-12">
            <Carousel
              className="w-full"
              opts={{ loop: true }}
            >
              <CarouselContent>
                {galleryImages.map((image) => (
                  <CarouselItem key={image.id}>
                    <div className="w-full aspect-[4/3] sm:aspect-video overflow-hidden rounded-lg shadow-xl cursor-pointer">
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading="lazy"
                        className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>

            {/* Button to Gallery */}
            <div className="text-center mt-8">
              <Button
                size="lg"
                onClick={() => navigate("/galerija")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8 py-4"
              >
               VEČ SLIK
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={selectedNews !== null} onOpenChange={(open) => !open && setSelectedNews(null)}>
        <DialogContent className="max-h-[96vh] w-[calc(100%-1rem)] max-w-6xl overflow-y-auto border-accent/30 bg-background p-0 sm:rounded-xl">
          {selectedNews && (
            <>
              <div className="min-h-[80vh]">
                {selectedNews.heroData && (
                  <img
                    src={selectedNews.heroData}
                    alt={selectedNews.heroAlt || selectedNews.title}
                    className="h-56 w-full object-cover sm:h-72"
                  />
                )}
                <div className="mx-auto max-w-4xl px-6 py-10 sm:px-12 sm:py-14">
                  <DialogHeader className="mb-8 text-left">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">Aktualno</p>
                    <DialogTitle className="text-3xl leading-tight text-accent sm:text-5xl">
                      {selectedNews.title}
                    </DialogTitle>
                    <DialogDescription className="whitespace-pre-line pt-5 text-base leading-8 text-foreground/90 sm:text-lg">
                      {selectedNews.detailDescription || selectedNews.description}
                    </DialogDescription>
                  </DialogHeader>
                  {selectedNews.images.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      {selectedNews.images.map((image) => (
                        <img
                          key={image.id}
                          src={image.data}
                          alt={image.alt}
                          className="h-48 w-full rounded-md object-cover shadow-md sm:h-40"
                        />
                      ))}
                    </div>
                  )}
                  {selectedNews.links.length > 0 && (
                    <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-7">
                      {selectedNews.links.map((link) => (
                        <Button key={`${link.label}-${link.url}`} asChild variant="outline">
                          <a href={link.url}>{link.label}</a>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

{/* Members Section */}
<section className="pt-28 pb-8">
  <div className="container mx-auto px-4 relative z-10">
    <h2 className="text-3xl font-bold tracking-tight text-accent sm:text-4xl mb-9 text-center">
      Naši člani
    </h2>

    <div className="grid md:grid-cols-3 gap-8 justify-center items-center mb-12">
      {homeMembers.map((member) => (
        <button
          key={member.slug}
          className="flex flex-col items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-lg p-2"
          onClick={() => navigate(`/clani/${member.slug}`)}
        >
          <img
            src={member.imageUrl || imageMap[member.imageKey]}
            alt={member.name}
            loading="lazy"
            className="rounded-full mx-auto object-cover w-64 h-64 border-4 border-yellow-500 shadow-lg hover:scale-105 transition-transform duration-300"
          />
          <p className="mt-4 font-semibold text-foreground">{member.name}</p>
        </button>
      ))}
    </div>

    {/* Button to full members page */}
    <div className="text-center mt-8">
      <Button
        size="lg"
        onClick={() => navigate("/clani")}
        className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8 py-4"
      >
       VSI ČLANI
      </Button>
    </div>
  </div>
</section>





      {/* Naša vizija Section */}
      <section className="pt-0 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            <h2 className="text-4xl font-bold mb-4 text-accent text-center mt-32">
              Naša vizija
            </h2>

            <p className="text-lg text-white/90 leading-relaxed text-justify">
              Nova akademija je dobila navdih v delovanju Academie Philharmonicorum, 
              ustanovljene leta 1701. Ta je sledila italijanskim vzorom in predstavljala 
              eno prvih ključnih glasbenih ustanov na Slovenskem. Tako kot oni, si tudi mi 
              želimo združevati glasbenike in ljubitelje umetnosti. Ponujamo jim ne le 
              kvalitetne glasbene izkušnje, temveč tudi raziskovanje in izobraževanje na 
              področju glasbene dediščine od 16. do 18. stoletja. Naši člani, ki svoje znanje 
              pridobivajo in nadgrajujejo na priznanih evropskih glasbenih akademijah, s 
              svojim delom širijo meje vizije prvotne Academie Philharmonicorum in našo Novo 
              akademijo resnično postavljajo v sodobni evropski kontekst.
            </p>
          </div>
    <div className="text-center mt-8">
      <Button
        size="lg"
        onClick={() => navigate("/o-nas")}
        className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8 py-4"
      >
        O NAS
      </Button>
    </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
