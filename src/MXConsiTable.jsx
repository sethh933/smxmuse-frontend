import React from "react";
import { BrandMark, CountryFlag, ResultRider } from "./ResultIdentity";

function MXConsiTable({ data }) {
  return (
    <div className="rider-table-wrapper">
    <table className="rider-stats rider-stats-content-fit result-identity-table">
        <thead>
          <tr>
            <th className="pos">Pos</th>
            <th className="rider">Rider</th>
            <th>Country</th>
            <th>Brand</th>
          </tr>
        </thead>

        <tbody>
  {data.map((row, index) => (
    <tr key={index}>
      <td className="pos">{row.result}</td>
      <td className="rider">
        <ResultRider riderId={row.riderid} name={row.fullname} imageUrl={row.imageurl} />
      </td>
      <td><CountryFlag country={row.country} /></td>
      <td><BrandMark brand={row.brand} /></td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
}

export default MXConsiTable;
