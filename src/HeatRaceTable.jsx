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
            <th className="result-country-col">Country</th>
            <th className="result-brand-col">Brand</th>
          </tr>
        </thead>

        <tbody>
          {results.map((rider) => (
            <tr key={`${rider.fullname}-${rider.result}`}>
              <td className="pos">{rider.result}</td>
              <td className="rider">
                <ResultRider riderId={rider.riderid} name={rider.fullname} imageUrl={rider.imageurl}
                  country={rider.country} brand={rider.brand} />
              </td>
              <td className="result-country-col"><CountryFlag country={rider.country} /></td>
              <td className="result-brand-col"><BrandMark brand={rider.brand} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
