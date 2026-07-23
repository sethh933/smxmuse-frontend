import React, { Fragment, useState } from "react";
import { apiUrl } from "./api";
import QualifyingDetailDrawer from "./QualifyingDetailDrawer";
import { BrandMark, CountryFlag, ResultRider } from "./ResultIdentity";

function MXQualifyingTable({ data, raceId, classId, sportId, detailEndpoint }) {
  const [expandedKey, setExpandedKey] = useState(null);
  const [detailsByKey, setDetailsByKey] = useState({});
  const resolvedDetailEndpoint =
    detailEndpoint || (sportId === 2 ? "/api/race/mx-qualifying-rider-details" : null);
  const canExpandRows = Boolean(
    resolvedDetailEndpoint &&
    raceId &&
    classId !== null &&
    classId !== undefined
  );

  function getRowKey(row) {
    return `${row.riderid}-${row.result}-qual`;
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

    fetch(apiUrl(`${resolvedDetailEndpoint}?${params.toString()}`))
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load qualifying detail");
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
            <th className="pos">Pos</th>
            <th className="rider">Rider</th>
            <th className="result-country-col">Country</th>
            <th className="result-brand-col">Brand</th>
            <th>Best Lap</th>
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
                  <td className="pos">{row.result}</td>
                  <td className="rider">
                    <ResultRider
                      riderId={row.riderid} name={row.fullname} imageUrl={row.imageurl}
                      country={row.country} brand={row.brand}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </td>
                  <td className="result-country-col"><CountryFlag country={row.country} /></td>
                  <td className="result-brand-col"><BrandMark brand={row.brand} /></td>
                  <td>{row.best_lap}</td>
                </tr>
                {isExpanded && (
                  <tr className="main-detail-row">
                    <td colSpan={5}>
                      <QualifyingDetailDrawer
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

export default MXQualifyingTable;
