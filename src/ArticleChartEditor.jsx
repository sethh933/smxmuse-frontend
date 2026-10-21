import { chartSeriesColor } from "./articleChartSeries";
import { useState } from "react";
import { parseArticleCsv } from "./articleCsv";
import ArticleChart from "./ArticleChart";

export default function ArticleChartEditor({ block, onChange, entities }) {
  const [error, setError] = useState("");
  function importData(csv) {
    try {
      const parsed = parseArticleCsv(csv);
      if (parsed.columns.length < 2) throw new Error("Include a label column and at least one numeric value column.");
      const columns = parsed.columns.map((column) => ({ ...column, type: "text", chartColor: block.columns.find((old) => old.label === column.label)?.chartColor, trendline: block.columns.find((old) => old.label === column.label)?.trendline || false }));
      const oldX = block.columns[block.xColumn]?.label;
      const xColumn = Math.max(0, columns.findIndex((column) => column.label === oldX));
      const numeric = columns.flatMap((_, i) => i !== xColumn && parsed.rows.some((row) => row[i].trim()) && parsed.rows.every((row) => !row[i].trim() || Number.isFinite(Number(row[i].replace(/,/g, "")))) ? [i] : []);
      if (!numeric.length) throw new Error("No numeric value columns found. Use numbers such as 8.25; put units in the Units field.");
      numeric.forEach((i) => { columns[i].type = "number"; });
      const oldY = (block.yColumns || []).map((i) => block.columns[i]?.label);
      const matched = numeric.filter((i) => oldY.includes(columns[i].label));
      onChange({ ...parsed, columns, csv, xColumn, yColumns: matched.length ? matched : [numeric[0]], sortColumn: xColumn });
      setError("");
    } catch (err) { setError(err.message); }
  }
  return <>
    <label>Paste CSV or spreadsheet cells<textarea rows={5} value={block.csv} onChange={(event) => onChange({ csv: event.target.value })} placeholder={'Year,Average margin\n2024,6.3\n2025,4.2\n2026,5.1'} /></label>
    <div className="article-import-actions"><button type="button" onClick={() => importData(block.csv)}>Import chart data</button><label>Or upload CSV<input type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" onChange={async (event) => {
      const file = event.target.files?.[0]; if (!file) return;
      try { importData(await file.text()); } catch { setError("Could not read that file."); }
    }} /></label></div>
    <p className="article-help">First row contains column headings. Rows plot in spreadsheet order. Blank values appear as gaps, not zeros. Import again after changing the pasted data.</p>
    {error && <p role="alert" className="article-error">{error} Your existing chart data is unchanged.</p>}
    <div className="notes-admin-grid">
      <label>Chart type<select value={block.chartType || "line"} onChange={(event) => onChange({ chartType: event.target.value })}><option value="line">Line</option><option value="bar">Bar</option></select></label>
      <label>Label column (X-axis)<select value={block.xColumn || 0} onChange={(event) => { const xColumn = Number(event.target.value); onChange({ xColumn, yColumns: (block.yColumns || []).filter((i) => i !== xColumn) }); }}>{block.columns.map((column, i) => <option key={i} value={i}>{column.label}</option>)}</select></label>
      <label>X-axis label<input value={block.xLabel || ""} onChange={(event) => onChange({ xLabel: event.target.value })} placeholder="Year" /></label>
      <label>Y-axis label<input value={block.yLabel || ""} onChange={(event) => onChange({ yLabel: event.target.value })} placeholder="Average margin of victory" /></label>
      <label>Units<input value={block.unit || ""} onChange={(event) => onChange({ unit: event.target.value })} placeholder="seconds" /></label>
    </div>
    {block.columns.length > 0 && <fieldset><legend>Value columns</legend>{block.columns.map((column, i) => i !== block.xColumn && column.type === "number" && <label key={i}><span><input type="checkbox" checked={(block.yColumns || []).includes(i)} onChange={(event) => onChange({ yColumns: event.target.checked ? [...(block.yColumns || []), i] : block.yColumns.filter((index) => index !== i) })} /> {column.label}</span></label>)}</fieldset>}
    {(block.yColumns || []).filter((i) => i !== block.xColumn && block.columns[i]).map((i, position) => <div className="notes-admin-grid" key={i}>
      <label>{block.columns[i].label} color<input type="color" value={chartSeriesColor(block.columns[i], position)} onChange={(event) => onChange({ columns: block.columns.map((column, index) => index === i ? { ...column, chartColor: event.target.value } : column) })} /></label>
      <label><span><input type="checkbox" checked={Boolean(block.columns[i].trendline)} onChange={(event) => onChange({ columns: block.columns.map((column, index) => index === i ? { ...column, trendline: event.target.checked } : column) })} /> Add linear trendline for {block.columns[i].label}</span></label>
    </div>)}
    <p className="article-help">Trendlines use equally spaced row positions and skip blank values. At least two numeric values are required. They appear dashed in the series color.</p>
    <label>Source / chart note<input value={block.caption} onChange={(event) => onChange({ caption: event.target.value })} placeholder="Source, date range, or exclusions" /></label>
    <ArticleChart block={block} entities={entities} />
  </>;
}
