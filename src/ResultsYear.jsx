import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

function getChampionLabel(sport, classId, coastId) {
  if (sport === "sx") {
    if (classId === 1) return "Premier Class Champion";
    if (classId === 2 && coastId === 1) return "250 West Champion";
    if (classId === 2 && coastId === 2) return "250 East Champion";
    if (classId === 2) return "250 Champion";
  }

  if (sport === "mx") {
    if (classId === 1) return "450 Champion";
    if (classId === 2) return "250 Champion";
    if (classId === 3) return "500 Champion";
  }

  return "Champion";
}

export default function ResultsYear() {
  const { sport, year } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [races, setRaces] = useState([]);
  const [champions, setChampions] = useState([]);

  const sportId = sport === "sx" ? 1 : 2;
  const sportLabel = sport === "sx" ? "Supercross" : "Motocross";

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch(`/api/races?sport_id=${sportId}&year=${year}`).then((res) => res.json()),
      fetch(`/api/season-champions?sport_id=${sportId}&year=${year}`).then((res) => res.json())
    ])
      .then(([raceData, championData]) => {
        setRaces(raceData);
        setChampions(championData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [sportId, year]);

  const championCards = useMemo(
    () =>
      champions.map((champion) => ({
        ...champion,
        label: getChampionLabel(sport, champion.classid, champion.coastid)
      })),
    [champions, sport]
  );

  if (loading) {
    return (
      <div className="page-container">
        <h1>
          {year} {sportLabel} Results
        </h1>
        <p style={{ textAlign: "center" }}>Loading races...</p>
      </div>
    );
  }

  return (
    <div className="schedule-container results-year-page">
      <section className="results-year-hero">
        <p className="results-home-kicker">Season archive</p>
        <h1>
          {year} {sportLabel} Results
        </h1>
        <p className="results-year-intro">
          Open any round from the {year} {sportLabel.toLowerCase()} season, or start with the
          championship picture before diving into the schedule.
        </p>
      </section>

      {championCards.length > 0 && (
        <section className="results-year-champions">
          <div className="results-year-section-heading">
            <p className="results-home-kicker">Season champions</p>
            <h2>Who finished the year on top.</h2>
          </div>

          <div className="results-year-champion-grid">
            {championCards.map((champion) => (
              <button
                key={`${champion.classid}-${champion.coastid ?? "all"}-${champion.riderid}`}
                type="button"
                className="results-year-champion-card"
                onClick={() => navigate(`/rider/${champion.riderid}`)}
              >
                <span className="results-year-champion-label">{champion.label}</span>
                <img
                  src={champion.imageurl || "/smxmuselogo.png"}
                  alt={champion.fullname}
                  className="results-year-champion-image"
                />
                <strong>{champion.fullname}</strong>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="results-year-schedule">
        <div className="results-year-section-heading">
          <p className="results-home-kicker">Season schedule</p>
          <h2>Pick a round to view the full race page.</h2>
        </div>

        <div className="schedule-header">
          <div>Round</div>
          <div>Track</div>
          <div>Location</div>
          <div>Date</div>
        </div>

        <div className="schedule-list">
          {races.map((race) => (
            <div
              key={race.race_id}
              className="schedule-row"
              onClick={() => navigate(`/race/${race.race_id}`)}
            >
              <div className="schedule-round">{race.round}</div>
              <div className="schedule-track">{race.track_name}</div>
              <div className="schedule-location">
                {race.city}, {race.state}
              </div>
              <div className="schedule-date">
                {new Date(race.race_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
