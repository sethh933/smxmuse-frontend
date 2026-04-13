export const SITE_NAME = "SMXmuse";
export const SITE_URL = "https://smxmuse.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/smxmuselogo.png`;

export function buildAbsoluteUrl(path = "/") {
  if (!path) return SITE_URL;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function parseRiderId(riderParam) {
  if (riderParam === undefined || riderParam === null) {
    return "";
  }

  const match = String(riderParam).match(/(\d+)(?:\/)?$/);
  return match ? match[1] : String(riderParam);
}

export function buildRiderPath(riderId, fullName, suffix = "") {
  const id = String(riderId ?? "").trim();
  const baseSlug = slugify(fullName);
  const slug = baseSlug ? `${baseSlug}-${id}` : id;
  const normalizedSuffix = suffix
    ? suffix.startsWith("/")
      ? suffix
      : `/${suffix}`
    : "";

  return `/rider/${slug}${normalizedSuffix}`;
}

export function parseTrackId(trackParam) {
  if (trackParam === undefined || trackParam === null) {
    return "";
  }

  const match = String(trackParam).match(/(\d+)(?:\/)?$/);
  return match ? match[1] : String(trackParam);
}

export function parseSportParam(sportParam) {
  const normalized = String(sportParam ?? "").trim().toUpperCase();

  if (normalized === "1" || normalized === "SX") return 1;
  if (normalized === "2" || normalized === "MX") return 2;
  if (normalized === "3" || normalized === "SMX") return 3;

  const numeric = Number(sportParam);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function buildTrackPath(sportId, trackId, trackName) {
  const sportCodeMap = {
    1: "SX",
    2: "MX",
    3: "SMX"
  };

  const parsedSportId = parseSportParam(sportId);
  const resolvedSportId = sportCodeMap[parsedSportId] || String(sportId ?? "").trim();
  const resolvedTrackId = String(trackId ?? "").trim();
  const trackSlug = slugify(trackName);
  const pathSegment = trackSlug ? `${trackSlug}-${resolvedTrackId}` : resolvedTrackId;

  return `/track/${resolvedSportId}/${pathSegment}`;
}

export function parseRaceId(raceParam) {
  if (raceParam === undefined || raceParam === null) {
    return "";
  }

  const match = String(raceParam).match(/(\d+)(?:\/)?$/);
  return match ? match[1] : String(raceParam);
}

export function buildRacePath(raceId, trackName, year, options = {}) {
  const resolvedRaceId = String(raceId ?? "").trim();
  const sportId = parseSportParam(options.sportId);
  const raceLabel = sportId === 1
    ? options.city || trackName
    : trackName || options.city;
  const raceSlug = slugify([raceLabel, year].filter(Boolean).join("-"));
  const pathSegment = raceSlug ? `${raceSlug}-${resolvedRaceId}` : resolvedRaceId;

  return `/race/${pathSegment}`;
}
