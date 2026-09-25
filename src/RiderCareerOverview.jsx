export default function RiderCareerOverview({ overview = [] }) {
  if (!overview.length) return null;
  return <section className="rider-career-overview" aria-label="Career overview">
    <table className="career-overview-table">
      <caption>Career summary <span>· All classes</span></caption>
      <thead><tr><th scope="col">Discipline</th><th scope="col">Starts</th><th scope="col">Wins</th><th scope="col">Podiums</th><th scope="col">Avg Finish</th></tr></thead>
      <tbody>{overview.map(row => <tr key={row.code}>
        <th scope="row" title={row.label}>{row.code}</th>
        {[row.starts, row.wins, row.podiums].map((value, index) => <td key={index}>{value == null ? "—" : Number(value).toLocaleString("en-US")}</td>)}
        <td>{row.averageFinish == null ? "—" : Number(row.averageFinish).toFixed(2)}</td>
      </tr>)}</tbody>
    </table>
    <p className="career-overview-footnote">SX main events · MX, SMX &amp; WMX overalls</p>
  </section>;
}
