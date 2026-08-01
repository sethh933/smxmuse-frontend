import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import { WinsRaceBar } from "./WinsRaceBar";

const INTRO_FRAMES = 30;
const FIRST_HOLD_FRAMES = 60;

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
    metaLabelFontSize: 16,
    metaFontSize: 46
  },
  tiktokVertical: {
    barTop: 338,
    barGap: 116,
    headerTop: 260,
    headerLeft: 62,
    headerRight: 74,
    headerAlign: "center",
    titleFontSize: 29,
    titleLogoWidth: 210,
    titleGap: 16,
    metaLabelFontSize: 16,
    metaFontSize: 46
  }
};

function mapByKey(items) {
  return new Map(items.map((item) => [item.riderKey, item]));
}

function winsMap(event) {
  return new Map(event.standings.map((standing) => [standing.riderKey, standing.wins]));
}

function rankMap(event) {
  return new Map(event.standings.map((standing, index) => [standing.riderKey, index]));
}

function getValue(map, key, fallback) {
  return map.get(key) ?? fallback;
}

export function SxWinsBarRace({ data, layout = "instagramSafeVertical" }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const settings = LAYOUTS[layout] || LAYOUTS.instagramSafeVertical;
  const riderMap = mapByKey(data.riders);
  const events = data.events;
  const activeFrame = Math.max(0, frame - INTRO_FRAMES - FIRST_HOLD_FRAMES);
  const playableFrames = Math.max(1, durationInFrames - INTRO_FRAMES - FIRST_HOLD_FRAMES - 1);
  const eventProgress = interpolate(activeFrame, [0, playableFrames], [0, events.length - 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const segment = Math.min(Math.floor(eventProgress), events.length - 1);
  const nextSegment = Math.min(segment + 1, events.length - 1);
  const segmentProgress = eventProgress - segment;
  const currentEvent = events[segment];
  const nextEvent = events[nextSegment];
  const currentWins = winsMap(currentEvent);
  const nextWins = winsMap(nextEvent);
  const currentRanks = rankMap(currentEvent);
  const nextRanks = rankMap(nextEvent);
  const easedProgress = Math.min(
    spring({
      frame: segmentProgress * 18,
      fps,
      config: {
        damping: 26,
        stiffness: 115,
        mass: 0.72
      },
      durationInFrames: 18
    }),
    1
  );
  const visibleEvent = segmentProgress < 0.5 ? currentEvent : nextEvent;
  const visibleRanks = segmentProgress < 0.5 ? currentRanks : nextRanks;
  const visibleKeys = visibleEvent.standings.slice(0, 10).map((standing) => standing.riderKey);
  const visibleYear = Math.round(interpolate(segmentProgress, [0, 1], [currentEvent.year, nextEvent.year]));

  const rows = visibleKeys
    .map((riderKey, index) => {
      const rider = riderMap.get(riderKey);
      const previousRank = getValue(currentRanks, riderKey, 10);
      const nextRank = getValue(nextRanks, riderKey, index);
      const previousWins = getValue(currentWins, riderKey, 0);
      const nextWinTotal = getValue(nextWins, riderKey, previousWins);

      return {
        rider,
        riderKey,
        rank: getValue(visibleRanks, riderKey, index) + 1,
        wins: interpolate(easedProgress, [0, 1], [previousWins, nextWinTotal]),
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

  const maxWins = Math.max(...rows.map((row) => row.wins), 1);
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
          <span style={{ fontSize: settings.metaLabelFontSize, fontWeight: 700 }}>Year</span>
          <span style={{ fontSize: settings.metaFontSize, fontWeight: 900, color: "#ffffff" }}>
            {visibleYear}
          </span>
        </div>
      </div>

      <div style={{ opacity: introOpacity }}>
        {rows.map((row) => (
          <WinsRaceBar
            key={row.riderKey}
            rider={row.rider}
            wins={row.wins}
            maxWins={maxWins}
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
