import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { apiUrl } from "./api";
import Seo from "./SiteSeo";
import { buildRiderPath, slugify } from "./seo";

const getCountryCode = (country) => {
  const map = {
    "United States": "us",
    "United Kingdom": "gb",
    "England": "gb",
    "Wales": "gb",
    "Scotland": "gb",
    "Austria" : "at",
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

function CountryPage() {
  const { country } = useParams();
  const [data, setData] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedLetter = searchParams.get("letter")?.toUpperCase() || null;
  const navigate = useNavigate();
  
  useEffect(() => {
    fetch(apiUrl(`/countries/${country}`))
      .then(res => res.json())
      .then(data => setData(data));
  }, [country]);

  useEffect(() => {
    if (!data || data.country !== "United States" || !requestedLetter) return;

    const scrollKey = `country-riders-scroll:${data.country}:${requestedLetter}`;
    const savedScroll = sessionStorage.getItem(scrollKey);
    if (savedScroll === null) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, Number(savedScroll));
        sessionStorage.removeItem(scrollKey);
      });
    });
  }, [data, requestedLetter]);

  if (!data) return <div>Loading...</div>;

  const isUSA = data.country === "United States";

  const groupedRiders = data.riders.reduce((acc, rider) => {
  const letter = rider.Last?.[0]?.toUpperCase() || "#";

  if (!acc[letter]) acc[letter] = [];
  acc[letter].push(rider);

  return acc;
}, {});

const letters = Object.keys(groupedRiders).sort();
const selectedLetter = isUSA && letters.includes(requestedLetter) ? requestedLetter : null;

  function openRider(rider) {
    if (isUSA && selectedLetter) {
      sessionStorage.setItem(
        `country-riders-scroll:${data.country}:${selectedLetter}`,
        String(window.scrollY)
      );
    }
    navigate(buildRiderPath(rider.RiderID, rider.FullName));
  }

  const code = getCountryCode(data.country);

  return (
    <div className="page-container">
      <Seo
        title={`${data.country} Riders`}
        description={`Browse rider profiles from ${data.country} in the SMXmuse Supercross and Motocross archive.`}
        path={`/riders/${slugify(data.country)}`}
        canonical={`/riders/${country}`}
      />

      {/* HEADER */}
      <div className="country-header">
  {code && (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={data.country}
      className="country-header-flag"
    />
  )}

  <div className="country-header-text">
    <h1>{data.country}</h1>
    <div className="rider-count">
      {data.riderCount} Riders
    </div>
  </div>
</div>

{isUSA && (
  <div className="alphabet-nav">
    {letters.map(letter => (
      <span
        key={letter}
        className={`alphabet-letter ${selectedLetter === letter ? "active" : ""}`}
        onClick={() => setSearchParams({ letter })}
      >
        {letter}
      </span>
    ))}
  </div>
)}

      {/* RIDER LIST */}
<div className="country-rider-list">

  {/* 🇺🇸 USA → A-Z behavior */}
  {isUSA && !selectedLetter && (
    <div className="letter-placeholder">
      Select a letter to view riders
    </div>
  )}

  {isUSA && selectedLetter && (
    <>
      <div className="letter-header">{selectedLetter}</div>

      <div className="name-grid">
        {groupedRiders[selectedLetter]?.map(rider => (
          <div
            key={rider.RiderID}
            className="rider-row rider-row-clickable"
            onClick={() => openRider(rider)}
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
  )}

  {/* 🌍 ALL OTHER COUNTRIES → normal list */}
  {!isUSA && (
    <div className="name-grid">
      {data.riders.map(rider => (
        <div
          key={rider.RiderID}
          className="rider-row rider-row-clickable"
          onClick={() => openRider(rider)}
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
  )}

</div>

    </div>
  );
}

export default CountryPage;
