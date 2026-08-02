const rawBaseUrl =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL.trim()
    : import.meta.env.DEV
      ? "http://localhost:5000"
      : "";

export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

export function apiUrl(path = "") {
  if (!path) return API_BASE_URL || "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

export function mediaUrl(image) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  return `${API_BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
}
