import React from "react";
import { Link } from "react-router-dom";
import { buildRiderPath } from "./seo";

function SMXMotoTable({ data }) {
  const hasNoRaceStatus = (raceStatus) =>
    raceStatus === null || raceStatus === undefined || String(raceStatus).trim() === "";

  return (
    <div className="rider-table-wrapper">
      <table className="rider-stats rider-stats-content-fit">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Rider</th>
            <th>Brand</th>
            <th>Interval</th>
            <th>BestLap</th>
            <th>Start</th>
            <th>Holeshot</th>
            <th>RaceStatus</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.result}</td>
              <td>
                <Link to={buildRiderPath(row.riderid, row.fullname)}>
                  {row.fullname}
                </Link>
              </td>
              <td>{row.brand}</td>
              <td>{row.interval ?? "-"}</td>
              <td>{row.bestlap ?? "-"}</td>
              <td>{row.start ?? "-"}</td>
              <td className="holeshot">{row.holeshot === 1 ? "\u25CF" : ""}</td>
              <td className={hasNoRaceStatus(row.racestatus) ? "holeshot" : ""}>
                {hasNoRaceStatus(row.racestatus) ? "\u25CF" : row.racestatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SMXMotoTable;
