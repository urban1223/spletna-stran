import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import urbanImage from "@/assets/members/urban-klancar.jpg";
import barbaraImage from "@/assets/members/barbara-kepic.jpg";
import lauraImage from "@/assets/members/laura-calligaris.jpg";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Home = () => {
  const navigate = useNavigate();

  const galleryImages = [
    { id: 1, src: '/images/slika-1.jpg', alt: 'Baročni ansambel Nova akademija' },
    { id: 2, src: '/images/slika-2.jpg', alt: 'Nova akademija Ilirska bistrica 1' },
    { id: 3, src: '/images/slika-3.jpg', alt: 'Slika po koncertu v Ilirski Bistrici' },
    { id: 4, src: '/images/slika-4.jpg', alt: 'Čembalo' },
    { id: 5, src: '/images/slika-5.jpg', alt: 'Pokoncertna slika' },
    { id: 6, src: '/images/slika-6.jpg', alt: 'Baročni orkester Nova akademija' },
    { id: 7, src: '/images/slika-7.jpg', alt: 'Alta capella' },
    { id: 8, src: '/images/slika-8.jpg', alt: 'Baročna oboa' },
    { id: 9, src: '/images/slika-9.jpg', alt: 'Historični inštrumenti' },
    { id: 10, src: '/images/slika-10.jpg', alt: 'Klavikord' },
    { id: 11, src: '/images/slika-11.jpg', alt: 'Klavikord 2' },
  ];

  return (
    <div className="min-h-screen">


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

      {/* Gallery Section */}
      <section className="pt-28 pb-8">
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-accent sm:text-4xl mb-9 text-center">
            Vizualni utrinki
          </h2>

          <div className="max-w-5xl mx-auto px-12">
            <Carousel
              className="w-full"
              opts={{ loop: true }}
            >
              <CarouselContent>
                {galleryImages.map((image) => (
                  <CarouselItem key={image.id}>
                    <div className="w-full aspect-video overflow-hidden rounded-lg shadow-xl cursor-pointer">
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

{/* Members Section */}
<section className="pt-28 pb-8">
  <div className="container mx-auto px-4 relative z-10">
    <h2 className="text-3xl font-bold tracking-tight text-accent sm:text-4xl mb-9 text-center">
      Naši člani
    </h2>

    <div className="grid md:grid-cols-3 gap-8 justify-center items-center mb-12">
      {/* Urban Klančar */}
      <button
        className="flex flex-col items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-lg p-2"
        onClick={() => navigate("/clani")}
      >
        <img
          src={urbanImage}
          alt="Urban Klančar"
          loading="lazy"
          className="rounded-full mx-auto object-cover w-64 h-64 border-4 border-yellow-500 shadow-lg hover:scale-105 transition-transform duration-300"
        />
        <p className="mt-4 font-semibold text-foreground">Urban Klančar</p>
      </button>

      {/* Barbara Kepic */}
      <button
        className="flex flex-col items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-lg p-2"
        onClick={() => navigate("/clani")}
      >
        <img
          src={barbaraImage}
          alt="Barbara Kepic"
          loading="lazy"
          className="rounded-full mx-auto object-cover w-64 h-64 border-4 border-yellow-500 shadow-lg hover:scale-105 transition-transform duration-300"
        />
        <p className="mt-4 font-semibold text-foreground">Barbara Kepic</p>
      </button>

      {/* Laura Calligaris */}
      <button
        className="flex flex-col items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-lg p-2"
        onClick={() => navigate("/clani")}
      >
        <img
          src={lauraImage}
          alt="Laura Calligaris"
          loading="lazy"
          className="rounded-full mx-auto object-cover w-64 h-64 border-4 border-yellow-500 shadow-lg hover:scale-105 transition-transform duration-300"
        />
        <p className="mt-4 font-semibold text-foreground">Laura Calligaris</p>
      </button>
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
