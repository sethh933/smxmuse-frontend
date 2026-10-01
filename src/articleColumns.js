export function moveArticleColumn(block, from, to) {
  if (from < 0 || to < 0 || from >= block.columns.length || to >= block.columns.length || from === to) return block;
  const order = block.columns.map((_, index) => index);
  const [moved] = order.splice(from, 1);
  order.splice(to, 0, moved);
  return {
    ...block,
    columns: order.map((index) => block.columns[index]),
    rows: block.rows.map((row) => order.map((index) => row[index])),
    sortColumn: order.indexOf(Number(block.sortColumn || 0)),
  };
}
