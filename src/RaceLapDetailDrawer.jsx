function formatValue(value) {
  return value === null || value === undefined || value === "" ? "-" : value;
}

function getRankClass(rank) {
  if (rank === 1) return " rank-gold";
  if (rank === 2) return " rank-silver";
  if (rank === 3) return " rank-bronze";
  return "";
}

function RankMedal({ rank }) {
  if (rank === 1) return <span className="rank-medal">🥇</span>;
  if (rank === 2) return <span className="rank-medal">🥈</span>;
  if (rank === 3) return <span className="rank-medal">🥉</span>;
  return null;
}

function LapRankTrendChart({ laps }) {
  const chartLaps = laps
    .filter((lap) => lap.laptime_rank !== null && lap.laptime_rank !== undefined)
    .map((lap) => ({
      lap: Number(lap.lap),
      rank: Number(lap.laptime_rank),
    }))
    .filter((lap) => Number.isFinite(lap.lap) && Number.isFinite(lap.rank));

  if (chartLaps.length < 2) return null;

  const width = 520;
  const height = 118;
  const padding = { top: 12, right: 18, bottom: 22, left: 28 };
  const minRank = Math.min(...chartLaps.map((lap) => lap.rank));
  const maxRank = Math.max(...chartLaps.map((lap) => lap.rank));
  const rankSpan = Math.max(1, maxRank - minRank);
  const lapSpan = Math.max(1, chartLaps.length - 1);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const points = chartLaps.map((lap, index) => {
    const x = padding.left + (index / lapSpan) * plotWidth;
    const y = padding.top + ((lap.rank - minRank) / rankSpan) * plotHeight;
    return { ...lap, x, y };
  });
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const bestPoint = points.reduce((best, point) =>
    point.rank < best.rank ? point : best
  );

  return (
    <div className="lap-rank-trend">
      <div className="lap-rank-trend-header">
        <span>Lap rank trend</span>
        <small>
          Best R{formatValue(bestPoint.rank)} / Final R{formatValue(lastPoint.rank)}
        </small>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Lap time rank trend by lap">
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          className="lap-rank-trend-axis"
        />
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          className="lap-rank-trend-axis"
        />
        <text x={6} y={padding.top + 4} className="lap-rank-trend-label">
          R{minRank}
        </text>
        <text x={6} y={height - padding.bottom + 4} className="lap-rank-trend-label">
          R{maxRank}
        </text>
        <polyline points={linePoints} className="lap-rank-trend-line" />
        {points.map((point) => (
          <circle
            key={`${point.lap}-${point.rank}`}
            cx={point.x}
            cy={point.y}
            r={point === bestPoint ? 4 : 3}
            className={point === bestPoint ? "lap-rank-trend-dot best" : "lap-rank-trend-dot"}
          />
        ))}
        <text x={firstPoint.x} y={height - 5} className="lap-rank-trend-label">
          L{firstPoint.lap}
        </text>
        <text x={lastPoint.x - 18} y={height - 5} className="lap-rank-trend-label">
          L{lastPoint.lap}
        </text>
      </svg>
    </div>
  );
}

export default function RaceLapDetailDrawer({ detail, isLoading, error }) {
  if (isLoading) {
    return <div className="main-detail-state">Loading lap detail...</div>;
  }

  if (error) {
    return <div className="main-detail-state">Lap detail unavailable.</div>;
  }

  if (!detail || (!detail.laps?.length && !detail.segment_bests?.length)) {
    return <div className="main-detail-state">No lap detail available.</div>;
  }

  return (
    <div className="main-row-detail">
      <div className="main-detail-metrics">
        <div className={`main-detail-summary${getRankClass(detail.average_lap_rank)}`}>
          <RankMedal rank={detail.average_lap_rank} />
          <span>Avg lap</span>
          <strong>{formatValue(detail.average_lap_time)}</strong>
          <small>Rank {formatValue(detail.average_lap_rank)}</small>
        </div>

        <div className={`main-detail-summary${getRankClass(detail.best_lap_rank)}`}>
          <RankMedal rank={detail.best_lap_rank} />
          <span>Best lap</span>
          <strong>{formatValue(detail.best_lap_time)}</strong>
          <small>Rank {formatValue(detail.best_lap_rank)}</small>
        </div>

        <div className={`main-detail-summary${getRankClass(detail.consistency_rank)}`}>
          <RankMedal rank={detail.consistency_rank} />
          <span>Consistency</span>
          <strong className="consistency-score">{formatValue(detail.consistency_score)}</strong>
          <small>Rank {formatValue(detail.consistency_rank)}</small>
        </div>
      </div>

      <div className="main-detail-block">
        <div className="main-detail-label">Best segments</div>
        <div className="segment-best-grid">
          {detail.segment_bests.map((segment) => (
            <div
              className={`segment-best-pill${getRankClass(segment.rank)}`}
              key={segment.segment}
            >
              <RankMedal rank={segment.rank} />
              <span>S{segment.segment}</span>
              <strong>{formatValue(segment.time)}</strong>
              <small>
                L{formatValue(segment.lap)} / R{formatValue(segment.rank)}
              </small>
            </div>
          ))}
        </div>

        <div className="main-detail-label segment-average-label">Average segments</div>
        <div className="segment-average-strip">
          {detail.segment_averages?.map((segment) => (
            <div
              className={`segment-average-pill${getRankClass(segment.rank)}`}
              key={segment.segment}
            >
              <RankMedal rank={segment.rank} />
              <span>S{segment.segment}</span>
              <strong>{formatValue(segment.time)}</strong>
              <small>R{formatValue(segment.rank)}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="main-detail-block">
        <div className="main-detail-label">Lap by lap</div>
        <div className="lap-detail-strip">
          {detail.laps.map((lap) => (
            <div
              className={`lap-detail-pill${getRankClass(lap.laptime_rank)}`}
              key={lap.lap}
            >
              <RankMedal rank={lap.laptime_rank} />
              <span>L{lap.lap}</span>
              <strong>{formatValue(lap.laptime)}</strong>
              <small>
                P{formatValue(lap.position)} / R{formatValue(lap.laptime_rank)}
              </small>
            </div>
          ))}
        </div>
        <LapRankTrendChart laps={detail.laps} />
      </div>
    </div>
  );
}
