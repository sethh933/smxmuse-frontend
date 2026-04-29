import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
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

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

function getRiderKey(row) {
  const riderId = row?.RiderID ?? row?.riderid;
  const riderCoastId = row?.RiderCoastID ?? row?.ridercoastid;

  if (riderId != null && riderId !== "") {
    if (riderCoastId != null && riderCoastId !== "") {
      return `rider:${riderId}:coast:${riderCoastId}`;
    }

    return `rider:${riderId}`;
  }

  return `name:${normalizeName(row?.FullName ?? row?.fullname)}`;
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

  const getPoints = (d) => d.CumulativePoints ?? d.Points;

  const riderMetaByKey = new Map();

  mainStats.forEach((row) => {
    const key = getRiderKey(row);
    const name = row.FullName || row.fullname;
    const brand = row.Brand || row.brand;

    if (!key || !name) return;

    riderMetaByKey.set(key, {
      name,
      brand
    });
  });

  data.forEach((row) => {
    const key = getRiderKey(row);
    const name = row.FullName || row.fullname;

    if (!key || !name || riderMetaByKey.has(key)) return;

    riderMetaByKey.set(key, {
      name,
      brand: undefined
    });
  });

  const finalByRider = new Map();
  data.forEach((d) => {
    const riderKey = getRiderKey(d);
    const pts = getPoints(d);
    const current = finalByRider.get(riderKey);

    if (!current || pts > current.points) {
      const meta = riderMetaByKey.get(riderKey);
      finalByRider.set(riderKey, {
        key: riderKey,
        name: meta?.name || d.FullName || d.fullname || riderKey,
        points: pts
      });
    }
  });

  const topRiders = Array.from(finalByRider.values())
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map((rider) => rider.key);

  const rounds = {};
  data.forEach((d) => {
    const riderKey = getRiderKey(d);

    if (!topRiders.includes(riderKey)) return;

    if (!rounds[d.Round]) rounds[d.Round] = { round: d.Round };
    rounds[d.Round][riderKey] = getPoints(d);
  });

  const sortedRounds = Object.values(rounds).sort((a, b) => a.round - b.round);
  const lastSeenPoints = Object.fromEntries(topRiders.map((riderKey) => [riderKey, 0]));

  const chartData = sortedRounds.map((roundRow) => {
    const filledRow = { round: roundRow.round };

    topRiders.forEach((riderKey) => {
      if (roundRow[riderKey] != null) {
        lastSeenPoints[riderKey] = roundRow[riderKey];
      }

      filledRow[riderKey] = lastSeenPoints[riderKey];
    });

    return filledRow;
  });

  const brandCounts = new Map();
  const lineColors = new Map();
  const displayColors = new Map();

  topRiders.forEach((riderKey) => {
    const brand = riderMetaByKey.get(riderKey)?.brand || "Other";
    const brandKey = normalizeBrand(brand);
    const brandIndex = brandCounts.get(brandKey) || 0;
    brandCounts.set(brandKey, brandIndex + 1);
    const lineColor = getBrandShade(getBaseBrandColor(brandKey), brandIndex);
    lineColors.set(riderKey, lineColor);
    displayColors.set(riderKey, getDisplayColor(lineColor, brandKey));
  });

  const getRiderLabel = (riderKey) => riderMetaByKey.get(riderKey)?.name || riderKey;

  const legendFormatter = (value) => (
    <span style={{ color: displayColors.get(value) || "#f1f1f1", fontWeight: 600 }}>
      {getRiderLabel(value)}
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
            .filter((riderKey) => roundRow[riderKey] != null)
            .map((riderKey) => (
              <div
                key={riderKey}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: displayColors.get(riderKey) || "#f1f1f1",
                  fontWeight: 600
                }}
              >
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "999px",
                    backgroundColor: displayColors.get(riderKey) || "#f1f1f1",
                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.2)"
                  }}
                />
                <span>
                  {getRiderLabel(riderKey)}: {roundRow[riderKey]}
                </span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const chartHeight = isMobile ? 420 : 350;
  const chartMargin = isMobile
    ? { top: 12, right: 8, left: -18, bottom: 8 }
    : { top: 8, right: 18, left: 8, bottom: 8 };
  const legendHeight = isMobile ? 88 : 36;

  return (
    <div style={{ width: "100%", height: chartHeight }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={chartMargin}>
          <XAxis
            dataKey="round"
            tick={{ fill: "#a9a9a9", fontSize: isMobile ? 11 : 12 }}
            tickMargin={isMobile ? 6 : 8}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.2)" }}
            tickLine={{ stroke: "rgba(255, 255, 255, 0.2)" }}
          />
          <YAxis
            width={isMobile ? 28 : 40}
            tick={{ fill: "#a9a9a9", fontSize: isMobile ? 11 : 12 }}
            tickMargin={isMobile ? 4 : 8}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.2)" }}
            tickLine={{ stroke: "rgba(255, 255, 255, 0.2)" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={legendFormatter}
            verticalAlign="bottom"
            align="center"
            iconSize={isMobile ? 8 : 10}
            wrapperStyle={{
              paddingTop: isMobile ? "14px" : "8px",
              lineHeight: isMobile ? "1.35" : "1.5"
            }}
            height={legendHeight}
          />

          {topRiders.map((riderKey) => (
            <Line
              key={riderKey}
              type="monotone"
              dataKey={riderKey}
              name={getRiderLabel(riderKey)}
              stroke={displayColors.get(riderKey)}
              strokeWidth={isMobile ? 3 : 3.5}
              dot={false}
              activeDot={{
                r: isMobile ? 4 : 5,
                stroke: "#ffffff",
                strokeWidth: 1,
                fill: displayColors.get(riderKey)
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
