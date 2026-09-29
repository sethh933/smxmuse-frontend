// CSV and spreadsheet paste share the same quoting rules.
export function parseArticleCsv(input) {
  const source = input.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const delimiter = source.split("\n")[0].includes("\t") ? "\t" : ",";
  const records = [];
  let row = [], cell = "", quoted = false, closed = false;
  const pushCell = () => { row.push(cell.trim()); cell = ""; closed = false; };
  const pushRow = () => { pushCell(); if (row.some(Boolean)) records.push(row); row = []; };
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') { quoted = false; closed = true; }
      else cell += ch;
    } else if (ch === delimiter) pushCell();
    else if (ch === "\n") pushRow();
    else if (ch === '"' && !cell && !closed) quoted = true;
    else if (closed && ch.trim()) throw new Error("Unexpected text after a quoted cell.");
    else if (!closed) cell += ch;
  }
  if (quoted) throw new Error("A quoted cell is missing its closing quote.");
  pushRow();
  if (records.length < 2) throw new Error("Include a header row and at least one data row.");
  const [headers, ...rows] = records;
  if (headers.some((header) => !header)) throw new Error("Each column needs a heading.");
  const bad = rows.findIndex((record) => record.length !== headers.length);
  if (bad !== -1) throw new Error(`Data row ${bad + 1} has ${rows[bad].length} cells; expected ${headers.length}.`);
  return { columns: headers.map((label, index) => ({ label, type: /rider|competitor|name/i.test(label) ? "rider" : rows.every((record) => !record[index] || Number.isFinite(Number(record[index].replace(/,/g, "")))) ? "number" : "text" })), rows };
}

export function compareArticleCells(a, b, type) {
  if (!a || !b) return a ? -1 : b ? 1 : 0;
  if (type === "number") {
    const left = Number(a.replace(/,/g, "")), right = Number(b.replace(/,/g, ""));
    if (Number.isFinite(left) && Number.isFinite(right)) return left - right;
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}
