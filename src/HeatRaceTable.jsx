import "./App.css";
import { BrandMark, CountryFlag, ResultRider } from "./ResultIdentity";

export default function HeatRaceTable({ results }) {
  if (!results || results.length === 0) return null;

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
          {results.map((rider) => (
            <tr key={`${rider.fullname}-${rider.result}`}>
              <td className="pos">{rider.result}</td>
              <td className="rider">
                <ResultRider riderId={rider.riderid} name={rider.fullname} imageUrl={rider.imageurl} />
              </td>
              <td><CountryFlag country={rider.country} /></td>
              <td><BrandMark brand={rider.brand} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
