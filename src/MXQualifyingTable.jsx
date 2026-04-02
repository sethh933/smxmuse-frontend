import React from "react";
import { Link } from "react-router-dom";

function MXQualifyingTable({ data }) {
  return (
    <div className="rider-table-wrapper">
      <table className="rider-stats">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Rider</th>
            <th>Brand</th>
            <th>Best Lap</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.result}</td>
              <td>
  <Link to={`/rider/${row.riderid}`} className="rider-link">
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