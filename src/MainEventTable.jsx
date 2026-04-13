import "./App.css";
import { Link } from "react-router-dom";
import { buildRiderPath } from "./seo";

export default function MainEventTable({ results, raceYear, sportId, tripleCrownId }) {
  if (!results || results.length === 0) {
    return <div className="results-empty">No results available</div>;
  }

  const isTripleCrown = sportId === 1 && tripleCrownId === 1;
  const showDetailedRaceColumns = !(sportId === 1 && raceYear < 2003);
  const showHsPos = sportId === 1 && raceYear >= 2026;

  return (
    <div className="rider-table-wrapper">
      <table className="rider-stats">
        <thead>
          <tr>
            <th className="sticky-col pos">Pos</th>
            <th className="sticky-col rider">Rider</th>
            <th>Brand</th>
            {isTripleCrown ? <th>Main 1</th> : showDetailedRaceColumns && <th>Interval</th>}
            {isTripleCrown ? <th>Main 2</th> : showDetailedRaceColumns && <th>Best Lap</th>}
            {isTripleCrown ? <th>Main 3</th> : showDetailedRaceColumns && <th>Laps Led</th>}
            <th>HS</th>
            {!isTripleCrown && showHsPos && <th>HS Pos</th>}
            {!isTripleCrown && showDetailedRaceColumns && <th>Lap 1 Pos</th>}
          </tr>
        </thead>

        <tbody>
          {results.map((rider) => (
            <tr key={`${rider.riderid}-${rider.result}`}>
              <td className="pos">{rider.result}</td>
              <td className="rider">
                <Link to={buildRiderPath(rider.riderid, rider.fullname)}>
                  {rider.fullname}
                </Link>
              </td>
              <td>{rider.brand}</td>
              {isTripleCrown ? <td>{rider.tc1 ?? ""}</td> : showDetailedRaceColumns && <td>{rider.interval}</td>}
              {isTripleCrown ? <td>{rider.tc2 ?? ""}</td> : showDetailedRaceColumns && <td>{rider.bestlap}</td>}
              {isTripleCrown ? <td>{rider.tc3 ?? ""}</td> : showDetailedRaceColumns && <td>{rider.lapsled === null ? "" : rider.lapsled}</td>}
              <td className="holeshot">{rider.holeshot === 1 ? "\u25CF" : ""}</td>
              {!isTripleCrown && showHsPos && <td>{rider.holeshotpos ?? ""}</td>}
              {!isTripleCrown && showDetailedRaceColumns && <td>{rider.Lap1Pos}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
