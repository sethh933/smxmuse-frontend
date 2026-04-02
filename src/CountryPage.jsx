import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const getCountryCode = (country) => {
  const map = {
    "United States": "us",
    "United Kingdom": "gb",
    "England": "gb",
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

function CountryPage() {
  const { country } = useParams();
  const [data, setData] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetch(`http://localhost:8000/countries/${country}`)
      .then(res => res.json())
      .then(data => setData(data));
  }, [country]);

  if (!data) return <div>Loading...</div>;

  const isUSA = data.country === "United States";

  const groupedRiders = data.riders.reduce((acc, rider) => {
  const letter = rider.Last?.[0]?.toUpperCase() || "#";

  if (!acc[letter]) acc[letter] = [];
  acc[letter].push(rider);

  return acc;
}, {});

const letters = Object.keys(groupedRiders).sort();

  const code = getCountryCode(data.country);

  return (
    <div className="page-container">

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
        onClick={() => setSelectedLetter(letter)}
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
          <div key={rider.RiderID} className="rider-row">
            <img
              src={rider.ImageURL}
              alt={rider.FullName}
              className="rider-avatar"
            />
            <span
              className="country-rider-name"
              onClick={() => navigate(`/rider/${rider.RiderID}`)}
            >
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
        <div key={rider.RiderID} className="rider-row">
          <img
            src={rider.ImageURL}
            alt={rider.FullName}
            className="rider-avatar"
          />
          <span
            className="country-rider-name"
            onClick={() => navigate(`/rider/${rider.RiderID}`)}
          >
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