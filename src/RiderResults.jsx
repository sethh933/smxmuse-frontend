import { useParams, Link, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiUrl } from "./api";
import Seo from "./SiteSeo";
import { buildRacePath, buildRiderPath, buildTrackPath, parseRiderId } from "./seo";
import { getCalendarYear } from "./dateUtils";

export default function RiderResults() {
  const { riderId: riderParam } = useParams();
  const riderId = parseRiderId(riderParam);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [riderData, setRiderData] = useState(null);

  const disciplineOrder = ["SX", "MX", "SMX", "WMX"];
  const availableDisciplines = disciplineOrder.filter((discipline) =>
    results.some((row) => row.Discipline === discipline)
  );
  
  const trackOptions = [
  "All Tracks",
  ...[...new Set(results.map(r => r.TrackName))].sort()
];

  const requestedDiscipline = searchParams.get("discipline")?.toUpperCase();
  const defaultMode = availableDisciplines.length === 1 ? availableDisciplines[0] : "Combined";
  const mode = requestedDiscipline === "COMBINED"
    ? "Combined"
    : availableDisciplines.includes(requestedDiscipline)
      ? requestedDiscipline
      : defaultMode;
  const requestedTrack = searchParams.get("track");
  const selectedTrack = requestedTrack && trackOptions.includes(requestedTrack)
    ? requestedTrack
    : "All Tracks";

  const updateFilterUrl = (key, value, defaultValue) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  const getSportId = (discipline) => {
    if (discipline === "SX") return 1;
    if (discipline === "MX") return 2;
    if (discipline === "SMX") return 3;
    if (discipline === "WMX") return 4;
    return null;
  };

  const getRacePath = (row) =>
    buildRacePath(row.RaceID, row.TrackName, getCalendarYear(row.RaceDate), {
      sportId: getSportId(row.Discipline),
      city: row.City
    });

  // Fetch race results
  useEffect(() => {
  fetch(apiUrl(`/rider/${riderId}/race-results`))
    .then((res) => res.json())
    .then((data) => {
      setResults(data.results);     // ✅ correct
      setRiderData(data.rider);     // ✅ correct
    })
    .catch((err) =>
      console.error("Failed to fetch rider race results:", err)
    );
}, [riderId]);

  const filteredResults = results.filter((row) => {
  const disciplineMatch =
    mode === "Combined" ||
    (mode === "SX" && row.Discipline === "SX") ||
    (mode === "MX" && row.Discipline === "MX") ||
    (mode === "SMX" && row.Discipline === "SMX") ||
    (mode === "WMX" && row.Discipline === "WMX");

  const trackMatch =
    selectedTrack === "All Tracks" || row.TrackName === selectedTrack;

  return disciplineMatch && trackMatch;
});

  const getCountryCode = (country) => {
    const map = {
      "Puerto Rico": "pr",
      "Finland": "fi",
      "South Korea": "kr",
      "Guatemala": "gt",
      "New Zealand": "nz",
      "Uganda": "ug",
      "Scotland": "gb",
      "Italy": "it",
      "Brazil": "br",
      "Netherlands": "nl",
      "Bolivia": "bo",
      "Germany": "de",
      "England": "gb",
      "Lithuania": "lt",
      "Switzerland": "ch",
      "United States": "us",
      "Estonia": "ee",
      "Ecuador": "ec",
      "Mongolia": "mn",
      "Australia": "au",
      "United Kingdom": "gb",
      "Mexico": "mx",
      "Sweden": "se",
      "Honduras": "hn",
      "Ukraine": "ua",
      "Argentina": "ar",
      "Czechia": "cz",
      "Russia": "ru",
      "Uruguay": "uy",
      "Canada": "ca",
      "Ireland": "ie",
      "Iran": "ir",
      "Isle of Man": "im",
      "Latvia": "lv",
      "Norway": "no",
      "France": "fr",
      "Dominican Republic": "do",
      "Belgium": "be",
      "Japan": "jp",
      "Spain": "es",
      "Venezuela": "ve",
      "Denmark": "dk",
      "Colombia": "co",
      "Chile": "cl",
      "South Africa": "za",
      "Portugal": "pt",
      "Costa Rica": "cr"
    };

    return map[country] || "us";
  };

  return (
    <div className="rider-profile-page rider-results-page">
      {riderData && (
        <Seo
          title={`${riderData.full_name} Career Results`}
          description={`Browse ${riderData.full_name}'s race-by-race Supercross and Motocross career results, including track history and filtered event results.`}
          path={buildRiderPath(riderId, riderData.full_name, "results")}
          canonical={buildRiderPath(riderId, riderData.full_name, "results")}
          image={riderData.image_url}
        />
      )}
      {!riderData ? (
        <div>Loading...</div>
      ) : (
        <section className="rider-profile-hero">
          <div className="rider-header">
            <img
              src={riderData.image_url}
              alt={riderData.full_name}
              className="rider-profile-image"
            />

            <h1 className="rider-name">
              {riderData.full_name}
            </h1>

            <span
              className="rider-flag-tooltip"
              tabIndex={0}
              aria-label={riderData.country}
            >
              <img
                src={`https://flagcdn.com/w40/${getCountryCode(
                  riderData.country
                )}.png`}
                alt={riderData.country}
                className="rider-flag"
              />
              <span className="rider-flag-tooltip-bubble">{riderData.country}</span>
            </span>
          </div>

          <div className="rider-nav">
            <Link
              to={buildRiderPath(riderId, riderData.full_name)}
              className="rider-nav-button"
            >
              Career Stats
            </Link>

            <Link
              to={buildRiderPath(riderId, riderData.full_name, "results")}
              className={`rider-nav-button ${
                location.pathname.includes("/results") ? "active" : ""
              }`}
            >
              Career Results
            </Link>

            <Link
              to={buildRiderPath(riderId, riderData.full_name, "points")}
              className="rider-nav-button"
            >
              Points Standings
            </Link>
          </div>

          <div className="toggle-buttons rider-profile-toggle">
            {availableDisciplines.length > 1 && (
              <button
                className={mode === "Combined" ? "active" : ""}
                onClick={() => updateFilterUrl("discipline", "Combined", "Combined")}
              >
                Combined
              </button>
            )}

            {availableDisciplines.map((discipline) => (
              <button
                key={discipline}
                className={mode === discipline ? "active" : ""}
                onClick={() => updateFilterUrl("discipline", discipline, defaultMode)}
              >
                {discipline}
              </button>
            ))}
          </div>

          <div className="track-filter rider-profile-track-filter">
            <select
              value={selectedTrack}
              onChange={(e) => updateFilterUrl("track", e.target.value, "All Tracks")}
            >
              {trackOptions.map((track, i) => (
                <option key={i} value={track}>
                  {track}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {/* TABLE (UNCHANGED) */}
      <div className="rider-results-table-wrapper">
       <table className="rider-stats rider-results-table">
          <thead>
            <tr>
              <th className="result-col">Result</th>
              <th className="track-col">Track</th>
              <th className="date-col">Date</th>
              <th className="class-col">Class</th>
              <th className="brand-col">Brand</th>
              <th className="qual-col">Qual</th>
              {mode !== "WMX" && <th className="heat-col">Heat</th>}
              {mode !== "WMX" && <th className="lcq-col">LCQ</th>}
            </tr>
          </thead>

          <tbody>
            {filteredResults.map((row, i) => (
              <tr key={i}>
                <td className="result-col">{row.Result}</td>

                <td className="track-col">
                  <Link
  to={buildTrackPath(getSportId(row.Discipline), row.TrackID, row.TrackName)}
>
                    {row.TrackName}
                  </Link>
                  <div className="rider-result-mobile-meta">
                    <Link
                      to={getRacePath(row)}
                      className="rider-result-mobile-date"
                    >
                      {row.RaceDate}
                    </Link>
                    <span className="rider-result-mobile-brand">{row.Brand}</span>
                  </div>
                </td>

                <td className="date-col">
                  <Link to={getRacePath(row)}>
                    {row.RaceDate}
                  </Link>
                </td>

                <td className="class-col">{row.Class}</td>
                <td className="brand-col">{row.Brand}</td>
                <td className="qual-col">{row.QualResult}</td>
                {mode !== "WMX" && <td className="heat-col">{row.HeatResult}</td>}
                {mode !== "WMX" && <td className="lcq-col">{row.LCQResult}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
