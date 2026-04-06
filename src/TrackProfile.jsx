import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./App.css";
import { apiUrl } from "./api";

function TrackProfile() {
  const { track_id, sport_id } = useParams();

  const sportId = Number(sport_id);

  const [classId, setClassId] = useState(1);
  const [data, setData] = useState(null);

  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const params = new URLSearchParams({
          track_id,
          sport_id: String(sportId),
        });
        const res = await fetch(apiUrl(`/api/track-classes?${params.toString()}`));
        if (!res.ok) {
          throw new Error("Failed to load track classes.");
        }
        const json = await res.json();

        setAvailableClasses(json.map((c) => c.ClassID));
      } catch (err) {
        console.error(err);
      }
    }

    fetchClasses();
  }, [track_id, sportId]);

  useEffect(() => {
    if (availableClasses.length === 0) return;

    if (!availableClasses.includes(classId)) {
      setClassId(availableClasses[0]);
    }
  }, [availableClasses, classId]);

  useEffect(() => {
    const params = new URLSearchParams({
      track_id,
      sport_id: String(sportId),
      class_id: String(classId),
    });

    fetch(apiUrl(`/api/track-profile?${params.toString()}`))
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load track profile.");
        }

        return res.json();
      })
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        console.error("ERROR:", err);
      });
  }, [track_id, sportId, classId]);

  if (!data || !data.race_winners) {
    return <div className="app-wrapper">Loading...</div>;
  }

  const trackName = data?.race_winners?.[0]?.TrackName || "Track Profile";

  return (
    <div className="track-profile-page">
      <section className="track-profile-hero">
        <h1>{trackName}</h1>

        <div className="toggle-buttons track-profile-toggle-buttons">
          {availableClasses.includes(1) && (
            <button
              onClick={() => setClassId(1)}
              className={classId === 1 ? "active" : ""}
            >
              450
            </button>
          )}

          {availableClasses.includes(2) && (
            <button
              onClick={() => setClassId(2)}
              className={classId === 2 ? "active" : ""}
            >
              250
            </button>
          )}

          {availableClasses.includes(3) && (
            <button
              onClick={() => setClassId(3)}
              className={classId === 3 ? "active" : ""}
            >
              500
            </button>
          )}
        </div>
      </section>

      <div className="grid-container track-profile-grid">

        {/* ===================== */}
        {/* Race Winners */}
        {/* ===================== */}
        <div className="leaderboard">
          <h2>Race Winners</h2>
          <div className="leaderboard-table-head race-winners-head">
            <span>Date</span>
            <span>Winner</span>
            <span>Brand</span>
          </div>
          <div className="leaderboard-table-wrapper">
            <table className="race-winners-table">
              <tbody>
                {data.race_winners?.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <Link to={`/race/${row.RaceID}`}>
                        {new Date(row.RaceDate).toLocaleDateString()}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/rider/${row.RiderID}`} className="race-winner-name-link">
                        <span className="race-winner-name-text">{row.Winner}</span>
                      </Link>
                    </td>
                    <td>{row.Brand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================== */}
        {/* Wins */}
        {/* ===================== */}
        <LeaderboardCard title="Wins" data={data.wins} stat="Wins" />

        {/* ===================== */}
        {/* Podiums */}
        {/* ===================== */}
        <LeaderboardCard title="Podiums" data={data.podiums} stat="Podiums" />

        {/* ===================== */}
        {/* Starts */}
        {/* ===================== */}
        <LeaderboardCard title="Starts" data={data.starts} stat="Starts" />

      </div>
    </div>
    
  );
}

/* ===================== */
/* Reusable Leaderboard */
/* ===================== */
function LeaderboardCard({ title, data, stat }) {
  return (
    <div className="leaderboard">
      <h2>{title}</h2>
      <div className="leaderboard-table-head">
        <span>#</span>
        <span>Rider</span>
        <span>{stat}</span>
      </div>
      <div className="leaderboard-table-wrapper">
        <table>
          <tbody>
            {data?.map((row, i) => (
              <tr key={i}>
                <td>{row.Rank}</td>
                <td>
                  <Link to={`/rider/${row.RiderID}`}>
                    {row.FullName}
                  </Link>
                </td>
                <td>{row[stat]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TrackProfile;
