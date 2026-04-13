import "./App.css";
import { Link } from "react-router-dom";
import { buildRiderPath } from "./seo";

export default function HeatRaceTable({ results }) {
  if (!results || results.length === 0) return null;

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
          {results.map((rider) => (
            <tr key={`${rider.fullname}-${rider.result}`}>
              <td className="pos">{rider.result}</td>
              <td className="rider">
  <Link to={buildRiderPath(rider.riderid, rider.fullname)}>
    {rider.fullname}
  </Link>
</td>
              <td>{rider.brand}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
