import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import { CountryFlag } from "./CountryFlag";
import { ManufacturerLogo } from "./ManufacturerLogo";
import { RiderAvatar } from "./RiderAvatar";

const INTRO_FRAMES = 30;
const FIRST_HOLD_FRAMES = 60;
const LEADER_COUNT = 8;

const LAYOUTS = {
  landscape: {
    headerTop: 78,
    headerLeft: 104,
    headerRight: 112,
    titleFontSize: 54,
    titleLogoWidth: 300,
    titleGap: 24,
    metaLabelFontSize: 22,
    metaFontSize: 64,
    pieLeft: 120,
    pieTop: 205,
    pieSize: 720,
    listLeft: 940,
    listTop: 224,
    rowHeight: 82,
    rowGap: 14,
    rowWidth: 820,
    avatarSize: 62,
    flagSize: 26,
    nameFontSize: 28,
    lapsFontSize: 38
  }
};

function getRiderMap(riders) {
  return new Map(riders.map((rider) => [rider.riderKey, rider]));
}

function valueMap(snapshot) {
  return new Map(snapshot.standings.map((standing) => [standing.riderKey, standing.lapsLed]));
}

function ease(progress) {
  return progress * progress * (3 - 2 * progress);
}

function polarToCartesian(cx, cy, radius, angle) {
  const radians = (angle - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function describeDonutSlice(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
  if (endAngle - startAngle >= 359.99) {
    endAngle = startAngle + 359.99;
  }

  const outerStart = polarToCartesian(cx, cy, outerRadius, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    "Z"
  ].join(" ");
}

function textColor(color) {
  if (color === "#f2f6fb" || color === "#f6d928" || color === "#d8e600") {
    return "#10131a";
  }

  return "#f7f9fc";
}

function rowBackground(color) {
  return `linear-gradient(90deg, ${color}, ${color}cc)`;
}

function getSnapshotValues(snapshot, nextSnapshot, progress, riderMap) {
  const currentValues = valueMap(snapshot);
  const nextValues = valueMap(nextSnapshot);
  const visibleKeys = nextSnapshot.standings.slice(0, LEADER_COUNT).map((standing) => standing.riderKey);

  return visibleKeys
    .map((riderKey, index) => {
      const rider = riderMap.get(riderKey);
      const previous = currentValues.get(riderKey) ?? 0;
      const next = nextValues.get(riderKey) ?? previous;

      return {
        rider,
        riderKey,
        rank: index + 1,
        lapsLed: interpolate(progress, [0, 1], [previous, next])
      };
    })
    .filter((row) => row.rider);
}

export function LapsLedPieRace({ data, layout = "landscape" }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const settings = LAYOUTS[layout] || LAYOUTS.landscape;
  const riderMap = getRiderMap(data.riders);
  const snapshots = data.frames;
  const activeFrame = Math.max(0, frame - INTRO_FRAMES - FIRST_HOLD_FRAMES);
  const playableFrames = Math.max(1, durationInFrames - INTRO_FRAMES - FIRST_HOLD_FRAMES - 1);
  const snapshotProgress = interpolate(activeFrame, [0, playableFrames], [0, snapshots.length - 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const segment = Math.min(Math.floor(snapshotProgress), snapshots.length - 1);
  const nextSegment = Math.min(segment + 1, snapshots.length - 1);
  const segmentProgress = snapshotProgress - segment;
  const easedProgress = Math.min(
    spring({
      frame: segmentProgress * 18,
      fps,
      config: {
        damping: 28,
        stiffness: 120,
        mass: 0.75
      },
      durationInFrames: 18
    }),
    1
  );
  const smoothedProgress = ease(easedProgress);
  const currentSnapshot = snapshots[segment];
  const nextSnapshot = snapshots[nextSegment];
  const visibleSnapshot = segmentProgress < 0.5 ? currentSnapshot : nextSnapshot;
  const rows = getSnapshotValues(currentSnapshot, nextSnapshot, smoothedProgress, riderMap);
  const totalLaps = interpolate(smoothedProgress, [0, 1], [
    currentSnapshot.totalLapsLed,
    nextSnapshot.totalLapsLed
  ]);
  const listedLaps = rows.reduce((sum, row) => sum + row.lapsLed, 0);
  const otherLaps = Math.max(0, totalLaps - listedLaps);
  const pieRows = otherLaps >= 0.5
    ? [...rows, { riderKey: "other", rider: { name: "Other", color: "#6b7280" }, lapsLed: otherLaps }]
    : rows;
  const introOpacity = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  let startAngle = 0;
  const center = settings.pieSize / 2;
  const outerRadius = settings.pieSize / 2 - 16;
  const innerRadius = 205;

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
          background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0) 42%)"
        }}
      />

      <div
        style={{
          position: "absolute",
          top: settings.headerTop,
          left: settings.headerLeft,
          right: settings.headerRight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: introOpacity
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: settings.titleGap }}>
          <div
            style={{
              fontSize: settings.titleFontSize,
              fontWeight: 850,
              letterSpacing: 0,
              lineHeight: 1
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
              display: "block"
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
          <span style={{ fontSize: settings.metaLabelFontSize, fontWeight: 750 }}>
            Round {visibleSnapshot.round} / Moto {visibleSnapshot.moto}
          </span>
          <span style={{ fontSize: settings.metaFontSize, fontWeight: 900, color: "#ffffff" }}>
            {visibleSnapshot.lap}
          </span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: settings.pieLeft,
          top: settings.pieTop,
          width: settings.pieSize,
          height: settings.pieSize,
          opacity: introOpacity
        }}
      >
        <svg width={settings.pieSize} height={settings.pieSize} viewBox={`0 0 ${settings.pieSize} ${settings.pieSize}`}>
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="rgba(255,255,255,0.05)"
          />
          {pieRows.map((row) => {
            const angle = totalLaps > 0 ? row.lapsLed / totalLaps * 360 : 0;
            const endAngle = startAngle + angle;
            const path = describeDonutSlice(center, center, outerRadius, innerRadius, startAngle, endAngle);
            startAngle = endAngle;

            return (
              <path
                key={row.riderKey}
                d={path}
                fill={row.rider.color}
                opacity={row.riderKey === "other" ? 0.42 : 0.95}
                stroke="#11141a"
                strokeWidth={4}
              />
            );
          })}
        </svg>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1 }}>
            {Math.round(totalLaps)}
          </div>
          <div style={{ marginTop: 10, fontSize: 25, fontWeight: 750, color: "rgba(235,240,247,0.72)" }}>
            laps led
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: settings.listLeft, top: settings.listTop, opacity: introOpacity }}>
        {rows.map((row, index) => (
          <div
            key={row.riderKey}
            style={{
              width: settings.rowWidth,
              height: settings.rowHeight,
              marginBottom: settings.rowGap,
              display: "flex",
              alignItems: "center",
              gap: 14
            }}
          >
            <div
              style={{
                width: 34,
                textAlign: "right",
                color: "rgba(235,240,247,0.56)",
                fontSize: 22,
                fontWeight: 850
              }}
            >
              {index + 1}
            </div>
            <RiderAvatar
              image={row.rider.image}
              name={row.rider.name}
              size={settings.avatarSize}
              radius={12}
            />
            <div
              style={{
                flex: 1,
                height: "100%",
                borderRadius: 12,
                padding: "0 18px",
                background: rowBackground(row.rider.color),
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)",
                color: textColor(row.rider.color),
                display: "flex",
                alignItems: "center",
                gap: 12
              }}
            >
              <div
                style={{
                  fontSize: settings.nameFontSize,
                  fontWeight: 850,
                  lineHeight: 1,
                  whiteSpace: "nowrap"
                }}
              >
                {row.rider.name}
              </div>
              <CountryFlag code={row.rider.countryCode} country={row.rider.country} size={settings.flagSize} />
              <ManufacturerLogo brand={row.rider.manufacturerLogo} compact />
              <div
                style={{
                  marginLeft: "auto",
                  minWidth: 72,
                  textAlign: "right",
                  fontSize: settings.lapsFontSize,
                  fontWeight: 900,
                  lineHeight: 1
                }}
              >
                {Math.round(row.lapsLed)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}
