import React from "react";
import { BrandMark, CountryFlag, ResultRider } from "./ResultIdentity";

function MXConsiTable({ data }) {
  const hasValue = (key) => data.some(
    (row) => row[key] !== null && row[key] !== undefined
  );
  const showInterval = hasValue("interval");
  const showBestLap = hasValue("bestlap");
  const showLap1Pos = hasValue("start");
  const showHoleshotLine = hasValue("holeshotline");
  const showHoleshot = hasValue("holeshot");
  const showRaceStatus = hasValue("racestatus");

  return (
    <div className="rider-table-wrapper">
    <table className="rider-stats rider-stats-content-fit result-identity-table">
        <thead>
          <tr>
            <th className="pos">Pos</th>
            <th className="rider">Rider</th>
            <th className="result-country-col">Country</th>
            <th className="result-brand-col">Brand</th>
            {showInterval && <th>Interval</th>}
            {showBestLap && <th>BestLap</th>}
            {showLap1Pos && <th>Lap1Pos</th>}
            {showHoleshotLine && <th>HoleshotLine</th>}
            {showHoleshot && <th>Holeshot</th>}
            {showRaceStatus && <th>RaceStatus</th>}
          </tr>
        </thead>

        <tbody>
  {data.map((row, index) => (
    <tr key={index}>
      <td className="pos">{row.result}</td>
      <td className="rider">
        <ResultRider riderId={row.riderid} name={row.fullname} imageUrl={row.imageurl}
          country={row.country} brand={row.brand} />
      </td>
      <td className="result-country-col"><CountryFlag country={row.country} /></td>
      <td className="result-brand-col"><BrandMark brand={row.brand} /></td>
      {showInterval && <td>{row.interval ?? "-"}</td>}
      {showBestLap && <td>{row.bestlap ?? "-"}</td>}
      {showLap1Pos && <td>{row.start ?? "-"}</td>}
      {showHoleshotLine && <td>{row.holeshotline ?? "-"}</td>}
      {showHoleshot && <td className="holeshot">{Number(row.holeshot) === 1 ? "\u25CF" : ""}</td>}
      {showRaceStatus && <td>{row.racestatus ?? "-"}</td>}
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
}

export default MXConsiTable;
