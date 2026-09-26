export function readNewsSnapshot() {
  if (typeof document === "undefined") return null;
  try {
    return JSON.parse(document.getElementById("news-snapshot")?.textContent || "null");
  } catch {
    return null;
  }
}
