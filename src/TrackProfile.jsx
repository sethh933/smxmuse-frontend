import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import "./App.css";

const API_BASE_URL = "http://localhost:8000";

function TrackProfile() {
  const { track_id, sport_id } = useParams();

  const sportId = Number(sport_id);

  const [classId, setClassId] = useState(1);
  const [data, setData] = useState(null);

  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await axios.get("http://localhost:8000/api/track-classes", {
          params: {
            track_id,
            sport_id: sportId,
          },
        });

        setAvailableClasses(res.data.map((c) => c.ClassID));
      } catch (err) {
        console.error(err);
      }
    }

    fetchClasses();
  }, [track_id, sportId]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/track-profile`, {
        params: {
          track_id,
          sport_id: sportId,
          class_id: classId,
        },
      })
      .then((res) => {
        setData(res.data);
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
          <div className="leaderboard-table-wrapper">
            <table className="race-winners-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Winner</th>
                  <th>Brand</th>
                </tr>
              </thead>
              <tbody>
                {data.race_winners?.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <Link to={`/race/${row.RaceID}`}>
                        {new Date(row.RaceDate).toLocaleDateString()}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/rider/${row.RiderID}`}>
                        {row.Winner}
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
      <div className="leaderboard-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Rider</th>
              <th>{stat}</th>
            </tr>
          </thead>
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
