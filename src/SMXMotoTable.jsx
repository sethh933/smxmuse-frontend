import React, { Fragment, useState } from "react";
import { apiUrl } from "./api";
import RaceLapDetailDrawer from "./RaceLapDetailDrawer";
import { BrandMark, CountryFlag, ResultRider } from "./ResultIdentity";

function SMXMotoTable({
  data,
  raceId,
  classId,
  moto,
  detailEndpoint,
  startLabel = "Start",
  showHoleshotLine = false,
}) {
  const [expandedKey, setExpandedKey] = useState(null);
  const [detailsByKey, setDetailsByKey] = useState({});
  const canExpandRows = Boolean(
    detailEndpoint &&
    raceId &&
    classId !== null &&
    classId !== undefined &&
    moto
  );
  const columnCount = showHoleshotLine ? 10 : 9;
  const hasNoRaceStatus = (raceStatus) =>
    raceStatus === null || raceStatus === undefined || String(raceStatus).trim() === "";

  function getRowKey(row) {
    return `${row.riderid}-${row.result}-${moto}`;
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
      moto,
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

  return (
    <div className="rider-table-wrapper">
      <table className="rider-stats rider-stats-content-fit result-identity-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Rider</th>
            <th className="result-country-col">Country</th>
            <th className="result-brand-col">Brand</th>
            <th>Interval</th>
            <th>BestLap</th>
            <th>{startLabel}</th>
            {showHoleshotLine && <th>HoleshotLine</th>}
            <th>Holeshot</th>
            <th>RaceStatus</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => {
            const rowKey = getRowKey(row);
            const isExpanded = expandedKey === rowKey;
            const detailState = detailsByKey[rowKey] || {};

            return (
              <Fragment key={rowKey || index}>
                <tr
                  className={canExpandRows ? `main-result-row${isExpanded ? " expanded" : ""}` : ""}
                  onClick={() => toggleRider(row)}
                >
                  <td>{row.result}</td>
                  <td>
                    <ResultRider
                      riderId={row.riderid}
                      name={row.fullname}
                      imageUrl={row.imageurl}
                      country={row.country}
                      brand={row.brand}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </td>
                  <td className="result-country-col"><CountryFlag country={row.country} /></td>
                  <td className="result-brand-col"><BrandMark brand={row.brand} /></td>
                  <td>{row.interval ?? "-"}</td>
                  <td>{row.bestlap ?? "-"}</td>
                  <td>{row.start ?? "-"}</td>
                  {showHoleshotLine && <td>{row.holeshotline ?? "-"}</td>}
                  <td className="holeshot">{row.holeshot === 1 ? "\u25CF" : ""}</td>
                  <td className={hasNoRaceStatus(row.racestatus) ? "holeshot" : ""}>
                    {hasNoRaceStatus(row.racestatus) ? "\u25CF" : row.racestatus}
                  </td>
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

export default SMXMotoTable;
