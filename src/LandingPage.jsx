import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "./api";

const FEATURED_PATHS = [
  {
    title: "Comparison Tool",
    description:
      "Stack two riders side by side and compare wins, podiums, starts, and career shape.",
    to: "/compare",
    eyebrow: "Compare"
  },
  {
    title: "Race Results",
    description:
      "Jump into every round and drill down from schedule to full race sheets.",
    to: "/results",
    eyebrow: "Archive"
  },
  {
    title: "Rider Profiles",
    description:
      "Browse rider profiles, results, points trends, and country pages.",
    to: "/riders",
    eyebrow: "People"
  },
  {
    title: "Season Dashboards",
    description:
      "Track championships with standings trends, laps led, and season-wide stats.",
    to: "/season",
    eyebrow: "Dashboards"
  },
  {
    title: "All-Time Leaderboards",
    description:
      "See who owns the record books across wins, podiums, and career milestones.",
    to: "/leaderboards",
    eyebrow: "History"
  }
];

const SPORT_META = {
  sx: { sportId: 1, label: "Supercross" },
  mx: { sportId: 2, label: "Motocross" }
};

const CLASS_LABELS = {
  1: "450",
  2: "250",
  3: "500"
};

function getCountryCode(country) {
  const countryMap = {
    "United States": "us",
    "United Kingdom": "gb",
    "England": "gb",
    "Wales": "gb",
    "Scotland": "gb",
    "Argentina": "ar",
    "Australia": "au",
    "Belgium": "be",
    "Bolivia": "bo",
    "Brazil": "br",
    "Canada": "ca",
    "Chile": "cl",
    "Colombia": "co",
    "Costa Rica": "cr",
    "Czechia": "cz",
    "Denmark": "dk",
    "Dominican Republic": "do",
    "Ecuador": "ec",
    "Estonia": "ee",
    "Finland": "fi",
    "France": "fr",
    "Germany": "de",
    "Guatemala": "gt",
    "Honduras": "hn",
    "Ireland": "ie",
    "Italy": "it",
    "Japan": "jp",
    "Latvia": "lv",
    "Lithuania": "lt",
    "Mexico": "mx",
    "Mongolia": "mn",
    "Netherlands": "nl",
    "New Zealand": "nz",
    "Norway": "no",
    "Portugal": "pt",
    "Puerto Rico": "pr",
    "Russia": "ru",
    "South Africa": "za",
    "South Korea": "kr",
    "Spain": "es",
    "Sweden": "se",
    "Switzerland": "ch",
    "Uganda": "ug",
    "Ukraine": "ua",
    "Uruguay": "uy",
    "Venezuela": "ve"
  };

  return countryMap[country] || null;
}

function getSortedCandidateRaces(races) {
  const now = new Date();
  const completed = races.filter((race) => new Date(race.race_date) <= now);
  const pool = completed.length > 0 ? completed : races;

  return [...pool].sort((a, b) => {
    const dateDiff = new Date(b.race_date) - new Date(a.race_date);

    if (dateDiff !== 0) {
      return dateDiff;
    }

    return (b.round ?? 0) - (a.round ?? 0);
  });
}

function ResultList({ rows, sport }) {
  return (
    <div className="landing-results-list">
      {rows.map((row) => (
        <Link
          key={`${row.riderid}-${row.result}`}
          to={`/rider/${row.riderid}`}
          className="landing-result-row"
        >
          <span className="landing-result-pos">#{row.result}</span>
          <span className="landing-result-rider">
            <img
              src={row.imageurl || "/smxmuselogo.png"}
              alt={row.fullname}
              className="landing-result-avatar"
            />
            <span className="landing-result-name">{row.fullname}</span>
          </span>
          <span className="landing-result-meta">
            {sport === "sx"
              ? `${row.brand}${row.lapsled ? ` / ${row.lapsled} led` : ""}`
              : `${row.brand}${row.moto1 ? ` / ${row.moto1}-${row.moto2}` : ""}`}
          </span>
        </Link>
      ))}
    </div>
  );
}

function FeaturedPathsGrid() {
  return (
    <section className="landing-features landing-features-five">
      {FEATURED_PATHS.map((feature) => (
        <Link key={feature.title} to={feature.to} className="landing-feature-card">
          <span className="landing-feature-eyebrow">{feature.eyebrow}</span>
          <h2>{feature.title}</h2>
          <p>{feature.description}</p>
          <span className="landing-feature-link">Open section</span>
        </Link>
      ))}
    </section>
  );
}

function GridsCallout() {
  return (
    <aside className="landing-feature-callout">
      <p className="landing-callout-label">Featured</p>
      <h2>SMXmuse Grids</h2>
      <p>
        A daily 3x3 grid trivia game powered by my database to test your knowledge about Supercross and Motocross.
        Chase perfect scores or be daring and try some deep cuts!
      </p>
      <div className="landing-grid-preview" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, index) => (
          <span key={index} className="landing-grid-preview-cell" />
        ))}
      </div>
      <a
        href="https://smxmuse.com"
        target="_blank"
        rel="noreferrer"
        className="landing-button landing-button-primary"
      >
        Play on smxmuse.com
      </a>
    </aside>
  );
}

function RiderOfTheDayPanel({ riderOfTheDay }) {
  return (
    <aside className="landing-spotlight-panel">
      <p className="landing-panel-label">Rider of the day</p>
      {riderOfTheDay ? (
        <>
          <Link
            to={`/rider/${riderOfTheDay.RiderID}`}
            className="landing-spotlight-link"
          >
            <img
              src={riderOfTheDay.ImageURL}
              alt={riderOfTheDay.FullName}
              className="landing-spotlight-image"
            />
          </Link>
          <div className="landing-spotlight-name-row">
            <h3>{riderOfTheDay.FullName}</h3>
            {getCountryCode(riderOfTheDay.Country) && (
              <img
                src={`https://flagcdn.com/w40/${getCountryCode(riderOfTheDay.Country)}.png`}
                alt={riderOfTheDay.Country}
                className="landing-spotlight-flag"
              />
            )}
          </div>
          <p className="landing-spotlight-summary">A daily random pull from the SMXmuse rider archive.</p>
          <p className="landing-spotlight-context">
            This rider stays featured for the full day, then rotates to a new random archive pick.
          </p>
          <div className="landing-spotlight-actions">
            <Link
              to={`/rider/${riderOfTheDay.RiderID}`}
              className="landing-button landing-button-primary"
            >
              Open rider profile
            </Link>
          </div>
        </>
      ) : (
        <p className="landing-spotlight-context">
          Loading today&apos;s random rider...
        </p>
      )}
    </aside>
  );
}

function LatestResultsPanel({ loadingLatest, latestRace, latestResults }) {
  return (
    <div className="landing-results-panel">
      <div className="landing-panel-header">
        <div>
          <p className="landing-panel-label">Most recent race</p>
          <h3>
            {loadingLatest
              ? "Loading latest race..."
              : latestRace
              ? `${latestRace.track_name} ${latestRace.sportLabel}`
              : "Latest race unavailable"}
          </h3>
        </div>

        {latestRace && (
          <Link to={`/race/${latestRace.race_id}`} className="landing-inline-link">
            View full race page
          </Link>
        )}
      </div>

      {latestRace && (
        <p className="landing-race-meta">
          Round {latestRace.round} /{" "}
          {new Date(latestRace.race_date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          })}
        </p>
      )}

      <div className="landing-results-grid">
        {latestResults.map((group) => (
          <div key={group.classId} className="landing-result-card">
            <div className="landing-result-card-header">
              <h4>Top 5 in {CLASS_LABELS[group.classId] ?? group.classId}</h4>
              <span>{latestRace?.sport === "sx" ? "Main Event" : "Overall"}</span>
            </div>
            <ResultList rows={group.rows} sport={latestRace?.sport} />
          </div>
        ))}

        {!loadingLatest && latestResults.length === 0 && (
          <div className="landing-empty-state">
            Latest race results are not available right now.
          </div>
        )}
      </div>
    </div>
  );
}

function ArchiveIntro() {
  return (
    <div className="landing-hero-copy">
      <p className="landing-kicker">Supercross and Motocross Archive</p>
      <h1 className="landing-title">
        Everything in one place, from the latest gate drop to all-time history.
      </h1>
      <p className="landing-intro">
        SMXmuse is built for digging deeper: race results, rider profiles, season dashboards,
        comparison tools, and all-time leaderboards designed for fans who want to bench race with more knowledge than ever before.
      </p>

      <div className="landing-hero-actions">
        <Link to="/results" className="landing-button landing-button-primary">
          Explore results
        </Link>
        <Link to="/compare" className="landing-button landing-button-secondary">
          Compare riders
        </Link>
        <Link to="/season" className="landing-button landing-button-secondary">
          Open current season
        </Link>
      </div>

      <div className="landing-stat-strip">
        <div className="landing-stat-pill">
          <span className="landing-stat-label">Best for</span>
          <strong>Race-by-race deep dives</strong>
        </div>
        <div className="landing-stat-pill">
          <span className="landing-stat-label">Quick jump</span>
          <strong>Head-to-head rider comparison</strong>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [latestRace, setLatestRace] = useState(null);
  const [latestResults, setLatestResults] = useState([]);
  const [riderOfTheDay, setRiderOfTheDay] = useState(null);
  const [loadingLatest, setLoadingLatest] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLatestRace() {
      try {
        const [currentRes, riderOfTheDayRes] = await Promise.all([
          fetch(apiUrl("/season/current")),
          fetch(apiUrl("/api/riders/rider-of-the-day"))
        ]);
        const currentSeason = await currentRes.json();
        const riderOfTheDayData = await riderOfTheDayRes.json();
        const meta = SPORT_META[currentSeason.sport] ?? SPORT_META.sx;

        const racesRes = await fetch(
          apiUrl(`/api/races?sport_id=${meta.sportId}&year=${currentSeason.year}`)
        );
        const races = await racesRes.json();
        const raceCandidates = getSortedCandidateRaces(races);

        if (raceCandidates.length === 0) {
          throw new Error("No races found for current season");
        }

        let selectedRace = null;
        let groupedResults = [];

        for (const race of raceCandidates) {
          let raceResults = [];

          if (meta.sportId === 1) {
            const mainRes = await fetch(
              apiUrl(`/api/race/main-event?raceid=${race.race_id}`)
            );
            const mainData = await mainRes.json();

            raceResults = [
              { classId: 1, rows: (mainData.class450 ?? []).slice(0, 5) },
              { classId: 2, rows: (mainData.class250 ?? []).slice(0, 5) }
            ].filter((group) => group.rows.length > 0);
          } else {
            const classesRes = await fetch(
              apiUrl(`/api/race/mx-classes?raceid=${race.race_id}`)
            );
            const classesData = await classesRes.json();
            const orderedClasses = classesData
              .map((item) => item.ClassID)
              .sort((a, b) => a - b);

            const resultsByClass = await Promise.all(
              orderedClasses.map(async (classId) => {
                const overallRes = await fetch(
                  apiUrl(`/api/race/overalls?raceid=${race.race_id}&classid=${classId}`)
                );
                const overallData = await overallRes.json();

                return { classId, rows: overallData.slice(0, 5) };
              })
            );

            raceResults = resultsByClass.filter((group) => group.rows.length > 0);
          }

          if (raceResults.length > 0) {
            selectedRace = race;
            groupedResults = raceResults;
            break;
          }
        }

        if (!selectedRace) {
          selectedRace = raceCandidates[0];
        }

        if (!isMounted) {
          return;
        }

        setLatestRace({ ...selectedRace, sport: currentSeason.sport, sportLabel: meta.label });
        setLatestResults(groupedResults);
        setRiderOfTheDay(riderOfTheDayData);
      } catch (error) {
        console.error("Failed to load landing page race data", error);
      } finally {
        if (isMounted) {
          setLoadingLatest(false);
        }
      }
    }

    loadLatestRace();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="landing-page">
      <section className="landing-desktop-layout landing-layout-narrow-top">
        <div className="landing-hero-copy landing-hero-copy-narrow">
          <p className="landing-kicker">Supercross and Motocross Archive</p>
          <h1 className="landing-title landing-title-narrow">
            Everything in one place, from the latest gate drop to all-time history.
          </h1>
          <p className="landing-intro landing-intro-narrow">
            SMXmuse is built for race results, rider profiles, season dashboards, comparison tools,
            and all-time leaderboards without making you dig to find the newest story first.
          </p>
          <div className="landing-hero-actions landing-hero-actions-narrow">
            <Link to="/results" className="landing-button landing-button-primary">
              Explore results
            </Link>
            <Link to="/compare" className="landing-button landing-button-secondary">
              Compare riders
            </Link>
            <Link to="/season" className="landing-button landing-button-secondary">
              Open current season
            </Link>
          </div>
        </div>

        <div className="landing-hero-grid-slot">
          <RiderOfTheDayPanel riderOfTheDay={riderOfTheDay} />
        </div>
      </section>

      <section className="landing-desktop-layout landing-layout-narrow-live">
        <div className="landing-narrow-results">
          <LatestResultsPanel
            loadingLatest={loadingLatest}
            latestRace={latestRace}
            latestResults={latestResults}
          />
        </div>
        <div className="landing-narrow-side">
          <GridsCallout />
        </div>
      </section>

      <FeaturedPathsGrid />

      <section className="landing-bottom-grid">
        <div className="landing-path-card">
          <p className="landing-panel-label">Start here</p>
          <h3>Use the archive like a fan, a stat nerd, or both.</h3>
          <p>
            Follow a season week to week, jump into one rider&apos;s career, or zoom all the way out
            to see who owns the record books.
          </p>
        </div>

        <div className="landing-path-card">
          <p className="landing-panel-label">Archive flow</p>
          <h3>Three easy ways to use the site.</h3>
          <p>
            Start with a rider, a season, or a single race. Each path gives you a different way
            to move through the archive without feeling lost.
          </p>
          <div className="landing-quick-links">
            <Link to="/riders" className="landing-inline-link">Browse every rider</Link>
            <Link to="/season" className="landing-inline-link">Open current dashboards</Link>
            <Link to="/results" className="landing-inline-link">Jump into race results</Link>
          </div>
        </div>

        <div className="landing-path-card">
          <p className="landing-panel-label">SMXmuse on social</p>
          <h3>Follow SMXmuse outside the site.</h3>
          <p>
            Catch the latest SMXmuse updates, including pre-race notes, race recaps,
            and unique stat pulls posted across Instagram and X.
          </p>
          <div className="landing-social-links">
            <a
              href="https://www.instagram.com/smxmuse/"
              target="_blank"
              rel="noreferrer"
              className="landing-social-link"
            >
              <span className="landing-social-brand">
                <span className="landing-social-logo landing-social-logo-instagram" aria-hidden="true">
                  <span className="landing-social-logo-instagram-dot" />
                </span>
                Instagram
              </span>
              <span>@smxmuse</span>
            </a>
            <a
              href="https://x.com/smxmuse"
              target="_blank"
              rel="noreferrer"
              className="landing-social-link"
            >
              <span className="landing-social-brand">
                <span className="landing-social-logo landing-social-logo-x" aria-hidden="true">
                  X
                </span>
                X
              </span>
              <span>@smxmuse</span>
            </a>
          </div>
          <p className="landing-callout-footnote">
            Opens the latest SMXmuse social feed in a new tab.
          </p>
        </div>
      </section>
    </div>
  );
}
