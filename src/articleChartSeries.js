const palette = ["#e879c1", "#65c9db", "#e9ba68", "#9ad18b", "#b9a2ef", "#f08e85"];
export function chartSeriesColor(column, index) {
  return /^#[0-9a-f]{6}$/i.test(column.chartColor || "") ? column.chartColor : palette[index % palette.length];
}

// The chart's category axis spaces rows equally, so fit against row position.
export function linearTrend(values) {
  const points = values.flatMap((y, x) => Number.isFinite(y) ? [{ x, y }] : []);
  if (points.length < 2) return null;
  const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const variance = points.reduce((sum, p) => sum + (p.x - meanX) ** 2, 0);
  const slope = points.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0) / variance;
  return values.map((_, x) => x < points[0].x || x > points.at(-1).x ? null : meanY + slope * (x - meanX));
}
