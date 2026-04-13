import { useEffect } from "react";
import { buildAbsoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME } from "./seo";

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}

export default function SiteSeo({
  title,
  description,
  path,
  canonical,
  image,
  type = "website",
  robots = "index,follow",
  jsonLd
}) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    const descriptionTag = upsertMeta('meta[name="description"]', {
      name: "description",
      content: description
    });

    const robotsTag = upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: robots
    });

    const resolvedCanonical = buildAbsoluteUrl(canonical || path || window.location.pathname);
    const canonicalLink = upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: resolvedCanonical
    });

    const ogTitleTag = upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: title ? `${title} | ${SITE_NAME}` : SITE_NAME
    });

    const ogDescriptionTag = upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description
    });

    const ogTypeTag = upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: type
    });

    const ogUrlTag = upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: resolvedCanonical
    });

    const ogImageTag = upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: buildAbsoluteUrl(image || DEFAULT_OG_IMAGE)
    });

    const twitterCardTag = upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image"
    });

    const twitterTitleTag = upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: title ? `${title} | ${SITE_NAME}` : SITE_NAME
    });

    const twitterDescriptionTag = upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description
    });

    const twitterImageTag = upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: buildAbsoluteUrl(image || DEFAULT_OG_IMAGE)
    });

    let jsonLdTag = null;

    if (jsonLd) {
      jsonLdTag = document.head.querySelector('script[data-seo-jsonld="true"]');

      if (!jsonLdTag) {
        jsonLdTag = document.createElement("script");
        jsonLdTag.type = "application/ld+json";
        jsonLdTag.dataset.seoJsonld = "true";
        document.head.appendChild(jsonLdTag);
      }

      jsonLdTag.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      document.title = previousTitle;
      descriptionTag?.remove();
      robotsTag?.remove();
      canonicalLink?.remove();
      ogTitleTag?.remove();
      ogDescriptionTag?.remove();
      ogTypeTag?.remove();
      ogUrlTag?.remove();
      ogImageTag?.remove();
      twitterCardTag?.remove();
      twitterTitleTag?.remove();
      twitterDescriptionTag?.remove();
      twitterImageTag?.remove();
      jsonLdTag?.remove();
    };
  }, [canonical, description, image, jsonLd, path, robots, title, type]);

  return null;
}
