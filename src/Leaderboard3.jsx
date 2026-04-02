import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

function Leaderboard3({ sport, classId, selectedRider, setSelectedRider }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const riderRefs = useRef({});

  const title = sport === "motocross" ? "Overall Starts" : "Main Event Starts";

  useEffect(() => {
    setLoading(true);

    fetch(`http://127.0.0.1:8000/leaderboard3?class_ids=${classId}`)
      .then((res) => res.json())
      .then((json) => {
        const dataset = sport === "motocross" ? json.motocross : json.supercross;
        setData(dataset);
        setLoading(false);
      });
  }, [classId, sport]);

  useEffect(() => {
  if (selectedRider && riderRefs.current[selectedRider]) {
    riderRefs.current[selectedRider].scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}, [selectedRider]);

  return (
  <div className="leaderboard">
    <h2>{title}</h2>

    {loading ? (
      <p>Loading...</p>
    ) : (
      <div className="leaderboard-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Rider</th>
              <th>Starts</th>
            </tr>
          </thead>

          <tbody>
            {data.map((rider, idx) => {
              const isHighlighted = selectedRider === rider.riderid;

              return (
                <tr
                  key={rider.riderid}
                  ref={(el) => (riderRefs.current[rider.riderid] = el)}
                  onClick={() =>
                    setSelectedRider(isHighlighted ? null : rider.riderid)
                  }
                  className={isHighlighted ? "highlighted" : ""}
                >
                  <td>{idx + 1}</td>
                  <td>
  <Link to={`/rider/${rider.riderid}`} className="leaderboard-link">
    {rider.fullname}
  </Link>
</td>
                  <td>{rider.starts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
  );
}

export default Leaderboard3;