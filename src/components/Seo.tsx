import { useEffect } from "react";

const SITE_NAME = "Nova akademija";
const BASE_URL = "https://nova-akademija.si";
const DEFAULT_IMAGE = `${BASE_URL}/images/preview-spletne.jpg`;
const DEFAULT_DESCRIPTION =
  "Kulturno društvo za širjenje stare glasbe 16. do 18. stoletja. Raziskujemo, izobražujemo in izvajamo zgodovinsko ozaveščeno staro glasbo v Sloveniji.";

interface SeoProps {
  /** Naslov strani brez imena društva — ta se doda samodejno. */
  title: string;
  description?: string;
  /** Pot brez domene, npr. "/o-nas". Za domačo stran pusti prazno. */
  path?: string;
  image?: string;
  /** og:type — "website" za sezname, "article"/"profile" za posamezne vsebine. */
  type?: string;
  /** Če je true, se stran ne indeksira (npr. 404). */
  noindex?: boolean;
  /** Neobvezni schema.org JSON-LD objekt. */
  jsonLd?: Record<string, unknown>;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Nastavi naslov strani in meta oznake (SEO, Open Graph, Twitter, canonical,
 * neobvezni JSON-LD) za posamezno stran. Ker gre za SPA, se oznake posodobijo
 * ob vsaki menjavi poti prek useEffect.
 */
const Seo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  jsonLd,
}: SeoProps) => {
  const jsonLdStr = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const fullTitle = `${title} – ${SITE_NAME}`;
    const url = `${BASE_URL}${path}`;

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertLink("canonical", url);

    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", image);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);

    if (noindex) {
      upsertMeta("name", "robots", "noindex, follow");
    } else {
      document.head.querySelector('meta[name="robots"]')?.remove();
    }

    document.getElementById("seo-jsonld")?.remove();
    if (jsonLdStr) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "seo-jsonld";
      script.text = jsonLdStr;
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById("seo-jsonld")?.remove();
      if (noindex) document.head.querySelector('meta[name="robots"]')?.remove();
    };
  }, [title, description, path, image, type, noindex, jsonLdStr]);

  return null;
};

export default Seo;
