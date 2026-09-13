import React, { Fragment, useState } from "react";
import { apiUrl } from "./api";
import RaceLapDetailDrawer from "./RaceLapDetailDrawer";
import { BrandMark, CountryFlag, ResultRider } from "./ResultIdentity";

function MXConsiTable({ data, raceId, classId, detailEndpoint }) {
  const [expandedKey, setExpandedKey] = useState(null);
  const [detailsByKey, setDetailsByKey] = useState({});
  const canExpandRows = Boolean(
    detailEndpoint &&
    raceId &&
    classId !== null &&
    classId !== undefined
  );

  function getRowKey(row) {
    return `${row.riderid}-${row.result}-lcq`;
  }

  function toggleRider(row) {
    if (!canExpandRows) return;

    const rowKey = getRowKey(row);
    setExpandedKey((current) => (current === rowKey ? null : rowKey));

    if (detailsByKey[rowKey]) return;

    setDetailsByKey((current) => ({
      ...current,
      [rowKey]: { isLoading: true, error: null, detail: null },
    }));

    const params = new URLSearchParams({
      raceid: raceId,
      classid: classId,
      riderid: row.riderid,
    });

    fetch(apiUrl(`${detailEndpoint}?${params.toString()}`))
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load lap detail");
        return res.json();
      })
      .then((detail) => {
        setDetailsByKey((current) => ({
          ...current,
          [rowKey]: { isLoading: false, error: null, detail },
        }));
      })
      .catch((error) => {
        console.error(error);
        setDetailsByKey((current) => ({
          ...current,
          [rowKey]: { isLoading: false, error, detail: null },
        }));
      });
  }

  const hasValue = (key) => data.some(
    (row) => row[key] !== null && row[key] !== undefined
  );
  const showInterval = hasValue("interval");
  const showBestLap = hasValue("bestlap");
  const showLap1Pos = hasValue("start");
  const showHoleshotLine = hasValue("holeshotline");
  const showHoleshot = hasValue("holeshot");
  const showRaceStatus = hasValue("racestatus");

  const columnCount = 4 + [showInterval, showBestLap, showLap1Pos, showHoleshotLine, showHoleshot, showRaceStatus].filter(Boolean).length;

  return (
    <div className="rider-table-wrapper">
    <table className="rider-stats rider-stats-content-fit result-identity-table">
        <thead>
          <tr>
            <th className="pos">Pos</th>
            <th className="rider">Rider</th>
            <th className="result-country-col">Country</th>
            <th className="result-brand-col">Brand</th>
            {showInterval && <th>Interval</th>}
            {showBestLap && <th>BestLap</th>}
            {showLap1Pos && <th>Lap1Pos</th>}
            {showHoleshotLine && <th>HoleshotLine</th>}
            {showHoleshot && <th>Holeshot</th>}
            {showRaceStatus && <th>RaceStatus</th>}
          </tr>
        </thead>

        <tbody>
  {data.map((row) => {
    const rowKey = getRowKey(row);
    const isExpanded = expandedKey === rowKey;
    const detailState = detailsByKey[rowKey] || {};
    return (
    <Fragment key={rowKey}>
    <tr
      className={canExpandRows ? `main-result-row${isExpanded ? " expanded" : ""}` : ""}
      onClick={() => toggleRider(row)}
    >
      <td className="pos">{row.result}</td>
      <td className="rider">
        <ResultRider riderId={row.riderid} name={row.fullname} imageUrl={row.imageurl}
          country={row.country} brand={row.brand} onClick={(event) => event.stopPropagation()} />
      </td>
      <td className="result-country-col"><CountryFlag country={row.country} /></td>
      <td className="result-brand-col"><BrandMark brand={row.brand} /></td>
      {showInterval && <td>{row.interval ?? "-"}</td>}
      {showBestLap && <td>{row.bestlap ?? "-"}</td>}
      {showLap1Pos && <td>{row.start ?? "-"}</td>}
      {showHoleshotLine && <td>{row.holeshotline ?? "-"}</td>}
      {showHoleshot && <td className="holeshot">{Number(row.holeshot) === 1 ? "\u25CF" : ""}</td>}
      {showRaceStatus && <td>{row.racestatus ?? "-"}</td>}
    </tr>
    {isExpanded && (
      <tr className="main-detail-row">
        <td colSpan={columnCount}>
          <RaceLapDetailDrawer
            detail={detailState.detail}
            isLoading={detailState.isLoading}
            error={detailState.error}
          />
        </td>
      </tr>
    )}
    </Fragment>
    );
  })}
</tbody>
      </table>
    </div>
  );
}

export default MXConsiTable;
