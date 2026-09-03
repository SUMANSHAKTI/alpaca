const ENV_API_URL =
  (import.meta as any).env?.VITE_API_URL as string | undefined;

// Local development:
//   http://localhost:8000
//
// Production:
//   https://alpaca-pmmg.onrender.com
const API_BASE_URL =
  ENV_API_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:8000"
    : "https://alpaca-pmmg.onrender.com");


export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${API_BASE_URL.replace(/\/$/, "")}/api${cleanPath}`;
};


export const getWsUrl = (path: string): string => {
  const cleanPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const wsProto = API_BASE_URL.startsWith("https")
    ? "wss:"
    : "ws:";

  const host = API_BASE_URL
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  return `${wsProto}//${host}/api${cleanPath}`;
};


export { API_BASE_URL };
