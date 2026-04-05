import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useEffect, useState } from "react";

const BRAND_BASE_COLORS = {
  HON: "#CC0000",
  HONDA: "#CC0000",
  KAW: "#6BBF23",
  KAWASAKI: "#6BBF23",
  YAM: "#001489",
  YAMAHA: "#001489",
  KTM: "#f2771a",
  SUZ: "#fde201",
  SUZUKI: "#fde201",
  HUS: "#ffffff",
  HUSQVARNA: "#ffffff",
  GAS: "#E31C23",
  GASGAS: "#E31C23",
  TRI: "#F2FF00",
  TRIUMPH: "#F2FF00",
  BET: "#b83333",
  BETA: "#b83333",
  DUC: "#c21807",
  DUCATI: "#c21807",
  TM: "#4b7bec"
};

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized.split("").map((char) => char + char).join("")
      : normalized;

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function mixHex(hex, targetHex, amount) {
  const from = hexToRgb(hex);
  const target = hexToRgb(targetHex);

  return rgbToHex({
    r: from.r + (target.r - from.r) * amount,
    g: from.g + (target.g - from.g) * amount,
    b: from.b + (target.b - from.b) * amount
  });
}

function normalizeBrand(value) {
  return String(value || "").trim().toUpperCase();
}

function getBaseBrandColor(brand) {
  return BRAND_BASE_COLORS[normalizeBrand(brand)] || "#8a8f98";
}

function getBrandShade(baseColor, index) {
  if (index === 0) return baseColor;

  const variants = [
    mixHex(baseColor, "#ffffff", 0.26),
    mixHex(baseColor, "#000000", 0.22),
    mixHex(baseColor, "#ffffff", 0.42),
    mixHex(baseColor, "#000000", 0.36),
    mixHex(baseColor, "#ffffff", 0.56)
  ];

  return variants[(index - 1) % variants.length];
}

export function LapsLedPie({ data, sport, mainStats = [] }) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 640 : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const handleChange = (event) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const filtered = [...data]
    .filter((d) => d.LapsLed > 0)
    .sort((a, b) => b.LapsLed - a.LapsLed);

  const total = filtered.reduce((sum, d) => sum + d.LapsLed, 0);

  const brandByRiderId = new Map();
  const brandByName = new Map();

  mainStats.forEach((row) => {
    const brand = row.Brand || row.brand;
    if (!brand) return;

    if (row.RiderID != null) {
      brandByRiderId.set(row.RiderID, brand);
    }

    if (row.FullName) {
      brandByName.set(String(row.FullName).trim().toLowerCase(), brand);
    }
  });

  const brandCounts = new Map();

  const normalized = filtered.map((d) => {
    const brand =
      d.Brand ||
      d.brand ||
      brandByRiderId.get(d.RiderID) ||
      brandByName.get(String(d.FullName || "").trim().toLowerCase()) ||
      "Other";

    const brandKey = normalizeBrand(brand);
    const brandIndex = brandCounts.get(brandKey) || 0;
    brandCounts.set(brandKey, brandIndex + 1);

    const baseColor = getBaseBrandColor(brandKey);
    const color = getBrandShade(baseColor, brandIndex);
    const textColor =
      getLuminance(color) < 0.42 ? mixHex(color, "#ffffff", 0.55) : color;

    return {
      ...d,
      Brand: brand,
      PctLapsLed: sport === "sx" ? d.PctLapsLed : d.LapsLed / total,
      ChartColor: color,
      TextColor: textColor
    };
  });

  const tooltipFormatter = (value, _name, { payload }) => {
    const pct = `${(value * 100).toFixed(1)}%`;
    return [`${pct} (${payload.LapsLed} laps)`, `${payload.FullName} - ${payload.Brand}`];
  };

  const innerRadius = isMobile ? 44 : 54;
  const outerRadius = isMobile ? 96 : 122;

  return (
    <div className="laps-led-panel">
      <div className="laps-led-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={normalized}
              dataKey="PctLapsLed"
              nameKey="FullName"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={1}
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth={1}
            >
              {normalized.map((rider, i) => (
                <Cell key={i} fill={rider.ChartColor} />
              ))}
            </Pie>
            <Tooltip formatter={tooltipFormatter} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="laps-led-breakdown">
        {normalized.map((rider, i) => (
          <div className="laps-led-breakdown-item" key={`${rider.FullName}-${i}`}>
            <span
              className="laps-led-swatch"
              style={{ backgroundColor: rider.ChartColor }}
            />
            <div className="laps-led-breakdown-copy">
              <span
                className="laps-led-breakdown-name"
                style={{ color: rider.TextColor }}
              >
                {rider.FullName}
              </span>
              <span className="laps-led-breakdown-meta">
                {sport === "sx"
                  ? `${(rider.PctLapsLed * 100).toFixed(1)}%`
                  : `${((rider.LapsLed / total) * 100).toFixed(1)}%`}
                {" | "}
                {rider.LapsLed} laps
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
