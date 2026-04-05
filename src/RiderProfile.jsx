import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function RiderProfile() {
  const { riderId } = useParams();
  const [data, setData] = useState(null);
  const [mode, setMode] = useState("SX"); // default to SX
  const [hasSX, setHasSX] = useState(true);
  const [hasMX, setHasMX] = useState(true);


  useEffect(() => {

  fetch(`http://localhost:8000/rider/${riderId}/profile?sport=${mode}`)
    .then(res => res.json())
    .then(data => {
  setData(data);
  setHasSX(data.hasSX);
  setHasMX(data.hasMX);
});
}, [riderId, mode]);

useEffect(() => {
  if (!data) return;

  if (!data.hasSX && data.hasMX) {
    setMode("MX");
  }
}, [data]);

// 👇 ADD THIS RIGHT BELOW
useEffect(() => {
  setMode("SX");
}, [riderId]);
  

const location = useLocation();

if (!data) return <div>Loading rider profile...</div>;
const sxStats = data.stats ?? [];
const qualStats = data.qual_stats ?? [];
const mxStats = data.mx_stats ?? [];
const mxQualStats = data.mx_qual_stats ?? [];



const formatDecimal = (value) => {
  if (value === null || value === undefined) return "-";
  return Number(value).toFixed(2);
};

// 👇 ADD THIS FUNCTION RIGHT HERE
  const getCountryCode = (country) => {
    const map = {
      "Puerto Rico": "pr",
      "Finland": "fi",
      "South Korea": "kr",
      "Guatemala": "gt",
      "New Zealand": "nz",
      "Uganda": "ug",
      "Scotland": "gb",
      "Italy": "it",
      "Brazil": "br",
      "Netherlands": "nl",
      "Bolivia": "bo",
      "Germany": "de",
      "England": "gb",
      "Lithuania": "lt",
      "Switzerland": "ch",
      "United States": "us",
      "Estonia": "ee",
      "Ecuador": "ec",
      "Mongolia": "mn",
      "Australia": "au",
      "United Kingdom": "gb",
      "Mexico": "mx",
      "Sweden": "se",
      "Honduras": "hn",
      "Ukraine": "ua",
      "Argentina": "ar",
      "Czechia": "cz",
      "Russia": "ru",
      "Uruguay": "uy",
      "Canada": "ca",
      "Ireland": "ie",
      "Latvia": "lv",
      "Norway": "no",
      "France": "fr",
      "Dominican Republic": "do",
      "Belgium": "be",
      "Japan": "jp",
      "Spain": "es",
      "Venezuela": "ve",
      "Denmark": "dk",
      "Colombia": "co",
      "Chile": "cl",
      "South Africa": "za",
      "Portugal": "pt",
      "Costa Rica": "cr"
    };

    return map[country] || "us";
  };

// Keep yearly rows exactly as-is
const yearlyRows = qualStats.filter(r => r.Year !== null);

// Only sort the Career rows
const careerRows = qualStats.filter(r => r.Year === null);

const sortedCareerRows = [...careerRows].sort((a, b) => {
  // combined last
  if (a.ClassID === 0) return 1;
  if (b.ClassID === 0) return -1;

  // 250 before 450
  if (a.ClassID === 2 && b.ClassID === 1) return -1;
  if (a.ClassID === 1 && b.ClassID === 2) return 1;

  return 0;
});

// Final array = unchanged yearly rows + reordered career rows
const sortedQualStats = [...yearlyRows, ...sortedCareerRows];

const mxYearlyRows = mxQualStats.filter(r => r.Year !== null);
const mxCareerRows = mxQualStats.filter(r => r.Year === null);

const sortedMxCareerRows = [...mxCareerRows].sort((a, b) => {
  // combined last
  if (a.ClassID === 0) return 1;
  if (b.ClassID === 0) return -1;

  // 250 before 450
  if (a.ClassID === 2 && b.ClassID === 1) return -1;
  if (a.ClassID === 1 && b.ClassID === 2) return 1;

  return 0;
});

const sortedMxQualStats = [...mxYearlyRows, ...sortedMxCareerRows];

  return (
    <div className="rider-profile-page rider-career-page">
      <section className="rider-profile-hero">
        <div className="rider-header">
          <img
            src={data.rider.image_url}
            alt={data.rider.full_name}
            className="rider-profile-image"
          />

          <h1 className="rider-name">
            {data.rider.full_name}
          </h1>

          <img
            src={`https://flagcdn.com/w40/${getCountryCode(
              data.rider.country
            )}.png`}
            alt={data.rider.country}
            className="rider-flag"
          />
        </div>

        <div className="rider-nav">
          <Link
            to={`/rider/${riderId}`}
            className={`rider-nav-button ${
              location.pathname === `/rider/${riderId}` ? "active" : ""
            }`}
          >
            Career Stats
          </Link>

          <Link
            to={`/rider/${riderId}/results`}
            className={`rider-nav-button ${
              location.pathname.includes("/results") ? "active" : ""
            }`}
          >
            Career Results
          </Link>

          <Link
            to={`/rider/${riderId}/points`}
            className={`rider-nav-button ${
              location.pathname.includes("/points") ? "active" : ""
            }`}
          >
            Points Standings
          </Link>
        </div>

        <div className="toggle-buttons rider-profile-toggle">
          {hasSX && (
            <button
              className={mode === "SX" ? "active" : ""}
              onClick={() => setMode("SX")}
            >
              SX
            </button>
          )}

          {hasMX && (
            <button
              className={mode === "MX" ? "active" : ""}
              onClick={() => setMode("MX")}
            >
              MX
            </button>
          )}
        </div>
      </section>

      {/* ================= MAIN STATS TABLE ================= */}
      <h2 className="section-header">
  {mode === "SX" ? "Main Events" : "Motocross"}
</h2>

<div className="rider-table-wrapper">
  <table className="rider-stats">
         <thead>
  {mode === "SX" ? (
    <tr>
      <th className="year-col">Year</th>
      <th className="class-col">Class</th>
      <th>Brand</th>
      <th>Starts</th>
      <th>Main Avg</th>
      <th>Best</th>
      <th>Top 10</th>
      <th>Top 10%</th>
      <th>Top 5</th>
      <th>Top 5%</th>
      <th>Podiums</th>
      <th>Podium%</th>
      <th>Wins</th>
      <th>Win%</th>
      <th>Laps Led</th>
      <th>Avg Start</th>
      <th>Holeshots</th>
      <th>Points</th>
    </tr>
  ) : (
    <tr>
      <th className="year-col">Year</th>
      <th className="class-col">Class</th>
      <th>Brand</th>
      <th>Starts</th>
      <th>Avg Overall</th>
      <th>Best Overall</th>
      <th>Avg Moto</th>
      <th>M1 Avg</th>
      <th>M2 Avg</th>
      <th>Best Moto</th>
      <th>Top 10</th>
      <th>Top 10%</th>
      <th>Top 5</th>
      <th>Top 5%</th>
      <th>Podiums</th>
      <th>Podium%</th>
      <th>Wins</th>
      <th>Win%</th>
      <th>Laps Led</th>
      <th>Holeshots</th>
      <th>Points</th>
    </tr>
  )}
</thead>
          <tbody>
  {mode === "SX" ? (
    sxStats.map((row, i) => {
      const isCareer = row.Year === null && row.Class === null;
      const isClassTotal = row.Year === null && row.Class !== null;

              return (
                <tr
                  key={i}
                  className={
                    isCareer
                      ? "career-row"
                      : isClassTotal
                      ? "class-total-row"
                      : ""
                  }
                >
                  <td className="year-col">
  {row.Year ? (
    <Link
      to={`/season/sx/${row.Year}/${row.Class}`}
      style={{ color: "#60a5fa", textDecoration: "none" }}
    >
      {row.Year}
    </Link>
  ) : "Career"}
</td>
                  <td className="class-col">{row.Class ?? ""}</td>
                  <td>{row.Brand ?? ""}</td>

                  <td>{row.Starts}</td>
                  
                  <td>{row.AvgMainResult}</td>
<td>{row.Best ?? "-"}</td>
                  <td>{row.Top10Count}</td>
                  <td>{row.Top10Pct}</td>

                  <td>{row.Top5Count}</td>
                  <td>{row.Top5Pct}</td>

                  <td>{row.Podiums}</td>
                  <td>{row.PodiumPct}</td>

                  <td>{row.Wins}</td>
                  <td>{row.WinPct}</td>

                  <td>{row.LapsLed}</td>
                  <td>{row.AvgStart ?? ""}</td>
                  <td>{row.Holeshots}</td>

                  <td>{row.TotalPoints}</td>
                </tr>
      );
    })
  ) : (
    mxStats.map((row, i) => {
  const isCareer = row.Year === null && row.ClassID === 0;
  const isClassTotal = row.Year === null && row.ClassID !== 0;

  return (
    <tr
      key={i}
      className={
        isCareer
          ? "career-row"
          : isClassTotal
          ? "class-total-row"
          : ""
      }
    >
      <td className="year-col">
        {row.Year ? (
          <Link
            to={`/season/mx/${row.Year}/${row.Class}`}
            style={{ color: "#60a5fa", textDecoration: "none" }}
          >
            {row.Year}
          </Link>
        ) : "Career"}
      </td>

      <td className="class-col">{row.Class ?? ""}</td>
      <td>{row.Brand ?? ""}</td>

      <td>{row.Starts}</td>
      <td>{row.AvgOverallFinish}</td>
      <td>{row.BestOverall ?? "-"}</td>
      <td>{row.AvgMotoFinish}</td>
      <td>{row.AvgMoto1Finish}</td>
      <td>{row.AvgMoto2Finish}</td>
      <td>{row.BestMoto ?? "-"}</td>
      <td>{row.Top10s}</td>
      <td>{row.Top10Pct}</td>
      <td>{row.Top5s}</td>
      <td>{row.Top5Pct}</td>
      <td>{row.Podiums}</td>
      <td>{row.PodiumPct}</td>
      <td>{row.Wins}</td>
      <td>{row.WinPct}</td>
      <td>{row.LapsLed}</td>
      <td>{row.Holeshots}</td>
      <td>{row.TotalPoints}</td>
    </tr>
  );
})
  )}
</tbody>
        </table>
      </div>

      {/* ================= QUAL / HEAT / LCQ TABLE ================= */}
      {mode === "SX" && (
  <>
    <h2 className="section-header">Qualifying / Heats / LCQs</h2>

<div className="rider-table-wrapper">
  <table className="rider-stats">
          <thead>
  <tr>
    <th className="year-col">Year</th>
    <th className="class-col">Class</th>
    <th>Brand</th>

    <th>Qual Starts</th>
    <th>Poles</th>
    
    <th>Avg Qual</th>
<th>Best Qual</th>
    <th>Heat Starts</th>
    
    <th>Heat Wins</th>
    <th>Avg Heat</th>
<th>Best Heat</th>
    <th>LCQ Starts</th>
    
    <th>Transfers</th>
    <th>Transfer%</th>
    <th>LCQ Wins</th>
    <th>Avg LCQ</th>
    <th>Best LCQ</th>
  </tr>
</thead>
          <tbody>
  {sortedQualStats.map((row, i) => {
    const isCareer = row.Year === null && row.ClassID === 0;
    const isClassTotal = row.Year === null && row.ClassID !== 0;

    return (
      <tr
        key={i}
        className={
          isCareer
            ? "career-row"
            : isClassTotal
            ? "class-total-row"
            : ""
        }
      >
        <td className="year-col">
          {row.Year ? (
            <Link
              to={`/season/sx/${row.Year}/${row.Class}`}
              style={{ color: "#60a5fa", textDecoration: "none" }}
            >
              {row.Year}
            </Link>
          ) : "Career"}
        </td>

        <td className="class-col">{row.Class ?? ""}</td>
        <td>{row.Brand ?? ""}</td>

        <td>{row.QualStarts}</td>
        <td>{row.Poles}</td>
        
        <td>{row.AvgQualResult}</td>
<td>{row.BestQual ?? "-"}</td>
        <td>{row.HeatStarts}</td>
        
        <td>{row.HeatWins}</td>
        <td>{row.AvgHeatResult}</td>
<td>{row.BestHeat ?? "-"}</td>
        <td>{row.LcqStarts}</td>
        
        <td>{row.LcqTransfers}</td>
        <td>{row.LcqTransferPct}</td>
        <td>{row.LcqWins}</td>
        <td>{row.AvgLcqResult}</td>
        <td>{row.BestLcq ?? "-"}</td>
      </tr>
    );
  })}
</tbody>
        </table>
      </div>
        </>
)}

{mode === "MX" && (
  <>
    <h2 className="section-header">Qualifying / Consis</h2>

    <div className="rider-table-wrapper">
      <table className="rider-stats">
        <thead>
          <tr>
            <th className="year-col">Year</th>
            <th className="class-col">Class</th>
            <th>Brand</th>

            <th>Qual Apps</th>
            <th>Avg Qual</th>
            <th>Best Qual</th>
            <th>Poles</th>

            <th>Consi Apps</th>
            <th>Avg Consi</th>
            <th>Best Consi</th>
            <th>Consi Wins</th>
          </tr>
        </thead>

        <tbody>
          {sortedMxQualStats.map((row, i) => {
            const isCareer = row.Year === null && row.ClassID === 0;
            const isClassTotal = row.Year === null && row.ClassID !== 0;

            return (
              <tr
                key={i}
                className={
                  isCareer
                    ? "career-row"
                    : isClassTotal
                    ? "class-total-row"
                    : ""
                }
              >
                <td className="year-col">
  {row.Year ? (
    <Link
      to={`/season/mx/${row.Year}/${row.Class}`}
      style={{ color: "#60a5fa", textDecoration: "none" }}
    >
      {row.Year}
    </Link>
  ) : "Career"}
</td>

                <td className="class-col">{row.Class ?? ""}</td>

                <td>{row.Brand ?? ""}</td>

                <td>{row.QualAppearances}</td>
                <td>{formatDecimal(row.AvgQual)}</td>
                <td>{row.BestQual}</td>
                <td>{row.Poles}</td>

                <td>{row.ConsiAppearances}</td>
                <td>{formatDecimal(row.AvgConsi)}</td>
                <td>{row.BestConsi}</td>
                <td>{row.ConsiWins}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </>
)}
    </div>
  );
}
