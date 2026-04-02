import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

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

function getDisplayColor(color, brandKey) {
  if (brandKey === "YAM" || brandKey === "YAMAHA") {
    return mixHex(color, "#ffffff", 0.45);
  }

  return color;
}

export function PointsProgressionChart({ data, sport, mainStats = [] }) {
  const getPoints = (d) => d.CumulativePoints ?? d.Points;

  const finalByRider = {};
  data.forEach((d) => {
    const pts = getPoints(d);
    finalByRider[d.FullName] = Math.max(finalByRider[d.FullName] || 0, pts);
  });

  const topRiders = Object.entries(finalByRider)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  const rounds = {};
  data.forEach((d) => {
    if (!topRiders.includes(d.FullName)) return;

    if (!rounds[d.Round]) rounds[d.Round] = { round: d.Round };
    rounds[d.Round][d.FullName] = getPoints(d);
  });

  const sortedRounds = Object.values(rounds).sort((a, b) => a.round - b.round);
  const lastSeenPoints = Object.fromEntries(topRiders.map((name) => [name, 0]));

  const chartData = sortedRounds.map((roundRow) => {
    const filledRow = { round: roundRow.round };

    topRiders.forEach((name) => {
      if (roundRow[name] != null) {
        lastSeenPoints[name] = roundRow[name];
      }

      filledRow[name] = lastSeenPoints[name];
    });

    return filledRow;
  });

  const brandByRider = new Map();
  mainStats.forEach((row) => {
    const brand = row.Brand || row.brand;
    const name = row.FullName || row.fullname;
    if (brand && name) {
      brandByRider.set(String(name).trim().toLowerCase(), brand);
    }
  });

  const brandCounts = new Map();
  const lineColors = new Map();
  const displayColors = new Map();

  topRiders.forEach((name) => {
    const brand = brandByRider.get(String(name).trim().toLowerCase()) || "Other";
    const brandKey = normalizeBrand(brand);
    const brandIndex = brandCounts.get(brandKey) || 0;
    brandCounts.set(brandKey, brandIndex + 1);
    const lineColor = getBrandShade(getBaseBrandColor(brandKey), brandIndex);
    lineColors.set(name, lineColor);
    displayColors.set(name, getDisplayColor(lineColor, brandKey));
  });

  const legendFormatter = (value) => (
    <span style={{ color: displayColors.get(value) || "#f1f1f1", fontWeight: 600 }}>
      {value}
    </span>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const roundRow = payload[0]?.payload || {};

    return (
      <div
        style={{
          background: "rgba(21, 21, 21, 0.96)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "14px",
          padding: "12px 14px",
          boxShadow: "0 16px 30px rgba(0, 0, 0, 0.28)"
        }}
      >
        <div
          style={{
            color: "#f1f1f1",
            fontWeight: 700,
            marginBottom: "8px"
          }}
        >
          Round {label}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {topRiders
            .filter((name) => roundRow[name] != null)
            .map((name) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: displayColors.get(name) || "#f1f1f1",
                  fontWeight: 600
                }}
              >
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "999px",
                    backgroundColor: displayColors.get(name) || "#f1f1f1",
                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.2)"
                  }}
                />
                <span>
                  {name}: {roundRow[name]}
                </span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 8, right: 18, left: 8, bottom: 8 }}>
          <XAxis dataKey="round" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={legendFormatter} />

          {topRiders.map((name) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={displayColors.get(name)}
              strokeWidth={3.5}
              dot={false}
              activeDot={{
                r: 5,
                stroke: "#ffffff",
                strokeWidth: 1,
                fill: displayColors.get(name)
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
