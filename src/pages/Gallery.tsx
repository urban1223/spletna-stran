import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Button } from "@/components/ui/button";

interface GalleryProject {
  title: string;
  images: { src: string; alt: string }[];
  instagramLink?: string;
}

const galleryData: GalleryProject[] = [
  {
    title: "Gloria in excelsis Deo",
    images: [
      { src: "/images/Gloria in excelsis Deo/1.jpg", alt: "Gloria in excelsis Deo 1" },
      { src: "/images/Gloria in excelsis Deo/2.jpg", alt: "Gloria in excelsis Deo 2" },
      { src: "/images/Gloria in excelsis Deo/3.jpg", alt: "Gloria in excelsis Deo 3" },
    ],
    instagramLink: "https://www.instagram.com/novaakademija",
  },
  {
    title: "Zven veličastja",
    images: [
      { src: "/images/Zven veličastja/1.jpg", alt: "Zven veličastja 1" },
      { src: "/images/Zven veličastja/2.jpg", alt: "Zven veličastja 2" },
      { src: "/images/Zven veličastja/3.jpg", alt: "Zven veličastja 3" },
    ],
    instagramLink: "https://www.instagram.com/novaakademija",
  },
  {
    title: "Baročna polifonija",
    images: [
      { src: "/images/Baročna polifonija/1.jpg", alt: "Baročna polifonija 1" },
      { src: "/images/Baročna polifonija/2.jpg", alt: "Baročna polifonija 2" },
      { src: "/images/Baročna polifonija/3.jpg", alt: "Baročna polifonija 3" },
    ],
    instagramLink: "https://www.instagram.com/novaakademija",
  },
  {
    title: "Bachu v spomin",
    images: [
      { src: "/images/Bachu v spomin/1.jpg", alt: "Bachu v spomin 1" },
      { src: "/images/Bachu v spomin/2.jpg", alt: "Bachu v spomin 2" },
      { src: "/images/Bachu v spomin/3.jpg", alt: "Bachu v spomin 3" },
    ],
    instagramLink: "https://www.instagram.com/novaakademija",
  },
];

const Gallery = () => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  const openLightbox = (images: string[], index: number) => {
    setCurrentImages(images);
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-16 text-accent text-center">
          GALERIJA
        </h1>

        <div className="space-y-16">
          {galleryData.map((project) => (
            <div key={project.title}>
              <h2 className="text-3xl font-bold text-accent mb-6 text-center">
                {project.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {project.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="cursor-pointer overflow-hidden rounded-lg shadow-lg"
                    onClick={() =>
                      openLightbox(project.images.map((i) => i.src), idx)
                    }
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-[360px] object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>

              {project.instagramLink && (
                <div className="text-center mt-8">
                  <Button
                    size="lg"
                    onClick={() => window.open(project.instagramLink, "_blank")}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8 py-6"
                  >
                    VEČ SLIK NA INSTAGRAMU
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {lightboxIndex !== null && (
          <Lightbox
            open={lightboxIndex !== null}
            slides={currentImages.map((src) => ({ src }))}
            index={lightboxIndex}
            close={closeLightbox}
            controller={{ closeOnBackdropClick: true }}
          />
        )}
      </div>
    </div>
  );
};

export default Gallery;
