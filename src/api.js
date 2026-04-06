const explicitApiBaseUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

function getFallbackApiBaseUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  if (window.location.hostname.endsWith(".azurestaticapps.net")) {
    return "https://smxmuse-api-fegkfsc4g0hggxgg.eastus2-01.azurewebsites.net";
  }

  return "";
}

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const resolvedApiBaseUrl = explicitApiBaseUrl || getFallbackApiBaseUrl();
  return resolvedApiBaseUrl ? `${resolvedApiBaseUrl}${normalizedPath}` : normalizedPath;
}
