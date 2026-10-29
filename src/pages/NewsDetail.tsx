import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import NewsLinkedText, { newsPlainText } from "@/components/NewsLinkedText";
import { getNewsItem } from "@/lib/news-api";

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const newsId = Number(id);
  const { data: news, isLoading, isError } = useQuery({
    queryKey: ["news", newsId],
    queryFn: () => getNewsItem(newsId),
    enabled: Number.isInteger(newsId) && newsId > 0,
    retry: false,
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Nalaganje novice …</div>;
  }

  if (isError || !news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-2xl text-muted-foreground">Novica ni bila najdena.</p>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nazaj na domačo stran
        </Button>
      </div>
    );
  }

  const description = newsPlainText(news.detailDescription || news.description);

  return (
    <div className="min-h-screen">
      <Seo
        title={news.title}
        path={`/aktualno/${news.id}`}
        type="article"
        description={description}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: news.title,
          description,
          publisher: {
            "@type": "Organization",
            name: "Nova akademija",
            url: "https://nova-akademija.si",
          },
        }}
      />
      {news.heroData && (
        <img
          src={news.heroData}
          alt={news.heroAlt || news.title}
          className="h-56 w-full object-cover sm:h-72"
        />
      )}
      <div className="container mx-auto max-w-4xl px-6 py-10 sm:px-12 sm:py-14">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Nazaj na domačo stran
        </button>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">Aktualno</p>
        <h1 className="text-3xl leading-tight text-accent sm:text-5xl">{news.title}</h1>
        <div className="pt-5 text-base leading-8 text-foreground/90 sm:text-lg">
          <NewsLinkedText text={news.detailDescription || news.description} />
        </div>
        {news.images?.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {news.images.map((image) => (
              <img
                key={image.id}
                src={image.data}
                alt={image.alt}
                className="h-28 w-full rounded-md object-cover shadow-md sm:h-32"
              />
            ))}
          </div>
        )}
        {news.links?.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-7">
            {news.links.map((link) => (
              <Button key={`${link.label}-${link.url}`} asChild variant="outline">
                <a href={link.url}>{link.label}</a>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetail;
