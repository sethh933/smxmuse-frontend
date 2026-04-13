import React from "react";
import { Link } from "react-router-dom";
import { buildRiderPath } from "./seo";

function MXConsiTable({ data }) {
  return (
    <div className="rider-table-wrapper">
    <table className="rider-stats rider-stats-content-fit">
        <thead>
          <tr>
            <th className="pos">Pos</th>
            <th className="rider">Rider</th>
            <th>Brand</th>
          </tr>
        </thead>

        <tbody>
  {data.map((row, index) => (
    <tr key={index}>
      <td className="pos">{row.result}</td>
      <td className="rider">
  <Link to={buildRiderPath(row.riderid, row.fullname)}>
    {row.fullname}
  </Link>
</td>
      <td>{row.brand}</td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
}

export default MXConsiTable;
