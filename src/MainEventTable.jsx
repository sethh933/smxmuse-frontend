import "./app.css";
import { Link } from "react-router-dom";

export default function MainEventTable({ results }) {
  if (!results || results.length === 0) {
    return <div className="results-empty">No results available</div>;
  }

  // Show Coast column ONLY if at least one row has a non-null ridercoastid
  const showCoast = results.some(
    r => r.ridercoastid !== null && r.ridercoastid !== undefined
  );

  const coastLabel = (id) => {
    if (id === 1) return "West";
    if (id === 2) return "East";
    if (id === 3) return "East/West";
    return "";
  };

  return (
    <div className="rider-table-wrapper">
  <table className="rider-stats">
        <thead>
          <tr>
            <th className="sticky-col pos">Pos</th>
            <th className="sticky-col rider">Rider</th>
            <th>Brand</th>
            <th>Interval</th>
            <th>Best Lap</th>
            <th>Laps Led</th>
            <th>HS</th>
            <th>HS Pos</th>
            <th>Lap 1 Pos</th>
            {showCoast && <th>Coast</th>}
          </tr>
        </thead>

        <tbody>
          {results.map((rider) => (
            <tr key={`${rider.fullname}-${rider.result}`}>
              <td className="pos">{rider.result}</td>
              <td className="rider">
  <Link to={`/rider/${rider.riderid}`}>
    {rider.fullname}
  </Link>
</td>
              <td>{rider.brand}</td>
              <td>{rider.interval}</td>
              <td>{rider.bestlap}</td>
              <td>{rider.lapsled === null ? "" : rider.lapsled}</td>
              <td className="holeshot">
                {rider.holeshot === 1 ? "●" : ""}
              </td>
              <td>{rider.holeshotpos ?? ""}</td>
              <td>{rider.Lap1Pos}</td>
              {showCoast && (
                <td>{coastLabel(rider.ridercoastid)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
