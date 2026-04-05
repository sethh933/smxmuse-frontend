import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

function Leaderboard2({ sport, classId, selectedRider, setSelectedRider }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const riderRefs = useRef({});
  const containerRef = useRef(null);

  const title = sport === "motocross" ? "Overall Podiums" : "Main Event Podiums";

  useEffect(() => {
    setLoading(true);

    fetch(`http://127.0.0.1:8000/leaderboard2?class_ids=${classId}`)
      .then((res) => res.json())
      .then((json) => {
        const dataset = sport === "motocross" ? json.motocross : json.supercross;
        setData(dataset);
        setLoading(false);
      });
  }, [classId, sport]);

  useEffect(() => {
    if (!selectedRider || !containerRef.current || !riderRefs.current[selectedRider]) return;

    const row = riderRefs.current[selectedRider];
    const container = containerRef.current;

    const rowTop = row.offsetTop;
    const rowHeight = row.offsetHeight;
    const containerHeight = container.clientHeight;

    const targetScrollTop = rowTop - containerHeight / 2 + rowHeight / 2;

    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: "smooth",
    });
  }, [selectedRider, data]);

  return (
  <div className="leaderboard">
    <h2>{title}</h2>

    {loading ? (
      <p>Loading...</p>
    ) : (
      <>
        <div className="leaderboard-table-head">
          <span>#</span>
          <span>Rider</span>
          <span>Podiums</span>
        </div>
      <div className="leaderboard-table-wrapper" ref={containerRef}>
        <table>
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
  <Link
    to={`/rider/${rider.riderid}`}
    onClick={(e) => e.stopPropagation()}
  >
    {rider.fullname}
  </Link>
</td>
                  <td>{rider.podiums}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </>
    )}
  </div>
  );
}

export default Leaderboard2;
