import { Link } from "react-router-dom";
import Seo from "./SiteSeo";
import UnifiedSearch from "./UnifiedSearch";

const recoveryLinks = [
  {
    to: "/results",
    eyebrow: "Race archive",
    title: "Explore results",
    description: "Browse every season and open complete race results."
  },
  {
    to: "/riders",
    eyebrow: "Rider directory",
    title: "Find a rider",
    description: "Search profiles, career results, points, and statistics."
  },
  {
    to: "/season",
    eyebrow: "Current action",
    title: "Open the season",
    description: "Follow standings, trends, laps led, and championship stats."
  }
];

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <Seo
        title="Page Not Found"
        description="The requested smxmuse page could not be found. Search the archive or browse rider profiles, race results, and season dashboards."
        robots="noindex,nofollow"
      />

      <section className="not-found-hero">
        <div className="not-found-mark" aria-hidden="true">
          <img src="/smxmuselogo.png" alt="" />
          <span>404</span>
        </div>

        <div className="not-found-copy">
          <p className="not-found-kicker">Page not found</p>
          <h1>This page missed the gate.</h1>
          <p>
            The page may have moved, or the address might not be quite right. Search the archive
            for a rider or venue, or head back to familiar ground.
          </p>

          <div className="not-found-search" aria-label="Search the smxmuse archive">
            <UnifiedSearch />
          </div>

          <Link to="/" className="not-found-home-link">
            Back to the homepage
          </Link>
        </div>
      </section>

      <section className="not-found-recovery" aria-labelledby="not-found-recovery-title">
        <div className="not-found-section-heading">
          <p>Keep exploring</p>
          <h2 id="not-found-recovery-title">Pick up somewhere else in the archive.</h2>
        </div>

        <div className="not-found-link-grid">
          {recoveryLinks.map((item) => (
            <Link key={item.to} to={item.to} className="not-found-link-card">
              <span>{item.eyebrow}</span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <small>Open section →</small>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
