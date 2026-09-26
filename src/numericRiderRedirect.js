import { buildRiderPath, slugify } from "./seo.js";

// Only normalize legacy public URLs after this rider's identity has loaded.
export function numericRiderDestination(location, riderId, fullName) {
  const match = location.pathname.match(/^\/rider\/(\d+)(?:\/(results|points))?\/?$/);
  if (!match || match[1] !== String(riderId) || !slugify(fullName)) return null;
  return buildRiderPath(riderId, fullName, match[2] || "") +
    (location.search || "") + (location.hash || "");
}
