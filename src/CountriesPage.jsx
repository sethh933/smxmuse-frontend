import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "./api";
import Seo from "./SiteSeo";
import { buildRiderPath } from "./seo";

const getCountryCode = (country) => {
  const map = {
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

  return map[country] || null;
};

function FeaturedRiders({ riders, navigate }) {
  const [isMobileFeaturedLayout, setIsMobileFeaturedLayout] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 640 : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const handleChange = (event) => setIsMobileFeaturedLayout(event.matches);

    setIsMobileFeaturedLayout(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  if (!riders.length) return null;

  return (
    <section className="featured-riders-section">
      <div className="featured-riders-header">
        <h2>Featured Riders</h2>
        <p>Quick access to a few of the riders who have been guessed the most in smxmuse grids during the past week.</p>
      </div>

      <div
        className="featured-riders-grid"
        style={
          isMobileFeaturedLayout
            ? undefined
            : { gridTemplateColumns: `repeat(${riders.length}, minmax(0, 1fr))` }
        }
      >
        {riders.map((rider) => (
          <button
            key={rider.RiderID}
            type="button"
            className="featured-rider-card"
            onClick={() => navigate(buildRiderPath(rider.RiderID, rider.FullName))}
          >
            <img
              src={rider.ImageURL}
              alt={rider.FullName}
              className="featured-rider-image"
            />
            <span className="featured-rider-name">{rider.FullName}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CountriesPage() {
  const [view, setView] = useState("lastname");
  const [countries, setCountries] = useState([]);
  const [allRiders, setAllRiders] = useState([]);
  const [featuredRiders, setFeaturedRiders] = useState([]);
  const [riderCount, setRiderCount] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [countriesRes, ridersRes, featuredRes] = await Promise.all([
          fetch(apiUrl("/countries")),
          fetch(apiUrl("/api/riders/index")),
          fetch(apiUrl("/api/riders/featured"))
        ]);

        const countriesData = await countriesRes.json();
        const ridersData = await ridersRes.json();
        const featuredData = await featuredRes.json();

        setCountries(countriesData);
        setAllRiders(ridersData.riders || []);
        setRiderCount(ridersData.riderCount || 0);
        setFeaturedRiders(featuredData || []);
      } catch (error) {
        console.error("Failed to load riders hub:", error);
      }
    }

    loadData();
  }, []);

  const groupedRiders = useMemo(() => {
    return allRiders.reduce((acc, rider) => {
      const letter = rider.Last?.[0]?.toUpperCase() || "#";

      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(rider);

      return acc;
    }, {});
  }, [allRiders]);

  const letters = useMemo(() => Object.keys(groupedRiders).sort(), [groupedRiders]);

  useEffect(() => {
    if (!letters.length) return;

    if (!selectedLetter || !letters.includes(selectedLetter)) {
      setSelectedLetter(letters[0]);
    }
  }, [letters, selectedLetter]);

  return (
    <div className="page-container riders-hub">
      <Seo
        title="Browse Riders"
        description="Browse the full SMXmuse rider archive by last name or country, including featured riders and country pages."
        path="/riders"
      />
      <div className="riders-hub-header">
        <h1>Riders</h1>
        <div className="rider-count">{riderCount.toLocaleString()} Riders</div>
      </div>

      <div className="rider-nav riders-hub-nav">
        <button
          type="button"
          className={`rider-nav-button ${view === "lastname" ? "active" : ""}`}
          onClick={() => setView("lastname")}
        >
          Last Name
        </button>

        <button
          type="button"
          className={`rider-nav-button ${view === "countries" ? "active" : ""}`}
          onClick={() => setView("countries")}
        >
          Countries
        </button>
      </div>

      <FeaturedRiders riders={featuredRiders} navigate={navigate} />

      {view === "lastname" ? (
        <section className="riders-panel">
          <div className="riders-panel-header">
            <h2>Browse by last name</h2>
            <p>Jump into the archive alphabetically across every rider in the database.</p>
          </div>

          <div className="alphabet-nav">
            {letters.map((letter) => (
              <span
                key={letter}
                className={`alphabet-letter ${selectedLetter === letter ? "active" : ""}`}
                onClick={() => setSelectedLetter(letter)}
              >
                {letter}
              </span>
            ))}
          </div>

          {selectedLetter ? (
            <>
              <div className="letter-header">{selectedLetter}</div>

              <div className="name-grid">
                {groupedRiders[selectedLetter]?.map((rider) => (
                  <div
                    key={rider.RiderID}
                    className="rider-row rider-row-clickable"
                    onClick={() => navigate(buildRiderPath(rider.RiderID, rider.FullName))}
                  >
                    <img
                      src={rider.ImageURL}
                      alt={rider.FullName}
                      className="rider-avatar"
                    />
                    <span className="country-rider-text">
                      {rider.FullName}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="letter-placeholder">Select a letter to view riders.</div>
          )}
        </section>
      ) : (
        <section className="riders-panel">
          <div className="riders-panel-header">
            <h2>Browse by country</h2>
            <p>Open a country page to get the same rider layout you already use on each nation page.</p>
          </div>

          <div className="countries-grid">
            {countries.map((country) => {
              const code = getCountryCode(country);

              return (
                <div
                  key={country}
                  className="country-item"
                      onClick={() => navigate(`/riders/${country}`)}
                >
                  {code && (
                    <img
                      src={`https://flagcdn.com/w40/${code}.png`}
                      alt={country}
                      className="country-flag"
                    />
                  )}
                  <span>{country}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default CountriesPage;
