import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ResultsYear() {
  const { sport, year } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [races, setRaces] = useState([]);

  const sportId = sport === "sx" ? 1 : 2;

  useEffect(() => {
    setLoading(true);

    fetch(`/api/races?sport_id=${sportId}&year=${year}`)
      .then(res => res.json())
      .then(data => {
        setRaces(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [sport, year]);

  if (loading) {
    return (
      <div className="page-container">
        <h1>
          {year} {sport === "sx" ? "Supercross" : "Motocross"} Results
        </h1>
        <p style={{ textAlign: "center" }}>Loading races...</p>
      </div>
    );
  }

  return (
    <div className="schedule-container">

  <h1>
    {year} {sport === "sx" ? "Supercross" : "Motocross"} Results
  </h1>
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
  <div className="schedule-round">
    {race.round}
  </div>

  <div className="schedule-track">
    {race.track_name}
  </div>

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

</div>
  );
}