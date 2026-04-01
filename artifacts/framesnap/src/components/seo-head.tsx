import { useEffect } from "react";

type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string[];
  type?: "website" | "article";
  image?: string;
  noIndex?: boolean;
  structuredData?: StructuredData;
}

const SITE_NAME = "TimexFrame";
const DEFAULT_IMAGE = "/favicon.svg";
const STRUCTURED_DATA_ID = "timexframe-structured-data";

function upsertMeta(selector: string, attributes: Record<string, string>, content: string) {
  let meta = document.head.querySelector<HTMLMetaElement>(selector);

  if (!meta) {
    meta = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => meta!.setAttribute(key, value));
    document.head.appendChild(meta);
  }

  Object.entries(attributes).forEach(([key, value]) => meta!.setAttribute(key, value));
  meta.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);
}

function getAbsoluteUrl(path?: string) {
  if (!path) return window.location.href;
  return new URL(path, window.location.origin).toString();
}

export function SeoHead({
  title,
  description,
  canonicalPath,
  keywords = [],
  type = "website",
  image = DEFAULT_IMAGE,
  noIndex = false,
  structuredData,
}: SeoHeadProps) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const absoluteUrl = getAbsoluteUrl(canonicalPath);
    const absoluteImage = image.startsWith("http") ? image : getAbsoluteUrl(image);

    document.title = fullTitle;

    upsertMeta('meta[name="description"]', { name: "description" }, description);
    upsertMeta('meta[name="keywords"]', { name: "keywords" }, keywords.join(", "));
    upsertMeta('meta[name="robots"]', { name: "robots" }, noIndex ? "noindex, nofollow" : "index, follow");

    upsertMeta('meta[property="og:title"]', { property: "og:title" }, fullTitle);
    upsertMeta('meta[property="og:description"]', { property: "og:description" }, description);
    upsertMeta('meta[property="og:type"]', { property: "og:type" }, type);
    upsertMeta('meta[property="og:url"]', { property: "og:url" }, absoluteUrl);
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, SITE_NAME);
    upsertMeta('meta[property="og:image"]', { property: "og:image" }, absoluteImage);

    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, fullTitle);
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, description);
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image" }, absoluteImage);

    upsertCanonical(absoluteUrl);

    const existingScript = document.getElementById(STRUCTURED_DATA_ID);
    if (structuredData) {
      const script = existingScript instanceof HTMLScriptElement ? existingScript : document.createElement("script");
      script.id = STRUCTURED_DATA_ID;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(structuredData);
      if (!existingScript) {
        document.head.appendChild(script);
      }
    } else if (existingScript) {
      existingScript.remove();
    }
  }, [canonicalPath, description, image, keywords, noIndex, structuredData, title, type]);

  return null;
}
