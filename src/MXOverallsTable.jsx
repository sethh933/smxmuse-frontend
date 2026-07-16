import React from "react";
import { BrandMark, CountryFlag, ResultRider } from "./ResultIdentity";

function MXOverallsTable({ data }) {
  return (
    <div className="rider-table-wrapper">
      <table className="rider-stats result-identity-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Rider</th>
            <th>Country</th>
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
                <ResultRider riderId={row.riderid} name={row.fullname} imageUrl={row.imageurl} />
              </td>
              <td><CountryFlag country={row.country} /></td>
              <td><BrandMark brand={row.brand} /></td>
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
