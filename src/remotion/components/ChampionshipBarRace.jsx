import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import { RaceBar } from "./RaceBar";

const ROUND_FRAMES = 90;
const INTRO_FRAMES = 30;
const FIRST_ROUND_HOLD_FRAMES = 60;

const LAYOUTS = {
  instagramSafeVertical: {
    barTop: 360,
    barGap: 118,
    headerTop: 246,
    headerLeft: 50,
    headerRight: 106,
    headerAlign: "center",
    titleFontSize: 29,
    titleLogoWidth: 210,
    titleGap: 16,
    roundLabelFontSize: 16,
    roundFontSize: 46
  }
};

function getRiderMap(riders) {
  return new Map(riders.map((rider) => [rider.riderKey, rider]));
}

function getPointsMap(round) {
  return new Map(round.standings.map((standing) => [standing.riderKey, standing.points]));
}

function getRankMap(round) {
  return new Map(round.standings.map((standing, index) => [standing.riderKey, index]));
}

function getPointValue(pointsMap, riderKey) {
  return pointsMap.get(riderKey) ?? 0;
}

function getRankValue(rankMap, riderKey, fallbackRank) {
  return rankMap.get(riderKey) ?? fallbackRank;
}

export function ChampionshipBarRace({ data, layout = "instagramSafeVertical" }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const settings = LAYOUTS[layout] || LAYOUTS.instagramSafeVertical;
  const riderMap = getRiderMap(data.riders);
  const rounds = data.rounds;
  const activeFrame = Math.max(0, frame - INTRO_FRAMES - FIRST_ROUND_HOLD_FRAMES);
  const rawSegment = Math.floor(activeFrame / ROUND_FRAMES);
  const segment = Math.min(rawSegment, rounds.length - 1);
  const nextSegment = Math.min(segment + 1, rounds.length - 1);
  const segmentFrame = activeFrame - segment * ROUND_FRAMES;
  const progress = spring({
    frame: segmentFrame,
    fps,
    config: {
      damping: 28,
      stiffness: 118,
      mass: 0.72
    },
    durationInFrames: ROUND_FRAMES
  });
  const easedProgress = Math.min(progress, 1);
  const currentRound = rounds[segment];
  const nextRound = rounds[nextSegment];
  const currentPoints = getPointsMap(currentRound);
  const nextPoints = getPointsMap(nextRound);
  const currentRanks = getRankMap(currentRound);
  const nextRanks = getRankMap(nextRound);
  const visibleRound = easedProgress < 0.5 ? currentRound : nextRound;
  const visibleRanks = easedProgress < 0.5 ? currentRanks : nextRanks;
  const visibleKeys = visibleRound.standings.slice(0, 10).map((standing) => standing.riderKey);
  const currentRoundLabel = Math.round(
    interpolate(easedProgress, [0, 1], [currentRound.round, nextRound.round])
  );

  const rows = visibleKeys
    .map((riderKey, index) => {
      const rider = riderMap.get(riderKey);
      const previousRank = getRankValue(currentRanks, riderKey, 10);
      const nextRank = getRankValue(nextRanks, riderKey, index);
      const previousPoints = getPointValue(currentPoints, riderKey);
      const nextPointTotal = getPointValue(nextPoints, riderKey);

      return {
        rider,
        riderKey,
        rank: getRankValue(visibleRanks, riderKey, index) + 1,
        points: interpolate(easedProgress, [0, 1], [previousPoints, nextPointTotal]),
        y: interpolate(easedProgress, [0, 1], [
          settings.barTop + previousRank * settings.barGap,
          settings.barTop + nextRank * settings.barGap
        ]),
        opacity: interpolate(easedProgress, [0, 0.18, 1], [
          previousRank > 9 ? 0 : 1,
          1,
          1
        ])
      };
    })
    .filter((row) => row.rider);

  const maxPoints = Math.max(...rows.map((row) => row.points), 1);
  const introOpacity = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #171a20 0%, #101216 58%, #0d0f13 100%)",
        color: "#f7f9fc",
        fontFamily:
          "Futura, Futura PT, Avenir Next, Avenir, Trebuchet MS, ui-sans-serif, system-ui, sans-serif",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, rgba(255,255,255,0.035) 0, rgba(255,255,255,0) 38%)"
        }}
      />

      <div
        style={{
          position: "absolute",
          top: settings.headerTop,
          left: settings.headerLeft,
          right: settings.headerRight,
          display: "flex",
          alignItems: settings.headerAlign,
          justifyContent: "space-between",
          opacity: introOpacity
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: settings.titleGap,
            minWidth: 0
          }}
        >
          <div
            style={{
              fontSize: settings.titleFontSize,
              fontWeight: 850,
              letterSpacing: 0,
              lineHeight: 1.05,
              whiteSpace: "nowrap"
            }}
          >
            {data.title}
          </div>
          <Img
            src={staticFile("OneLineTransparent-cropped.png")}
            style={{
              width: settings.titleLogoWidth,
              height: "auto",
              objectFit: "contain",
              display: "block",
              flex: "0 0 auto"
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            color: "rgba(235, 240, 247, 0.78)"
          }}
        >
          <span style={{ fontSize: settings.roundLabelFontSize, fontWeight: 700 }}>Round</span>
          <span style={{ fontSize: settings.roundFontSize, fontWeight: 900, color: "#ffffff" }}>
            {currentRoundLabel}
          </span>
        </div>
      </div>

      <div style={{ opacity: introOpacity }}>
        {rows.map((row) => (
          <RaceBar
            key={row.riderKey}
            rider={row.rider}
            points={row.points}
            maxPoints={maxPoints}
            y={row.y}
            opacity={row.opacity}
            rank={row.rank}
            layout={layout}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
}
