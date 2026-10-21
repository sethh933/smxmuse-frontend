import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import ArticleTable from "./ArticleTable";
import ArticleFormattedText from "./ArticleFormattedText";

import { chartSeriesColor, linearTrend } from "./articleChartSeries";
export default function ArticleChart({ block, entities }) {
  const series = (block.yColumns || []).filter((index) => index !== block.xColumn && block.columns[index]);
  const data = block.rows.map((row) => Object.fromEntries(row.map((cell, index) => [String(index), index === block.xColumn ? cell : cell.trim() && Number.isFinite(Number(cell.replace(/,/g, ""))) ? Number(cell.replace(/,/g, "")) : null])));
  const trends = series.flatMap((index) => {
    if (!block.columns[index].trendline) return [];
    const values = linearTrend(data.map((row) => row[String(index)]));
    if (!values) return [];
    data.forEach((row, i) => { row[`trend-${index}`] = values[i]; });
    return [index];
  });
  const Mark = block.chartType === "bar" ? Bar : Line;
  return <section className="article-chart">
    {block.heading && <h2>{block.heading}</h2>}
    {series.length && data.length ? <>
      <p className="article-source">{block.yLabel || "Value"}{block.unit ? ` (${block.unit})` : ""}</p>
      <div style={{ width: "100%", height: 360, minWidth: 0 }} role="img" aria-label={`${block.heading || "Chart"}. ${block.chartType === "bar" ? "Bar" : "Line"} chart; exact values are available in View data below.`}>
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 800, height: 360 }}>
          <ComposedChart data={data} margin={{ top: 12, right: 20, bottom: 25, left: 4 }} accessibilityLayer>
            <CartesianGrid stroke="#3a3a3a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={String(block.xColumn)} stroke="#bbb" tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis stroke="#bbb" tick={{ fontSize: 12 }} domain={[(min) => Math.min(0, min), (max) => Math.max(0, max)]} />
            <Tooltip contentStyle={{ background: "#202020", border: "1px solid #555", color: "#fff" }} labelStyle={{ color: "#fff" }} formatter={(value) => `${value}${block.unit ? ` ${block.unit}` : ""}`} />
            <Legend />
            {series.map((index, i) => <Mark key={index} dataKey={String(index)} name={block.columns[index].label} stroke={chartSeriesColor(block.columns[index], i)} fill={chartSeriesColor(block.columns[index], i)} type="linear" strokeWidth={2.5} dot={data.length <= 40} connectNulls={false} isAnimationActive={false} />)}
            {trends.map((index) => <Line key={`trend-${index}`} dataKey={`trend-${index}`} name={`${block.columns[index].label} trend`} stroke={chartSeriesColor(block.columns[index], series.indexOf(index))} strokeDasharray="7 5" strokeWidth={2} dot={false} activeDot={false} type="linear" isAnimationActive={false} />)}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="article-source" style={{ textAlign: "center" }}>{block.xLabel || block.columns[block.xColumn]?.label}</p>
    </> : <p>Import data and select a label column and at least one value column.</p>}
    {trends.length > 0 && <p className="article-source">Dashed lines show linear trends across equally spaced rows; blank values are excluded.</p>}
    {block.caption && <p className="article-source"><ArticleFormattedText text={block.caption} entities={entities} /></p>}
    {block.columns.length > 0 && <details><summary>View data ({block.rows.length} rows)</summary><ArticleTable block={{ ...block, heading: "", caption: "" }} entities={entities} /></details>}
  </section>;
}
