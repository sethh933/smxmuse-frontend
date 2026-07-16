import "./App.css";
import { Fragment, useState } from "react";
import { apiUrl } from "./api";
import QualifyingDetailDrawer from "./QualifyingDetailDrawer";
import { BrandMark, CountryFlag, ResultRider } from "./ResultIdentity";

export default function QualifyingTable({ results, raceId, classId }) {
  const [expandedKey, setExpandedKey] = useState(null);
  const [detailsByKey, setDetailsByKey] = useState({});
  const canExpandRows = Boolean(raceId && classId);

  if (!results || results.length === 0) return null;

  function getRowKey(rider) {
    return `${rider.riderid}-${rider.result}-sx-qual`;
  }

  function toggleRider(rider) {
    if (!canExpandRows) return;

    const rowKey = getRowKey(rider);
    setExpandedKey((current) => (current === rowKey ? null : rowKey));

    if (detailsByKey[rowKey]) return;

    setDetailsByKey((current) => ({
      ...current,
      [rowKey]: { isLoading: true, error: null, detail: null },
    }));

    const params = new URLSearchParams({
      raceid: raceId,
      classid: classId,
      riderid: rider.riderid,
    });

    fetch(apiUrl(`/api/race/sx-qualifying-rider-details?${params.toString()}`))
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
            <th>Country</th>
            <th>Best Lap</th>
            <th>Brand</th>
            
          </tr>
        </thead>

        <tbody>
          {results.map((rider) => {
            const rowKey = getRowKey(rider);
            const isExpanded = expandedKey === rowKey;
            const detailState = detailsByKey[rowKey] || {};

            return (
              <Fragment key={rowKey}>
                <tr
                  className={canExpandRows ? `main-result-row${isExpanded ? " expanded" : ""}` : ""}
                  onClick={() => toggleRider(rider)}
                >
                  <td className="pos">{rider.result}</td>
                  <td className="rider">
                    <ResultRider
                      riderId={rider.riderid} name={rider.fullname} imageUrl={rider.imageurl}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </td>
                  <td><CountryFlag country={rider.country} /></td>
                  <td>{rider.best_lap}</td>
                  <td><BrandMark brand={rider.brand} /></td>
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
