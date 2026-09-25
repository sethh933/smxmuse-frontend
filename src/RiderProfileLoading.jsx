import { Link, useLocation } from "react-router-dom";
import RiderCareerOverview from "./RiderCareerOverview";
import Seo from "./SiteSeo";
import { buildRiderPath } from "./seo";

// Keep the build snapshot visible during loading and transient API failures.
export default function RiderProfileLoading({ riderId, suffix = "", error, rider }) {
  const location = useLocation();
  let snapshot;
  try {
    snapshot = JSON.parse(document.getElementById("rider-profile-snapshot")?.textContent || "null");
  } catch { /* Client-side navigation may have no build snapshot. */ }
  if (String(snapshot?.riderId) !== String(riderId) ||
      snapshot?.path !== location.pathname.replace(/\/$/, "")) snapshot = null;
  const name = snapshot?.heading || rider?.full_name;
  const path = snapshot?.path || (name ? buildRiderPath(riderId, name, suffix) : null);
  const profilePath = name ? buildRiderPath(riderId, name) : null;
  const label = suffix === "points" ? "Points Standings History" : suffix === "results" ? "Career Results" : "Career Stats and Race Results";
  return <section className="rider-profile-page rider-profile-hero" aria-busy={!error}>
    {name && <>
      <Seo title={snapshot?.title || `${name} ${label}`}
        description={snapshot?.description || `Explore ${name}'s ${label.toLowerCase()} on smxmuse.`}
        path={path} canonical={path} image={snapshot?.image || rider?.image_url}
        type={snapshot?.type || "profile"} jsonLd={snapshot?.jsonLd} />
      <h1>{name}</h1>
      <nav className="rider-nav" aria-label="Rider profile">
        <Link className="rider-nav-button" to={profilePath}>Career Stats</Link>
        <Link className="rider-nav-button" to={`${profilePath}/results`}>Career Results</Link>
        <Link className="rider-nav-button" to={`${profilePath}/points`}>Points Standings</Link>
      </nav>
      <RiderCareerOverview overview={snapshot?.careerOverview} />
    </>}
    {error ? <div role="alert">
      <p>We couldn’t load the latest rider data. Please try again.</p>
      <button type="button" className="rider-nav-button" onClick={() => window.location.reload()}>Try again</button>
    </div> : <p role="status">Loading {name ? "full career tables" : "rider data"}…</p>}
  </section>;
}
