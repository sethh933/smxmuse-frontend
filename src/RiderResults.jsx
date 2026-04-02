import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RiderResults() {
  const { riderId } = useParams();
  const location = useLocation();
  const [selectedTrack, setSelectedTrack] = useState("All Tracks");
  const [results, setResults] = useState([]);
  const [mode, setMode] = useState("Combined");
  const [riderData, setRiderData] = useState(null);
  
  const trackOptions = [
  "All Tracks",
  ...[...new Set(results.map(r => r.TrackName))].sort()
];

  const getRacePath = (row) =>
    `/race/${row.RaceID}`;

  // Fetch race results
  useEffect(() => {
  fetch(`http://localhost:8000/rider/${riderId}/race-results`)
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
    (mode === "MX" && row.Discipline === "MX");

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
    <div className="rider-profile-page">
      {!riderData ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* HEADER */}
          <div className="rider-header">
            <img
              src={riderData.image_url}
              alt={riderData.full_name}
              className="rider-profile-image"
            />

            <h1 className="rider-name">
              {riderData.full_name}
            </h1>

            <img
              src={`https://flagcdn.com/w40/${getCountryCode(
                riderData.country
              )}.png`}
              alt={riderData.country}
              className="rider-flag"
            />
          </div>

          {/* NAV */}
          <div className="rider-nav">
  <Link
    to={`/rider/${riderId}`}
    className="rider-nav-button"
  >
    Career Stats
  </Link>

  <Link
    to={`/rider/${riderId}/results`}
    className={`rider-nav-button ${
      location.pathname.includes("/results") ? "active" : ""
    }`}
  >
    Career Results
  </Link>

  <Link
    to={`/rider/${riderId}/points`}
    className="rider-nav-button"
  >
    Points Standings
  </Link>
</div>
        </>
      )}

      

      {/* EXISTING TOGGLE (UNCHANGED) */}
      <div className="toggle-buttons">
        <button
          className={mode === "Combined" ? "active" : ""}
          onClick={() => setMode("Combined")}
        >
          Combined
        </button>

        <button
          className={mode === "SX" ? "active" : ""}
          onClick={() => setMode("SX")}
        >
          SX
        </button>

        <button
          className={mode === "MX" ? "active" : ""}
          onClick={() => setMode("MX")}
        >
          MX
        </button>
      </div>

      <div className="track-filter">
  <select
    value={selectedTrack}
    onChange={(e) => setSelectedTrack(e.target.value)}
  >
    {trackOptions.map((track, i) => (
      <option key={i} value={track}>
        {track}
      </option>
    ))}
  </select>
</div>

      {/* TABLE (UNCHANGED) */}
      <div className="rider-results-table-wrapper">
       <table className="rider-stats">
          <thead>
            <tr>
              <th>Result</th>
              <th>Track</th>
              <th>Date</th>
              <th>Class</th>
              <th>Brand</th>
              <th>Qual</th>
              <th>Heat</th>
              <th>LCQ</th>
            </tr>
          </thead>

          <tbody>
            {filteredResults.map((row, i) => (
              <tr key={i}>
                <td>{row.Result}</td>

                <td>
                  <Link
  to={`/track/${row.Discipline === "SX" ? 1 : 2}/${row.TrackID}`}
>
                    {row.TrackName}
                  </Link>
                </td>

                <td>
                  <Link to={getRacePath(row)}>
                    {row.RaceDate}
                  </Link>
                </td>

                <td>{row.Class}</td>
                <td>{row.Brand}</td>
                <td>{row.QualResult}</td>
                <td>{row.HeatResult}</td>
                <td>{row.LCQResult}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}