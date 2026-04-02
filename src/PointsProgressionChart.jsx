import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b"
];

export function PointsProgressionChart({ data, sport }) {
  // Helper to normalize SX vs MX
  const getPoints = (d) =>
  d.CumulativePoints ?? d.Points;

  // Determine final standings
  const finalByRider = {};
  data.forEach(d => {
    const pts = getPoints(d);
    finalByRider[d.FullName] = Math.max(
      finalByRider[d.FullName] || 0,
      pts
    );
  });

  // Top 5 riders only (Power BI behavior)
  const topRiders = Object.entries(finalByRider)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  // Transform into round-based rows
  const rounds = {};
  data.forEach(d => {
    if (!topRiders.includes(d.FullName)) return;

    if (!rounds[d.Round]) rounds[d.Round] = { round: d.Round };

    rounds[d.Round][d.FullName] = getPoints(d);
  });

  const chartData = Object.values(rounds).sort(
    (a, b) => a.round - b.round
  );

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <XAxis dataKey="round" />
          <YAxis />
          <Tooltip />
          <Legend />

          {topRiders.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}