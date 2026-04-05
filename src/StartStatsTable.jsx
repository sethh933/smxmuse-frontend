import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";

export function StartStatsTable({ data, sport, year }) {
  const getDisplayName = (row) => row.DisplayFullName || row.FullName;
  const showSupercrossQualStats = sport !== "sx" || year >= 2007;
  const defaultSortKey = sport === "sx"
    ? showSupercrossQualStats
      ? "AvgQualFinish"
      : "HeatWins"
    : "AvgMoto";
  const defaultSortDir =
    defaultSortKey === "AvgQualFinish" || defaultSortKey === "AvgMoto"
      ? "asc"
      : "desc";

const [sortKey, setSortKey] = useState(defaultSortKey);
const [sortDir, setSortDir] = useState(defaultSortDir);

  useEffect(() => {
    setSortKey(defaultSortKey);
    setSortDir(defaultSortDir);
  }, [defaultSortKey, defaultSortDir]);

  const columns = sport === "sx"
  ? [
      { key: "FullName", label: "Rider" },
      ...(showSupercrossQualStats
        ? [
            { key: "AvgQualFinish", label: "Avg Qual" },
            { key: "Poles", label: "Poles" }
          ]
        : []),
      { key: "HeatWins", label: "Heat Wins" },
      { key: "BestHeat", label: "Best Heat" },
      { key: "LCQWins", label: "LCQ Wins" },
      { key: "BestLCQ", label: "Best LCQ" }
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
        const aVal = sortKey === "FullName" ? getDisplayName(a) : a[sortKey];
        const bVal = sortKey === "FullName" ? getDisplayName(b) : b[sortKey];

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
      setSortDir(key === "AvgQualFinish" || key === "AvgMoto" ? "asc" : "desc");
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
              className={col.key === "FullName" ? "rider-col" : undefined}
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
          <td className="rider-col">
  <Link to={`/rider/${r.RiderID}`}>
    {getDisplayName(r)}
  </Link>
</td>
          {showSupercrossQualStats && <td>{r.AvgQualFinish?.toFixed(2)}</td>}
          {showSupercrossQualStats && <td>{r.Poles}</td>}
          <td>{r.HeatWins}</td>
          <td>{r.BestHeat ?? "-"}</td>
          <td>{r.LCQWins}</td>
          <td>{r.BestLCQ ?? "-"}</td>
        </>
      ) : (
        <>
          <td className="rider-col">
  <Link to={`/rider/${r.RiderID}`}>
    {getDisplayName(r)}
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
