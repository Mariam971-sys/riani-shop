const configured = import.meta.env.VITE_API_URL?.trim();

if (!configured && import.meta.env.PROD) {
  console.error(
    "VITE_API_URL is missing. Set it to your backend URL ending with /api."
  );
}

export const API_BASE_URL = (
  configured || "http://localhost:5000/api"
).replace(/\/$/, "");

/**
 * Build a full API URL.
 *
 * VITE_API_URL already includes `/api`,
 * so pass paths like `/products`.
 *
 * Legacy `/api/...` paths are also accepted
 * and normalized.
 */
export function apiUrl(path = "") {
  if (!path) {
    return API_BASE_URL;
  }

  let normalized = path.startsWith("/")
    ? path
    : `/${path}`;

  if (normalized === "/api") {
    normalized = "";
  } else if (normalized.startsWith("/api/")) {
    normalized = normalized.slice(4);
  }

  return `${API_BASE_URL}${normalized}`;
}

export function mediaUrl(image) {
  if (!image) {
    return "";
  }

  // External images such as Printful CDN
  if (
    /^https?:\/\//i.test(image) ||
    image.startsWith("data:")
  ) {
    return image;
  }

  const backendOrigin = API_BASE_URL.replace(
    /\/api$/,
    ""
  );

  const normalized = image.startsWith("/")
    ? image
    : `/${image}`;

  return `${backendOrigin}${normalized}`;
}