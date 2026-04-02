import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

export function MainStatsTable({ data, sport }) {
  const [sortKey, setSortKey] = useState("Points");
  const [sortDir, setSortDir] = useState("desc");

  const columns = sport === "sx"
  ? [
      { key: "FullName", label: "Rider" },
      { key: "Wins", label: "Wins" },
      { key: "Podiums", label: "Podiums" },
      { key: "Top5s", label: "Top 5" },
      { key: "Top10s", label: "Top 10" },
      { key: "BestFinish", label: "Best" },
      { key: "AvgFinish", label: "Avg Finish" },
      { key: "MainsMade", label: "Starts" },
      { key: "Holeshots", label: "Holeshots" },
      { key: "AvgStartPosition", label: "Avg Start" },
      { key: "Points", label: "Points" }
    ]
  : [
      { key: "FullName", label: "Rider" },
      { key: "Wins", label: "Wins" },
      { key: "Podiums", label: "Podiums" },
      { key: "Top5", label: "Top 5" },
      { key: "Top10", label: "Top 10" },
      { key: "BestOverall", label: "Best" },
      { key: "AvgOverall", label: "Avg Overall" },
      { key: "Starts", label: "Starts" },
      { key: "Holeshots", label: "Holeshots" },
      { key: "AvgStart", label: "Avg Start" },
      { key: "Points", label: "Points" }
    ];

  const sortedData = useMemo(() => {
    if (!data) return [];

    return [...data]
      .sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (typeof aVal === "string") {
          return sortDir === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      })
  }, [data, sortKey, sortDir]);

  function handleSort(key) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function sortIndicator(key) {
    if (key !== sortKey) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  return (
    <table className="stats-table">
      <thead>
        <tr>
          {columns.map(col => (
            <th
              key={col.key}
              onClick={() => handleSort(col.key)}
              style={{ cursor: "pointer" }}
            >
              {col.label}
              {sortIndicator(col.key)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map(row => (
          <tr key={row.RiderID}>
            {columns.map(col => (
              <td key={col.key}>
  {col.key === "FullName" ? (
    <Link to={`/rider/${row.RiderID}`} className="rider-link">
      {row.FullName}
    </Link>
  ) : (
    row[col.key]
  )}
</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
