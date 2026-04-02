import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useSearchParams, Link } from "react-router-dom";
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
          track_id: track_id,
          sport_id: sportId
        }
      });

      setAvailableClasses(res.data.map(c => c.ClassID));
    } catch (err) {
      console.error(err);
    }
  }

  fetchClasses();
}, [track_id, sportId]);

  useEffect(() => {
  console.log("API_BASE_URL:", API_BASE_URL);
  console.log("Params:", { track_id, sportId, classId });

  axios
    .get(`${API_BASE_URL}/api/track-profile`, {
      params: {
        track_id,
        sport_id: sportId,
        class_id: classId,
      },
    })
    .then((res) => {
      console.log("RESPONSE:", res.data);
      setData(res.data);
    })
    .catch((err) => {
      console.error("ERROR:", err);
    });
}, [track_id, sportId, classId]);

  if (!data || !data.race_winners) {
  return <div className="app-wrapper">Loading...</div>;
}

  return (
    <div className="app-wrapper">
      <h1 style={{ textAlign: "center" }}>
  {data?.race_winners?.[0]?.TrackName || "Track Profile"}
</h1>

      {/* Class Toggle */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>

  {availableClasses.includes(1) && (
    <button
      onClick={() => setClassId(1)}
      style={{
        background: classId === 1 ? "#fff" : "#333",
        color: classId === 1 ? "#000" : "#fff",
        padding: "6px 12px",
        borderRadius: "6px"
      }}
    >
      450
    </button>
  )}

  {availableClasses.includes(2) && (
    <button
      onClick={() => setClassId(2)}
      style={{
        background: classId === 2 ? "#fff" : "#333",
        color: classId === 2 ? "#000" : "#fff",
        padding: "6px 12px",
        borderRadius: "6px"
      }}
    >
      250
    </button>
  )}

  {availableClasses.includes(3) && (
    <button
      onClick={() => setClassId(3)}
      style={{
        background: classId === 3 ? "#fff" : "#333",
        color: classId === 3 ? "#000" : "#fff",
        padding: "6px 12px",
        borderRadius: "6px"
      }}
    >
      500
    </button>
  )}

</div>

      <div className="grid-container">

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
                    <td>{row.Winner}</td>
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