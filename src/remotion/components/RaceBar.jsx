import { interpolate } from "remotion";
import { CountryFlag } from "./CountryFlag";
import { ManufacturerLogo } from "./ManufacturerLogo";
import { RiderAvatar } from "./RiderAvatar";

function readableColor(color) {
  if (color === "#f2f6fb" || color === "#d8e600" || color === "#f6d928") {
    return "#10131a";
  }

  return "#f9fbff";
}

const LAYOUTS = {
  instagramSafeVertical: {
    left: 50,
    width: 920,
    height: 106,
    gap: 12,
    rankWidth: 32,
    rankFontSize: 24,
    avatarSize: 72,
    avatarRadius: 13,
    barHeight: 88,
    barRadius: 12,
    minBarWidth: 430,
    maxBarWidth: 670,
    barPaddingLeft: 18,
    barPaddingRight: 16,
    contentGap: 10,
    nameFontSize: 24,
    pointsMinWidth: 72,
    pointsFontSize: 34,
    compactLogo: true,
    flagSize: 24
  }
};

const COUNTRY_CODES = {
  Australia: "au",
  Belgium: "be",
  Canada: "ca",
  Denmark: "dk",
  France: "fr",
  Germany: "de",
  Italy: "it",
  Japan: "jp",
  Netherlands: "nl",
  "New Zealand": "nz",
  Norway: "no",
  Spain: "es",
  Sweden: "se",
  Switzerland: "ch",
  "United States": "us",
  Venezuela: "ve"
};

export function RaceBar({ rider, points, maxPoints, y, opacity, rank, layout = "instagramSafeVertical" }) {
  const settings = LAYOUTS[layout] || LAYOUTS.instagramSafeVertical;
  const barWidth = interpolate(points, [0, Math.max(maxPoints, 1)], [
    settings.minBarWidth,
    settings.maxBarWidth
  ], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <div
      style={{
        position: "absolute",
        left: settings.left,
        top: y,
        width: settings.width,
        height: settings.height,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: settings.gap
      }}
    >
      <div
        style={{
          width: settings.rankWidth,
          textAlign: "right",
          color: "rgba(235, 240, 247, 0.58)",
          fontSize: settings.rankFontSize,
          fontWeight: 800
        }}
      >
        {rank}
      </div>

      <RiderAvatar
        image={rider.image}
        name={rider.name}
        size={settings.avatarSize}
        radius={settings.avatarRadius}
      />

      <div
        style={{
          position: "relative",
          height: settings.barHeight,
          width: barWidth,
          minWidth: settings.minBarWidth,
          borderRadius: settings.barRadius,
          overflow: "hidden",
          background: `linear-gradient(90deg, ${rider.color}, ${rider.color}cc)`,
          boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.16)"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0))"
          }}
        />
        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: settings.contentGap,
            paddingLeft: settings.barPaddingLeft,
            paddingRight: settings.barPaddingRight,
            color: readableColor(rider.color)
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
            {rider.name}
          </div>
          <CountryFlag
            code={rider.countryCode || COUNTRY_CODES[rider.country]}
            country={rider.country}
            size={settings.flagSize}
          />
          <ManufacturerLogo brand={rider.manufacturerLogo} compact={settings.compactLogo} />
        </div>
      </div>

      <div
        style={{
          marginLeft: "auto",
          minWidth: settings.pointsMinWidth,
          textAlign: "right",
          color: "#f7f9fc",
          fontSize: settings.pointsFontSize,
          fontWeight: 900,
          lineHeight: 1
        }}
      >
        {Math.round(points)}
      </div>
    </div>
  );
}
