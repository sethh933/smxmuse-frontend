import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiUrl } from "./api";

export default function RiderPoints() {
  const { riderId } = useParams();
  const location = useLocation();

  const [points, setPoints] = useState([]);
  const [riderData, setRiderData] = useState(null);
  const [mode, setMode] = useState("Combined");

  // Fetch rider header (same as results page)
  useEffect(() => {
    fetch(apiUrl(`/rider/${riderId}/race-results`))
      .then((res) => res.json())
      .then((data) => {
        setRiderData(data.rider);
      })
      .catch((err) =>
        console.error("Failed to fetch rider:", err)
      );
  }, [riderId]);

  // 🔥 Fetch points standings
  useEffect(() => {
    fetch(apiUrl(`/rider/${riderId}/points`))
      .then((res) => res.json())
      .then((data) => {
        setPoints(data);
      })
      .catch((err) =>
        console.error("Failed to fetch points:", err)
      );
  }, [riderId]);

  const getCountryCode = (country) => {
    const map = {
      "United States": "us",
      "France": "fr",
      "Australia": "au",
      "Netherlands": "nl",
      "Germany": "de",
      "Italy": "it",
      "Canada": "ca",
      "Spain": "es",
    };
    return map[country] || "us";
  };

  const filteredPoints = points.filter((row) => {
  if (mode === "Combined") return true;
  if (mode === "SX") return row.Class.includes("SX");
  if (mode === "MX") return row.Class.includes("MX");
  return true;
});

  return (
    <div className="rider-profile-page rider-points-page">
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
              to={`/rider/${riderId}`}
              className="rider-nav-button"
            >
              Career Stats
            </Link>

            <Link
              to={`/rider/${riderId}/results`}
              className="rider-nav-button"
            >
              Career Results
            </Link>

            <Link
              to={`/rider/${riderId}/points`}
              className={`rider-nav-button ${
                location.pathname.includes("/points") ? "active" : ""
              }`}
            >
              Points Standings
            </Link>
          </div>

          <div className="toggle-buttons rider-profile-toggle">
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
        </section>
      )}

      {/* TABLE */}
      <div className="rider-results-table-wrapper">
        <table className="rider-stats rider-points-table">
          <thead>
            <tr>
              <th className="year-col">Year</th>
              <th className="result-col">Result</th>
              <th className="points-col">Points</th>
              <th className="class-col">Class</th>
              <th className="brand-col">Brand</th>
            </tr>
          </thead>

          <tbody>
            {filteredPoints.map((row, i) => (
              <tr key={i}>
                <td className="year-col">
  <Link
    to={`/season/${
      row.Class.includes("MX") ? "mx" : "sx"
    }/${row.Year}/${
      row.Class === "250SX W"
        ? "250W"
        : row.Class === "250SX E"
        ? "250E"
        : row.Class.includes("450")
        ? "450"
        : row.Class.includes("250")
        ? "250"
        : "500"
    }`}
    style={{ color: "#60a5fa", textDecoration: "none" }}
  >
    {row.Year}
  </Link>
</td>

                <td className="result-col">
                  {row.Result === "1"
                    ? "🏆 1"
                    : row.Result}
                </td>

                <td className="points-col">
                  {row.Points}
                  <div className="rider-points-mobile-meta">
                    <span className="rider-points-mobile-class">{row.Class}</span>
                    <span className="rider-points-mobile-brand">{row.Brand}</span>
                  </div>
                </td>

                <td className="class-col">{row.Class}</td>

                <td className="brand-col">{row.Brand}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
