import {
  DEFAULT_DESCRIPTION,
  DEFAULT_LOGO,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "./site";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: DEFAULT_LOGO,
    image: DEFAULT_OG_IMAGE,
    description: DEFAULT_DESCRIPTION,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
  };
}

export function websiteSearchSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path.startsWith("http")
        ? item.path
        : `${SITE_URL}${item.path}`,
    })),
  };
}

export function productSchema(product, options = {}) {
  const {
    url,
    images = [],
    price,
    originalPrice,
    currency = "SEK",
    availability,
  } = options;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `Buy ${product.name} at ${SITE_NAME}.`,
    sku: String(product._id || product.id || ""),
    brand: {
      "@type": "Brand",
      name: product.brand || "Riani",
    },
    category: product.category || "Fashion",
    image: images.length > 0 ? images : [DEFAULT_OG_IMAGE],
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: Number(price || 0).toFixed(2),
      availability:
        availability ||
        (Number(product.countInStock || 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock"),
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };

  if (
    originalPrice &&
    Number(originalPrice) > Number(price)
  ) {
    schema.offers.priceValidUntil = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 30
    )
      .toISOString()
      .slice(0, 10);
  }

  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.numReviews || 0);

  if (rating > 0 && reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.toFixed(1),
      reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  if (Array.isArray(product.reviews) && product.reviews.length > 0) {
    schema.review = product.reviews
      .slice(0, 10)
      .map((review) => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: review.name || "Customer",
        },
        datePublished: review.createdAt
          ? new Date(review.createdAt).toISOString().slice(0, 10)
          : undefined,
        reviewBody: review.comment,
        reviewRating: {
          "@type": "Rating",
          ratingValue: Number(review.rating || 0),
          bestRating: "5",
          worstRating: "1",
        },
      }));
  }

  return schema;
}
