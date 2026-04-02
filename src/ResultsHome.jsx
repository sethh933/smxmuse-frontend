import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResultsHome() {
  const [sport, setSport] = useState("sx");
  const [years, setYears] = useState([]);
  const [openDecade, setOpenDecade] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const sportId = sport === "sx" ? 1 : 2;

  fetch(`/api/years?sport_id=${sportId}`)
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

  return (
  <div className="results-container">

    <h1>Race Results</h1>

    {/* SX / MX Toggle */}
    <div className="toggle-buttons">
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
<div className="accordion-wrapper"></div>
    {/* Accordion */}
    {decades.map((decade) => (
      <div
  key={decade.label}
  className={`decade-card ${openDecade === decade.label ? "open" : ""}`}
>

        {/* Decade Header */}
        <div
  className="decade-header"
  onClick={() =>
    setOpenDecade(openDecade === decade.label ? null : decade.label)
  }
>
  {decade.label}
</div>

        {/* Years */}
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
);
}