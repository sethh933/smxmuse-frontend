import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "./api";

export default function ResultsHome() {
  const [sport, setSport] = useState("sx");
  const [years, setYears] = useState([]);
  const [openDecade, setOpenDecade] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const sportId = sport === "sx" ? 1 : 2;

  fetch(apiUrl(`/api/years?sport_id=${sportId}`))
    .then(res => res.json())
    .then(data => setYears(data))
    .catch(err => console.error(err));

  // 🔥 Reset accordion when sport changes
  setOpenDecade(null);

}, [sport]);

  // 🔥 Group years into decades
  const groupedDecades = years.reduce((acc, year) => {
    const decade = Math.floor(year / 10) * 10;

    if (!acc[decade]) acc[decade] = [];
    acc[decade].push(year);

    return acc;
  }, {});

  const decades = Object.entries(groupedDecades)
    .sort((a, b) => b[0] - a[0]) // newest decade first
    .map(([decade, years]) => ({
      label: `${decade}s`,
      years: years.sort((a, b) => b - a)
    }));

  const totalYears = years.length;
  const newestYear = years.length > 0 ? Math.max(...years) : null;
  const oldestYear = years.length > 0 ? Math.min(...years) : null;

  return (
    <div className="results-container results-home">
      <section className="results-home-hero">
        <p className="results-home-kicker">Archive browser</p>
        <h1>Race Results</h1>
        <p className="results-home-intro">
          Pick a sport, then click a decade to dive into each year and open every round from the archive.
        </p>

        <div className="results-home-toolbar">
          <div className="toggle-buttons results-toggle-buttons">
            <button
              onClick={() => setSport("sx")}
              className={sport === "sx" ? "active" : ""}
            >
              SX
            </button>

            <button
              onClick={() => setSport("mx")}
              className={sport === "mx" ? "active" : ""}
            >
              MX
            </button>
          </div>

          <div className="results-home-summary">
            <div className="results-home-summary-card">
              <span>Sport</span>
              <strong>{sport === "sx" ? "Supercross" : "Motocross"}</strong>
            </div>
            <div className="results-home-summary-card">
              <span>Years</span>
              <strong>{totalYears || "--"}</strong>
            </div>
            <div className="results-home-summary-card">
              <span>Range</span>
              <strong>
                {oldestYear && newestYear ? `${oldestYear}-${newestYear}` : "--"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <div className="accordion-wrapper results-accordion">
        {decades.map((decade) => (
          <div
            key={decade.label}
            className={`decade-card ${openDecade === decade.label ? "open" : ""}`}
          >
            <div
              className="decade-header"
              onClick={() =>
                setOpenDecade(openDecade === decade.label ? null : decade.label)
              }
            >
              <div className="decade-header-copy">
                <span className="decade-label">{decade.label}</span>
                <span className="decade-subtitle">
                  {decade.years.length} {decade.years.length === 1 ? "season" : "seasons"}
                </span>
              </div>
              <span className={`decade-chevron ${openDecade === decade.label ? "open" : ""}`}>
                {openDecade === decade.label ? "−" : "+"}
              </span>
            </div>

            {openDecade === decade.label && (
              <div className="year-row">
                {decade.years.map((year) => (
                  <button
                    key={year}
                    className="year-button"
                    onClick={() => navigate(`/results/${sport}/${year}`)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
