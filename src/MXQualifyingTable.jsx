import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "./api";
import QualifyingDetailDrawer from "./QualifyingDetailDrawer";
import { buildRiderPath } from "./seo";

function MXQualifyingTable({ data, raceId, classId, sportId }) {
  const [expandedKey, setExpandedKey] = useState(null);
  const [detailsByKey, setDetailsByKey] = useState({});
  const canExpandRows = sportId === 2 && raceId && classId;

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

    fetch(apiUrl(`/api/race/mx-qualifying-rider-details?${params.toString()}`))
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
    <table className="rider-stats rider-stats-content-fit">
        <thead>
          <tr>
            <th className="pos">Pos</th>
            <th className="rider">Rider</th>
            <th>Brand</th>
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
                    <Link
                      to={buildRiderPath(row.riderid, row.fullname)}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {row.fullname}
                    </Link>
                  </td>
                  <td>{row.brand}</td>
                  <td>{row.best_lap}</td>
                </tr>
                {isExpanded && (
                  <tr className="main-detail-row">
                    <td colSpan={4}>
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
