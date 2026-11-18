import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "./api";
import Seo from "./SiteSeo";
import { buildRacePath, buildRiderPath } from "./seo";
import { BrandMark, CountryFlag } from "./ResultIdentity";
import { formatCalendarDate, getCalendarYear, parseCalendarDate } from "./dateUtils";
import { getPublishedPosts, getPostTypeLabel } from "./contentPosts";
import { articlePlainText } from "./articlePlainText";
import {
  FINAL_OPENER_YEAR,
  NEXT_OPENER_DATE,
  getOpenerResults,
  getSeasonOpener,
  getSupercrossOpenerYear
} from "./supercrossOpeners";
import "./styles/landingNews.css";

function HomepageNews() {
  const [posts, setPosts] = useState(getPublishedPosts);
  useEffect(() => {
    const controller = new AbortController();
    fetch(apiUrl("/api/notes"), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("News unavailable");
        return response.json();
      })
      .then((data) => { if (Array.isArray(data)) setPosts(data); })
      .catch(() => { /* Keep the published local fallback available. */ });
    return () => controller.abort();
  }, []);
  const recent = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  return (
    <section className="landing-news-panel" aria-labelledby="home-news-title">
      <div className="landing-news-heading">
        <h2 id="home-news-title" className="landing-panel-label">Latest from News</h2>
        <Link to="/news" className="landing-inline-link">All news ↗</Link>
      </div>
      {recent.map((post, index) => (
        <article key={post.slug} className={index === 0 ? "landing-news-lead" : "landing-news-item"}>
          <p className="landing-panel-label">{getPostTypeLabel(post.type)}</p>
          <h3><Link to={`/news/${post.slug}`}>{post.title}</Link></h3>
          <p className="landing-news-date">{formatCalendarDate(post.date, { month: "short", day: "numeric", year: "numeric" })}</p>
          {index === 0 && <>
            <p className="landing-news-summary">{articlePlainText(post.summary || "Read the latest story from smxmuse.")}</p>
            <Link className="landing-inline-link" to={`/news/${post.slug}`}>Read the story ↗</Link>
          </>}
        </article>
      ))}
      {recent.length === 0 && <p>New stories are on the way. <Link to="/news">Browse news</Link></p>}
    </section>
  );
}

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
  mx: { sportId: 2, label: "Motocross" },
  smx: { sportId: 3, label: "SuperMotocross" }
};

const CLASS_LABELS = {
  1: "450",
  2: "250",
  3: "500"
};

const LANDING_CACHE_KEYS = {
  latestRace: "smxmuse:landing:latest-race:v2",
  riderOfTheDay: "smxmuse:landing:rider-of-the-day:v1"
};

const IS_HOMEPAGE_DOCUMENT_RELOAD =
  typeof window !== "undefined" &&
  window.location.pathname === "/" &&
  window.performance
    ?.getEntriesByType("navigation")
    ?.[0]?.type === "reload";

let hasMountedLandingPage = false;

function readSessionCache(key) {
  try {
    const value = window.sessionStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeSessionCache(key, value) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The page should still work when browser storage is unavailable.
  }
}

async function fetchJson(path, signal, cache) {
  const response = await fetch(apiUrl(path), { signal, cache });
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response.json();
}

const OPENER_PUBLISHED_KEY = `smxmuse:sx-results-published:${NEXT_OPENER_DATE}`;

function readOpenerPublication() {
  try {
    return window.localStorage.getItem(OPENER_PUBLISHED_KEY) === "true";
  } catch {
    return false;
  }
}

function useOpenerPublication(enabled) {
  const [published, setPublished] = useState(readOpenerPublication);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!enabled || published) return;

    const controller = new AbortController();
    let timer;

    async function checkResults() {
      try {
        const races = await fetchJson(
          `/api/races?sport_id=1&year=${FINAL_OPENER_YEAR + 1}`, controller.signal, "no-store"
        );
        const race = races.find((entry) => entry.round === 1 && entry.race_date === NEXT_OPENER_DATE);
        if (race) {
          const results = await fetchJson(
            `/api/race/main-event?raceid=${race.race_id}`, controller.signal, "no-store"
          );
          if ([...(results.class450 ?? []), ...(results.class250 ?? [])].some((row) => row.result > 0)) {
            if (controller.signal.aborted) return;
            writeSessionCache(LANDING_CACHE_KEYS.latestRace, null);
            setPublished(true);
            try {
              window.localStorage.setItem(OPENER_PUBLISHED_KEY, "true");
            } catch {
              // Publication still takes effect when browser storage is unavailable.
            }
            return;
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) console.error("Failed to check the new Supercross opener", error);
      }

      if (!controller.signal.aborted) {
        setChecked(true);
        timer = window.setTimeout(checkResults, 15_000);
      }
    }

    checkResults();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [enabled, published]);

  return { checked, published };
}

function getCountryCode(country) {
  const countryMap = {
    "United States": "us",
    "United Kingdom": "gb",
    "England": "gb-eng",
    "Wales": "gb-wls",
    "Scotland": "gb-sct",
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
    "Iran": "ir",
    "Isle of Man": "im",
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
  const completed = races.filter((race) => parseCalendarDate(race.race_date) <= now);
  const pool = completed.length > 0 ? completed : races;

  return [...pool].sort((a, b) => {
    const dateDiff = parseCalendarDate(b.race_date) - parseCalendarDate(a.race_date);

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
          to={buildRiderPath(row.riderid, row.fullname)}
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
            <CountryFlag country={row.country} />
            <span className="landing-result-brand"><BrandMark brand={row.brand} /></span>
            <span>
              {sport === "sx"
                ? (row.lapsled ? `${row.lapsled} led` : "")
                : (row.moto1 ? `${row.moto1}-${row.moto2}` : "")}
            </span>
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
      <h2>Smxmuse Grids</h2>
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
        href="https://grids.smxmuse.com"
        target="_blank"
        rel="noreferrer"
        className="landing-button landing-button-primary"
      >
        Play on grids.smxmuse.com
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
            to={buildRiderPath(riderOfTheDay.RiderID, riderOfTheDay.FullName)}
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
          <p className="landing-spotlight-summary">A daily random pull from the smxmuse rider archive.</p>
          <p className="landing-spotlight-context">
            This rider stays featured for the full day, then rotates to a new random archive pick.
          </p>
          <div className="landing-spotlight-actions">
            <Link
              to={buildRiderPath(riderOfTheDay.RiderID, riderOfTheDay.FullName)}
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

function LatestResultsPanel({ loadingLatest, latestRace, latestResults, openerYear }) {
  const latestRaceDisplayName = latestRace
    ? latestRace.sport === "sx" && latestRace.city
      ? latestRace.city
      : latestRace.track_name
    : null;

  return (
    <div className="landing-results-panel">
      <div className="landing-panel-header">
        <div>
          <p className="landing-panel-label">
            {openerYear ? "52 Days of Supercross Openers" : "Most recent race"}
          </p>
          <h3>
            {loadingLatest
              ? openerYear ? `Loading the ${openerYear} opener…` : "Loading latest race..."
              : latestRace
              ? `${openerYear ? `${openerYear} ` : ""}${latestRaceDisplayName} ${latestRace.sportLabel}`
              : openerYear ? `${openerYear} opener unavailable` : "Latest race unavailable"}
          </h3>
        </div>

        {latestRace && (
          <Link
            to={buildRacePath(latestRace.race_id, latestRace.track_name, getCalendarYear(latestRace.race_date), {
              sportId: SPORT_META[latestRace.sport]?.sportId,
              city: latestRace.city
            })}
            className="landing-inline-link"
          >
            View full race page ↗
          </Link>
        )}
      </div>

      {latestRace && (
        <p className="landing-race-meta">
          Round {latestRace.round} /{" "}
          {formatCalendarDate(latestRace.race_date, {
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
              <h4>Top {group.limit ?? 5} in {CLASS_LABELS[group.classId] ?? group.classId}</h4>
              <span>{latestRace?.sport === "sx" ? "Main Event" : "Overall"}</span>
            </div>
            <ResultList rows={group.rows} sport={latestRace?.sport} />
          </div>
        ))}

        {!loadingLatest && latestResults.length === 0 && (
          <div className="landing-empty-state">
            {openerYear
              ? "Season opener results are unavailable right now."
              : "Latest race results are not available right now."}
          </div>
        )}
      </div>
    </div>
  );
}

function SupercrossOpenerResults({ year }) {
  const [opener, setOpener] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOpener() {
      try {
        const races = await fetchJson(`/api/races?sport_id=1&year=${year}`, controller.signal);
        const race = getSeasonOpener(races);
        if (!race) throw new Error(`No Supercross opener found for ${year}`);

        const mainData = await fetchJson(`/api/race/main-event?raceid=${race.race_id}`, controller.signal);
        setOpener({
          race: { ...race, sport: "sx", sportLabel: SPORT_META.sx.label },
          results: getOpenerResults(mainData)
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load Supercross opener", error);
          setOpener({ race: null, results: [] });
        }
      }
    }

    loadOpener();
    return () => controller.abort();
  }, [year]);

  return (
    <LatestResultsPanel
      loadingLatest={!opener}
      latestRace={opener?.race}
      latestResults={opener?.results ?? []}
      openerYear={year}
    />
  );
}

function ArchiveIntro({ className = "" }) {
  return (
    <div className={`landing-hero-copy landing-hero-copy-narrow ${className}`.trim()}>
      <p className="landing-kicker">Supercross and Motocross Archive</p>
      <h2 className="landing-title landing-title-narrow">
        Everything in one place, from the latest gate drop to all-time history.
      </h2>
      <p className="landing-intro landing-intro-narrow">
        Smxmuse is built for race results, rider profiles, season dashboards, comparison tools,
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
  );
}

function RecentRaceResults() {
  const [cachedLatest] = useState(() => readSessionCache(LANDING_CACHE_KEYS.latestRace));
  const [preferFreshLatest] = useState(
    () => IS_HOMEPAGE_DOCUMENT_RELOAD && !hasMountedLandingPage
  );
  const [latestRace, setLatestRace] = useState(
    preferFreshLatest ? null : cachedLatest?.race ?? null
  );
  const [latestResults, setLatestResults] = useState(
    preferFreshLatest ? [] : cachedLatest?.results ?? []
  );
  const [loadingLatest, setLoadingLatest] = useState(preferFreshLatest || !cachedLatest);

  useEffect(() => {
    let isMounted = true;
    let latestCacheFallbackTimer = null;
    hasMountedLandingPage = true;

    async function loadLatestRace() {
      if (preferFreshLatest && cachedLatest) {
        latestCacheFallbackTimer = window.setTimeout(() => {
          if (isMounted) {
            setLatestRace(cachedLatest.race ?? null);
            setLatestResults(cachedLatest.results ?? []);
            setLoadingLatest(false);
          }
          latestCacheFallbackTimer = null;
        }, 1200);
      }

      try {
        const currentSeason = await fetchJson("/season/current");
        const meta = SPORT_META[currentSeason.sport];
        if (!meta) {
          throw new Error(`Unsupported current season sport: ${currentSeason.sport}`);
        }

        const races = await fetchJson(
          `/api/races?sport_id=${meta.sportId}&year=${currentSeason.year}`
        );
        const raceCandidates = getSortedCandidateRaces(races);

        if (raceCandidates.length === 0) {
          throw new Error("No races found for current season");
        }

        let selectedRace = null;
        let groupedResults = [];

        for (const race of raceCandidates) {
          let raceResults = [];

          if (meta.sportId === 1) {
            const mainData = await fetchJson(
              `/api/race/main-event?raceid=${race.race_id}`
            );

            raceResults = [
              { classId: 1, rows: (mainData.class450 ?? []).slice(0, 5) },
              { classId: 2, rows: (mainData.class250 ?? []).slice(0, 5) }
            ].filter((group) => group.rows.length > 0);
          } else {
            const classesData = await fetchJson(
              `/api/race/mx-classes?raceid=${race.race_id}&sport_id=${meta.sportId}`
            );
            const orderedClasses = classesData
              .map((item) => item.ClassID)
              .sort((a, b) => a - b);

            const resultsByClass = await Promise.all(
              orderedClasses.map(async (classId) => {
                const overallData = await fetchJson(
                  `/api/race/overalls?raceid=${race.race_id}&classid=${classId}&sport_id=${meta.sportId}`
                );

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

        if (latestCacheFallbackTimer !== null) {
          window.clearTimeout(latestCacheFallbackTimer);
          latestCacheFallbackTimer = null;
        }

        const race = { ...selectedRace, sport: currentSeason.sport, sportLabel: meta.label };
        setLatestRace(race);
        setLatestResults(groupedResults);
        writeSessionCache(LANDING_CACHE_KEYS.latestRace, {
          race,
          results: groupedResults
        });
      } catch (error) {
        console.error("Failed to load landing page race data", error);

        if (latestCacheFallbackTimer !== null) {
          window.clearTimeout(latestCacheFallbackTimer);
          latestCacheFallbackTimer = null;
        }

        if (isMounted && preferFreshLatest && cachedLatest) {
          setLatestRace(cachedLatest.race ?? null);
          setLatestResults(cachedLatest.results ?? []);
        }
      } finally {
        if (isMounted) {
          setLoadingLatest(false);
        }
      }
    }

    loadLatestRace();

    return () => {
      isMounted = false;
      if (latestCacheFallbackTimer !== null) {
        window.clearTimeout(latestCacheFallbackTimer);
      }
    };
  }, [cachedLatest, preferFreshLatest]);

  return (
    <LatestResultsPanel
      loadingLatest={loadingLatest}
      latestRace={latestRace}
      latestResults={latestResults}
    />
  );
}

function getOpenerPreviewYear() {
  if (!import.meta.env.DEV || typeof window === "undefined") return null;

  const year = Number(new URLSearchParams(window.location.search).get("previewOpener"));
  return Number.isInteger(year) && year >= 1974 && year <= FINAL_OPENER_YEAR ? year : null;
}

export default function LandingPage() {
  const [openerYear, setOpenerYear] = useState(getSupercrossOpenerYear);
  const previewYear = getOpenerPreviewYear();
  const displayedOpenerYear = previewYear ?? openerYear;
  const isFinalOpener = !previewYear && openerYear === FINAL_OPENER_YEAR;
  const { checked, published } = useOpenerPublication(isFinalOpener);
  const [riderOfTheDay, setRiderOfTheDay] = useState(
    () => readSessionCache(LANDING_CACHE_KEYS.riderOfTheDay)
  );

  useEffect(() => {
    const updateOpenerYear = () => setOpenerYear(getSupercrossOpenerYear());
    updateOpenerYear();
    const timer = window.setInterval(updateOpenerYear, 15_000);
    document.addEventListener("visibilitychange", updateOpenerYear);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", updateOpenerYear);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchJson("/api/riders/rider-of-the-day", controller.signal)
      .then((data) => {
        setRiderOfTheDay(data);
        writeSessionCache(LANDING_CACHE_KEYS.riderOfTheDay, data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) console.error("Failed to load rider of the day", error);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="landing-page">
      <Seo
        title="Supercross and Motocross Stats, Results, and Rider Profiles"
        description="Smxmuse is a Supercross and Motocross stats archive with rider profiles, race results, season dashboards, comparisons, and all-time leaderboards."
        path="/"
      />
      <section className="landing-desktop-layout landing-news-layout">
        <HomepageNews />
        <div className="landing-narrow-results">
          {!displayedOpenerYear || (isFinalOpener && published)
            ? <RecentRaceResults />
            : isFinalOpener && !checked
              ? <LatestResultsPanel loadingLatest latestResults={[]} />
              : <SupercrossOpenerResults key={displayedOpenerYear} year={displayedOpenerYear} />}
        </div>

        <div className="landing-hero-grid-slot">
          <RiderOfTheDayPanel riderOfTheDay={riderOfTheDay} />
          <GridsCallout />
        </div>
      </section>

      <section className="landing-news-secondary">
        <ArchiveIntro />
      </section>

      <FeaturedPathsGrid />

      <section className="landing-bottom-grid">
        <div className="landing-path-card">
          <p className="landing-panel-label">Contact</p>
          <h3>Want to share feedback or get in touch?</h3>
          <p>
            I&apos;m always happy to hear feedback, answer questions, or fix anything that looks off.
            If you want to talk partnerships or business, reach out below too.
          </p>
          <div className="landing-quick-links">
            <a href="mailto:feedback@smxmuse.com" className="landing-inline-link">
              feedback@smxmuse.com
            </a>
            <a href="mailto:seth@smxmuse.com" className="landing-inline-link">
              seth@smxmuse.com
            </a>
          </div>
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
          <p className="landing-panel-label">Smxmuse on social</p>
          <h3>Follow smxmuse outside the site.</h3>
          <p>
            Catch the latest smxmuse updates, including pre-race notes, race recaps,
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
            Opens the latest smxmuse social feed in a new tab.
          </p>
        </div>
      </section>
    </div>
  );
}
