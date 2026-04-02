import "./app.css";
import { Link } from "react-router-dom";

export default function QualifyingTable({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="rider-table-wrapper">
  <table className="rider-stats">
        <thead>
          <tr>
            <th className="pos">Pos</th>
            <th className="rider">Rider</th>
            <th>Best Lap</th>
            <th>Brand</th>
            
          </tr>
        </thead>

        <tbody>
          {results.map((rider) => (
            <tr key={`${rider.fullname}-${rider.result}`}>
              <td className="pos">{rider.result}</td>
              <td className="rider">
  <Link to={`/rider/${rider.riderid}`}>
    {rider.fullname}
  </Link>
</td>
<td>{rider.best_lap}</td>
              <td>{rider.brand}</td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
