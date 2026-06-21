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

function QualifyingSessionCard({ session }) {
  return (
    <div className="qual-session-card">
      <div className="qual-session-heading">
        <strong>Group {formatValue(session.group)} Session {formatValue(session.session)}</strong>
      </div>

      <div className={`qual-lap-pill${getRankClass(session.fastest_lap_rank)}`}>
        <RankMedal rank={session.fastest_lap_rank} />
        <span>Fastest lap</span>
        <strong>{formatValue(session.fastest_lap_time)}</strong>
        <small>
          L{formatValue(session.fastest_lap)} / R{formatValue(session.fastest_lap_rank)}
        </small>
      </div>

      <div className={`qual-lap-pill${getRankClass(session.second_fastest_lap_rank)}`}>
        <RankMedal rank={session.second_fastest_lap_rank} />
        <span>2nd fastest</span>
        <strong>{formatValue(session.second_fastest_lap_time)}</strong>
        <small>
          L{formatValue(session.second_fastest_lap)} / R{formatValue(session.second_fastest_lap_rank)}
        </small>
      </div>

      {session.segment_bests?.length > 0 && (
        <div className="main-detail-block qual-segment-block">
          <div className="main-detail-label">Best segments</div>
          <div className="segment-best-grid">
            {session.segment_bests.map((segment) => (
              <div
                className={`segment-best-pill${getRankClass(segment.rank)}`}
                key={`${session.group}-${session.session}-${segment.segment}`}
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
        </div>
      )}
    </div>
  );
}

export default function QualifyingDetailDrawer({ detail, isLoading, error }) {
  if (isLoading) {
    return <div className="main-detail-state">Loading qualifying detail...</div>;
  }

  if (error) {
    return <div className="main-detail-state">Qualifying detail unavailable.</div>;
  }

  if (!detail || !detail.sessions?.length) {
    return <div className="main-detail-state">No qualifying detail available.</div>;
  }

  return (
    <div className="qual-row-detail">
      {detail.sessions.map((session) => (
        <QualifyingSessionCard
          key={`${session.group}-${session.session}`}
          session={session}
        />
      ))}
    </div>
  );
}
