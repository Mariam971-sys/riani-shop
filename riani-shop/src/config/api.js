const rawBaseUrl =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000";

export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

export function apiUrl(path = "") {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function mediaUrl(image) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  return `${API_BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
}
