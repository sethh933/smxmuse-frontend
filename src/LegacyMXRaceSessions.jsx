import { useEffect, useState } from "react";
import { apiUrl } from "./api";
import { BrandMark, CountryFlag, ResultRider } from "./ResultIdentity";

export default function LegacyMXRaceSessions({ raceId, year }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (year < 2004 || year > 2008) {
      setSessions([]);
      return;
    }

    fetch(apiUrl(`/api/race/legacy-mx-sessions?raceid=${raceId}`))
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load legacy MX sessions");
        return res.json();
      })
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error(error);
        setSessions([]);
      });
  }, [raceId, year]);

  if (sessions.length === 0) return null;

  return sessions.map((session) => (
    <div key={session.session_order}>
      <h2 className="section-header">{session.title}</h2>
      <div className="rider-table-wrapper">
        <table className="rider-stats rider-stats-content-fit result-identity-table">
          <thead>
            <tr>
              <th>Result</th>
              <th className="rider">Full Name</th>
              <th className="result-country-col">Country</th>
              <th className="result-brand-col">Brand</th>
              <th>{session.title.includes("Timed Qualifying") ? "BestLap" : "Interval"}</th>
            </tr>
          </thead>
          <tbody>
            {session.results.map((row, index) => (
              <tr key={`${session.session_order}-${row.riderid}-${row.result}-${index}`}>
                <td>{row.result}</td>
                <td className="rider">
                  <ResultRider riderId={row.riderid} name={row.fullname} imageUrl={row.imageurl}
                    country={row.country} brand={row.brand} />
                </td>
                <td className="result-country-col"><CountryFlag country={row.country} /></td>
                <td className="result-brand-col"><BrandMark brand={row.brand} /></td>
                <td>{row.interval}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ));
}
