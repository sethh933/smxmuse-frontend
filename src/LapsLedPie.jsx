import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
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

export function LapsLedPie({ data, sport }) {
  const filtered = data.filter(d => d.LapsLed > 0);

  const total = filtered.reduce((sum, d) => sum + d.LapsLed, 0);

const normalized = filtered.map(d => ({
  ...d,
  PctLapsLed: sport === "sx"
    ? d.PctLapsLed
    : d.LapsLed / total
}));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={normalized}
            dataKey="PctLapsLed"
            nameKey="FullName"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(1)}%`
            }
          >
            {filtered.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => `${(v * 100).toFixed(1)}%`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
