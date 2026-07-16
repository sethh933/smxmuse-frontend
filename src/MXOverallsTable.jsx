import React from "react";
import { BrandMark, CountryFlag, ResultRider } from "./ResultIdentity";

function MXOverallsTable({ data }) {
  return (
    <div className="rider-table-wrapper">
      <table className="rider-stats result-identity-table result-overalls-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Rider</th>
            <th className="overall-country-col">
              <span className="overall-desktop-label">Country</span>
              <span className="overall-mobile-label">Nat.</span>
            </th>
            <th className="overall-brand-col">
              <span className="overall-desktop-label">Brand</span>
              <span className="overall-mobile-label">Bike</span>
            </th>
            <th className="overall-moto-col">M1</th>
            <th className="overall-moto-col">M2</th>
            <th>Laps Led</th>
            <th>
              <span className="overall-desktop-label">Holeshot</span>
              <span className="overall-mobile-label">HS</span>
            </th>
            <th>M1 Start</th>
            <th>M2 Start</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.result}</td>
              <td>
                <div className="overall-rider-cell">
                  <ResultRider riderId={row.riderid} name={row.fullname} imageUrl={row.imageurl}
                    country={row.country} brand={row.brand} />
                </div>
              </td>
              <td className="overall-country-col"><CountryFlag country={row.country} /></td>
              <td className="overall-brand-col"><BrandMark brand={row.brand} /></td>
              <td className="overall-moto-col">{row.moto1}</td>
              <td className="overall-moto-col">{row.moto2}</td>
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
