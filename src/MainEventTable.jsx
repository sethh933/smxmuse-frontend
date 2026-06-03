import "./App.css";
import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "./api";
import RaceLapDetailDrawer from "./RaceLapDetailDrawer";
import { buildRiderPath } from "./seo";

export default function MainEventTable({
  results,
  raceId,
  classId,
  raceYear,
  sportId,
  tripleCrownId,
  tcMain = null,
  enableLapDetails = true,
}) {
  const [expandedKey, setExpandedKey] = useState(null);
  const [detailsByKey, setDetailsByKey] = useState({});

  if (!results || results.length === 0) {
    return <div className="results-empty">No results available</div>;
  }

  const isTripleCrown = sportId === 1 && tripleCrownId === 1;
  const canExpandRows = enableLapDetails && sportId === 1 && raceId && classId && !isTripleCrown;
  const showDetailedRaceColumns = !(sportId === 1 && raceYear < 2003);
  const showHsPos = sportId === 1 && raceYear >= 2026;
  const columnCount =
    3 +
    (isTripleCrown ? 3 : showDetailedRaceColumns ? 3 : 0) +
    1 +
    (!isTripleCrown && showHsPos ? 1 : 0) +
    (!isTripleCrown && showDetailedRaceColumns ? 1 : 0);

  function getRowKey(rider) {
    return `${rider.riderid}-${rider.result}-${tcMain ?? "main"}`;
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

    if (tcMain !== null && tcMain !== undefined) {
      params.set("tcmain", tcMain);
    }

    fetch(apiUrl(`/api/race/main-event-rider-details?${params.toString()}`))
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
      <table className="rider-stats">
        <thead>
          <tr>
            <th className="sticky-col pos">Pos</th>
            <th className="sticky-col rider">Rider</th>
            <th>Brand</th>
            {isTripleCrown ? <th>Main 1</th> : showDetailedRaceColumns && <th>Interval</th>}
            {isTripleCrown ? <th>Main 2</th> : showDetailedRaceColumns && <th>Best Lap</th>}
            {isTripleCrown ? <th>Main 3</th> : showDetailedRaceColumns && <th>Laps Led</th>}
            <th>HS</th>
            {!isTripleCrown && showHsPos && <th>HS Pos</th>}
            {!isTripleCrown && showDetailedRaceColumns && <th>Lap 1 Pos</th>}
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
                    <Link
                      to={buildRiderPath(rider.riderid, rider.fullname)}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {rider.fullname}
                    </Link>
                  </td>
                  <td>{rider.brand}</td>
                  {isTripleCrown ? <td>{rider.tc1 ?? ""}</td> : showDetailedRaceColumns && <td>{rider.interval}</td>}
                  {isTripleCrown ? <td>{rider.tc2 ?? ""}</td> : showDetailedRaceColumns && <td>{rider.bestlap}</td>}
                  {isTripleCrown ? <td>{rider.tc3 ?? ""}</td> : showDetailedRaceColumns && <td>{rider.lapsled === null ? "" : rider.lapsled}</td>}
                  <td className="holeshot">{rider.holeshot === 1 ? "\u25CF" : ""}</td>
                  {!isTripleCrown && showHsPos && <td>{rider.holeshotpos ?? ""}</td>}
                  {!isTripleCrown && showDetailedRaceColumns && <td>{rider.Lap1Pos}</td>}
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
