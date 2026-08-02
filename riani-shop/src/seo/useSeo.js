import { useEffect } from "react";
import { applySeo } from "./applySeo";

const SCRIPT_ATTR = "data-riani-jsonld";

function clearJsonLd() {
  document
    .querySelectorAll(`script[${SCRIPT_ATTR}]`)
    .forEach((node) => node.remove());
}

function injectJsonLd(schemas) {
  clearJsonLd();

  (schemas || []).filter(Boolean).forEach((schema) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(SCRIPT_ATTR, "true");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

export function useSeo({
  enabled = true,
  title,
  description,
  path,
  image,
  type,
  noindex,
  jsonLd = [],
}) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    applySeo({
      title,
      description,
      path,
      image,
      type,
      noindex,
    });

    injectJsonLd(jsonLd);

    return () => {
      clearJsonLd();
    };
  }, [
    enabled,
    title,
    description,
    path,
    image,
    type,
    noindex,
    JSON.stringify(jsonLd),
  ]);
}
