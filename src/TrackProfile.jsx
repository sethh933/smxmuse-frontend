import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./App.css";
import { apiUrl } from "./api";
import Seo from "./SiteSeo";
import { buildRacePath, buildRiderPath, buildTrackPath, parseSportParam, parseTrackId } from "./seo";
import { formatCalendarDate, getCalendarYear } from "./dateUtils";

function TrackProfile() {
  const { track_id: trackParam, sport_id: sportParam } = useParams();
  const trackId = parseTrackId(trackParam);
  const sportId = parseSportParam(sportParam);

  const [selection, setSelection] = useState({
    sportId,
    classId: sportId === 4 ? 0 : 1,
  });
  const [data, setData] = useState(null);

  const [availableOptions, setAvailableOptions] = useState([]);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const params = new URLSearchParams({
          track_id: trackId,
          sport_id: String(sportId),
        });
        const res = await fetch(apiUrl(`/api/track-classes?${params.toString()}`));
        if (!res.ok) {
          throw new Error("Failed to load track classes.");
        }
        const json = await res.json();

        setAvailableOptions(json.map((option) => ({
          sportId: Number(option.SportID),
          classId: Number(option.ClassID),
        })));
      } catch (err) {
        console.error(err);
      }
    }

    fetchClasses();
  }, [trackId, sportId]);

  useEffect(() => {
    if (availableOptions.length === 0) return;

    const selectionIsAvailable = availableOptions.some(
      (option) => option.sportId === selection.sportId && option.classId === selection.classId
    );

    if (!selectionIsAvailable) {
      const preferredOption = availableOptions.find((option) => option.sportId === sportId)
        || availableOptions[0];
      setSelection(preferredOption);
    }
  }, [availableOptions, selection, sportId]);

  useEffect(() => {
    const params = new URLSearchParams({
      track_id: trackId,
      sport_id: String(selection.sportId),
      class_id: String(selection.classId),
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
  }, [trackId, selection]);

  if (!data || !data.race_winners) {
    return <div className="app-wrapper">Loading...</div>;
  }

  const trackName = data?.race_winners?.[0]?.TrackName || "Track Profile";
  const trackCity = data?.race_winners?.[0]?.City;
  const trackState = data?.race_winners?.[0]?.State;
  const trackLocation = [trackCity, trackState].filter(Boolean).join(", ");
  const sportLabel = selection.sportId === 1
    ? "Supercross"
    : selection.sportId === 2
      ? "Motocross"
      : selection.sportId === 3
        ? "SMX"
        : "WMX";

  return (
    <div className="track-profile-page">
      <Seo
        title={`${trackName} ${sportLabel} Track History`}
        description={`View ${trackName} winners, starts, podiums, and track history for ${sportLabel} on smxmuse.`}
        path={buildTrackPath(sportParam, trackId, trackName)}
      />
      <section className="track-profile-hero">
        <h1>{trackName}</h1>
        {trackLocation && <p className="track-profile-location">{trackLocation}</p>}

        <div className="toggle-buttons track-profile-toggle-buttons">
          {availableOptions.filter((option) => option.sportId !== 4).map((option) => (
            <button
              key={`${option.sportId}-${option.classId}`}
              onClick={() => setSelection(option)}
              className={
                selection.sportId === option.sportId && selection.classId === option.classId
                  ? "active"
                  : ""
              }
            >
              {option.classId === 1 ? "450" : option.classId === 2 ? "250" : "500"}
            </button>
          ))}
          {availableOptions.some((option) => option.sportId === 4) && (
            <button
              onClick={() => setSelection({ sportId: 4, classId: 0 })}
              className={selection.sportId === 4 ? "active" : ""}
            >
              WMX
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
                      <Link to={buildRacePath(row.RaceID, row.TrackName, getCalendarYear(row.RaceDate), {
                        sportId: selection.sportId,
                        city: row.City
                      })}>
                        {formatCalendarDate(row.RaceDate)}
                      </Link>
                    </td>
                    <td>
                      <Link to={buildRiderPath(row.RiderID, row.Winner)} className="race-winner-name-link">
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
                  <Link to={buildRiderPath(row.RiderID, row.FullName)}>
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
