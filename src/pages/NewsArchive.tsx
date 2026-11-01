import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/Seo";
import NewsLinkedText from "@/components/NewsLinkedText";
import { getNews } from "@/lib/news-api";

const NewsArchive = () => {
  const { data: news = [], isLoading, isError } = useQuery({
    queryKey: ["news"],
    queryFn: getNews,
  });

  return (
    <div className="min-h-screen py-20">
      <Seo
        title="Arhiv novic"
        path="/aktualno"
        description="Arhiv novic, obvestil in zgodb društva Nova akademija."
      />
      <div className="container mx-auto px-4">
        <h1 className="mb-16 text-center text-5xl font-bold text-accent">ARHIV NOVIC</h1>

        {isLoading && <p className="text-muted-foreground">Nalaganje novic …</p>}
        {isError && <p className="text-destructive">Novic trenutno ni mogoče naložiti.</p>}
        {!isLoading && !isError && news.length === 0 && (
          <p className="text-center text-muted-foreground">Trenutno ni objavljenih novic.</p>
        )}

        {!isLoading && !isError && news.length > 0 && (
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {news.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-lg border border-accent/30 bg-background/80 shadow-lg"
              >
                {item.heroData && (
                  <img
                    src={item.heroData}
                    alt={item.heroAlt || item.title}
                    loading="lazy"
                    decoding="async"
                    className="h-52 w-full object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-accent">
                    <Link to={`/aktualno/${item.id}`} className="hover:underline">
                      {item.title}
                    </Link>
                  </h2>
                  <p className="mt-3 line-clamp-4 leading-relaxed text-foreground/85">
                    <NewsLinkedText text={item.description} />
                  </p>
                  <Link
                    to={`/aktualno/${item.id}`}
                    className="mt-5 inline-block font-semibold text-accent hover:underline"
                  >
                    Preberi več
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsArchive;
