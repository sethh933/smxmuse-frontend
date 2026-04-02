import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

export function StartStatsTable({ data, sport }) {
  const defaultSortKey = sport === "sx" ? "AvgQualFinish" : "AvgMoto";

const [sortKey, setSortKey] = useState(defaultSortKey);
const [sortDir, setSortDir] = useState("asc");

  const columns = sport === "sx"
  ? [
      { key: "FullName", label: "Rider" },
      { key: "AvgQualFinish", label: "Avg Qual" },
      { key: "Poles", label: "Poles" },
      { key: "HeatWins", label: "Heat Wins" },
      { key: "LCQWins", label: "LCQ Wins" }
    ]
  : [
      { key: "FullName", label: "Rider" },
      { key: "MotoWins", label: "Moto Wins" },
      { key: "MotoPodiums", label: "Moto Podiums" },
      { key: "BestMoto", label: "Best Moto" },
      { key: "AvgMoto", label: "Avg Moto" },
      { key: "Poles", label: "Poles" },
      { key: "QualStarts", label: "Qual Starts" },
      { key: "AvgQual", label: "Avg Qual" },
      { key: "ConsiWins", label: "Consi Wins" }
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
      setSortDir(key === "AvgQualFinish" ? "asc" : "desc");
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
  {sortedData.map(r => (
    <tr key={r.RiderID}>
      {sport === "sx" ? (
        <>
          <td>
  <Link to={`/riders/${r.RiderID}`} className="rider-link">
    {r.FullName}
  </Link>
</td>
          <td>{r.AvgQualFinish?.toFixed(2)}</td>
          <td>{r.Poles}</td>
          <td>{r.HeatWins}</td>
          <td>{r.LCQWins}</td>
        </>
      ) : (
        <>
          <td>
  <Link to={`/riders/${r.RiderID}`} className="rider-link">
    {r.FullName}
  </Link>
</td>
          <td>{r.MotoWins}</td>
          <td>{r.MotoPodiums}</td>
          <td>{r.BestMoto}</td>
          <td>{r.AvgMoto?.toFixed(2)}</td>
          <td>{r.Poles}</td>
          <td>{r.QualStarts}</td>
          <td>{r.AvgQual?.toFixed(2)}</td>
          <td>{r.ConsiWins}</td>
        </>
      )}
    </tr>
  ))}
</tbody>
    </table>
  );
}
