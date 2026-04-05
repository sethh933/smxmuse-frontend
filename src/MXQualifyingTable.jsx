import React from "react";
import { Link } from "react-router-dom";

function MXQualifyingTable({ data }) {
  return (
    <div className="rider-table-wrapper">
    <table className="rider-stats rider-stats-content-fit">
        <thead>
          <tr>
            <th className="pos">Pos</th>
            <th className="rider">Rider</th>
            <th>Brand</th>
            <th>Best Lap</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td className="pos">{row.result}</td>
              <td className="rider">
  <Link to={`/rider/${row.riderid}`}>
    {row.fullname}
  </Link>
</td>
              <td>{row.brand}</td>
              <td>{row.best_lap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MXQualifyingTable;
