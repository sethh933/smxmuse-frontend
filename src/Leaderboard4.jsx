import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "./api";
import { buildRiderPath } from "./seo";

function Leaderboard4({ sport, classId, selectedRider, setSelectedRider }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const riderRefs = useRef({});
  const containerRef = useRef(null);

  const isWMX = sport === "wmx";
  const title = isWMX ? "Champions" : sport === "supercross" ? "Heat Wins" : "Moto Wins";

  useEffect(() => {
    setLoading(true);

    fetch(apiUrl(`/leaderboard4?class_ids=${classId}`))
      .then((res) => res.json())
      .then((json) => {
        const dataset = json[sport] || [];
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
  <div className={`leaderboard${isWMX ? " leaderboard-champions" : ""}`}>
    <h2>{title}</h2>

    {loading ? (
      <p>Loading...</p>
    ) : (
      <>
        <div className={`leaderboard-table-head ${isWMX ? "leaderboard-champions-head" : "leaderboard-table-head-four"}`}>
          <span>{isWMX ? "Year" : "#"}</span>
          <span>Rider</span>
          <span>{isWMX ? "" : sport === "supercross" ? "Heat Wins" : "Moto Wins"}</span>
        </div>
      <div className="leaderboard-table-wrapper" ref={containerRef}>
        <table className={isWMX ? "leaderboard-champions-table" : "leaderboard-four-table"}>
          <tbody>
            {data.map((rider, idx) => {
              const isHighlighted = selectedRider === rider.riderid;

              const wins =
                sport === "supercross"
                  ? rider.heat_wins
                  : rider.moto_wins;

              return (
                <tr
                  key={isWMX ? `${rider.year}-${rider.riderid}` : rider.riderid}
                  ref={(el) => (riderRefs.current[rider.riderid] = el)}
                  onClick={() =>
                    setSelectedRider(isHighlighted ? null : rider.riderid)
                  }
                  className={isHighlighted ? "highlighted" : ""}
                >
                  <td>
                    {isWMX ? (
                      <Link to={`/season/wmx/${rider.year}/wmx`}>{rider.year}</Link>
                    ) : (
                      idx + 1
                    )}
                  </td>
                  <td>
  <Link to={buildRiderPath(rider.riderid, rider.fullname)}>
    {rider.fullname}
  </Link>
</td>
                  <td>{isWMX ? "🏆" : wins}</td>
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

export default Leaderboard4;
