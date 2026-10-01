import { useMemo, useState } from "react";
import LinkedNoteText from "./LinkedNoteText";
import ArticleFormattedText from "./ArticleFormattedText";
import { compareArticleCells } from "./articleCsv";
import ArticleCountry from "./ArticleCountry";

export default function ArticleTable({ block, entities }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ index: Number(block.sortColumn || 0), direction: block.sortDirection || "asc" });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const rows = useMemo(() => block.rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(query.toLowerCase())))
    .sort((a, b) => compareArticleCells(a[sort.index], b[sort.index], block.columns[sort.index]?.type) * (sort.direction === "asc" ? 1 : -1)), [block, query, sort]);
  const lastPage = Math.max(0, Math.ceil(rows.length / size) - 1);
  const currentPage = Math.min(page, lastPage);
  return <section className="article-data">
    {block.heading && <h2><ArticleFormattedText text={block.heading} entities={entities} /></h2>}
    <div className="article-table-tools">
      <label>Search table<input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder="Find a rider or value…" /></label>
      <label>Rows<select value={size} onChange={(event) => { setSize(Number(event.target.value)); setPage(0); }}>{[25, 50, 100].map((value) => <option key={value}>{value}</option>)}</select></label>
    </div>
    <div className="article-table-scroll" tabIndex={0} role="region" aria-label={block.heading || "Article data table"}>
      <table><thead><tr>{block.columns.map((column, index) => <th key={index} aria-sort={sort.index === index ? sort.direction === "asc" ? "ascending" : "descending" : "none"}>
        <button type="button" onClick={() => { setSort({ index, direction: sort.index === index && sort.direction === "asc" ? "desc" : "asc" }); setPage(0); }}>{column.label} {sort.index === index ? sort.direction === "asc" ? "↑" : "↓" : "↕"}</button>
      </th>)}</tr></thead><tbody>{rows.slice(currentPage * size, (currentPage + 1) * size).map((row, index) => <tr key={index}>{row.map((cell, column) => <td key={column} className={block.columns[column].type === "number" ? "article-number" : ""}>{block.columns[column].type === "rider" ? <LinkedNoteText text={cell} entities={{ riders: entities?.riders || [] }} /> : ["country", "countryName"].includes(block.columns[column].type) ? <ArticleCountry country={cell} showName={block.columns[column].type === "countryName"} /> : cell}</td>)}</tr>)}</tbody></table>
      {!rows.length && <p>No matching rows.</p>}
    </div>
    <div className="article-table-footer">
      <span>{rows.length ? currentPage * size + 1 : 0}–{Math.min((currentPage + 1) * size, rows.length)} of {rows.length} rows{query && ` (${block.rows.length} total)`}</span>
      <div className="article-pagination" role="group" aria-label="Table pagination">
        <button type="button" disabled={!currentPage} onClick={() => setPage(0)}>First</button>
        <button type="button" disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>Previous</button>
        <span aria-live="polite">Page {currentPage + 1} of {lastPage + 1}</span>
        <button type="button" disabled={currentPage >= lastPage} onClick={() => setPage(currentPage + 1)}>Next</button>
        <button type="button" disabled={currentPage >= lastPage} onClick={() => setPage(lastPage)}>Last</button>
      </div>
    </div>
    {block.caption && <p className="article-source"><ArticleFormattedText text={block.caption} entities={entities} /></p>}
  </section>;
}
