import React from "react";
import { Link } from "react-router-dom";

function MXOverallsTable({ data }) {
  return (
    <div className="rider-table-wrapper">
      <table className="rider-stats">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Rider</th>
            <th>Brand</th>
            <th>M1</th>
            <th>M2</th>
            <th>Laps Led</th>
            <th>Holeshot</th>
            <th>M1 Start</th>
            <th>M2 Start</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.result}</td>
              <td>
  <Link to={`/rider/${row.riderid}`}>
    {row.fullname}
  </Link>
</td>
              <td>{row.brand}</td>
              <td>{row.moto1}</td>
              <td>{row.moto2}</td>
              <td>{row.lapsled}</td>
              <td>{row.holeshot}</td>
              <td>{row.m1_start}</td>
              <td>{row.m2_start}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MXOverallsTable;
