import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// reuse your flag logic
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

function CountriesPage() {
  const [countries, setCountries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/countries")
      .then(res => res.json())
      .then(data => setCountries(data));
  }, []);

  return (
    <div className="page-container">
      <h1>Countries</h1>

      <div className="countries-grid">
       {countries.map(country => {
  const code = getCountryCode(country);

  return (
    <div
      key={country}
      className="country-item"
      onClick={() => navigate(`/countries/${country}`)}
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
    </div>
  );
}

export default CountriesPage;