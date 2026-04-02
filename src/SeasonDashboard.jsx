import { useEffect, useState } from "react";
import { MainStatsTable } from "./MainStatsTable";
import { StartStatsTable } from "./StartStatsTable";
import { LapsLedPie } from "./LapsLedPie";
import { PointsProgressionChart } from "./PointsProgressionChart";
import { useParams, useNavigate } from "react-router-dom";

const START_YEAR = 1972;
const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i
);

export default function SeasonDashboard() {
  const { sport, year: yearParam, classId } = useParams();
  const navigate = useNavigate();
  const [classCache, setClassCache] = useState({});

  const year = Number(yearParam);

  // 🔥 Separate "form state" (unchanged)
  const [selectedSport, setSelectedSport] = useState(sport);
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedClass, setSelectedClass] = useState(classId);
  const [availableClasses, setAvailableClasses] = useState([]);

  // 🔥 Sync URL → form state (KEEP THIS)
  useEffect(() => {
    setSelectedSport(sport);
    setSelectedYear(year);
    setSelectedClass(classId);
  }, [sport, year, classId]);

  // 🔥 Dynamic class logic
useEffect(() => {
  async function loadClasses() {
    const key = `${selectedSport}-${selectedYear}`;

    // ✅ Already cached → instant
    if (classCache[key]) {
      setAvailableClasses(classCache[key]);
      return;
    }

    const sportId = selectedSport === "sx" ? 1 : 2;

    const res = await fetch(
      `/api/available-classes?sport_id=${sportId}&year=${selectedYear}`
    );

    const data = await res.json();

const mapped = data
  .map((c) => c.ClassID ?? c.classid)
  .filter(Boolean)
  .sort((a, b) => a - b)
  .flatMap((id) => {
    // 450
    if (id === 1) return ["450"];

    // 250
    if (id === 2) {
      if (selectedSport === "sx") {
        return ["250W", "250E"];  // 🔥 KEY CHANGE
      }
      return ["250"];
    }

    // 500
    if (id === 3) return ["500"];

    return [];
  });

    setAvailableClasses(mapped);
  }

  loadClasses();
}, [selectedSport, selectedYear, classCache]);

  const [mainStats, setMainStats] = useState([]);
  const [startStats, setStartStats] = useState([]);
  const [lapsLedStats, setLapsLedStats] = useState([]);
  const [pointsData, setPointsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      let apiClassId;
      let riderCoastId = null;

      if (classId === "450") apiClassId = 1;
      else if (classId === "250") apiClassId = 2;
      else if (classId === "500") apiClassId = 3;
      else if (classId === "250W") {
        apiClassId = 2;
        riderCoastId = 1;
      } else if (classId === "250E") {
        apiClassId = 2;
        riderCoastId = 2;
      }

      let mainUrl, startUrl, lapsUrl, pointsUrl;

      if (sport === "sx") {
        mainUrl = `/api/season/main-stats?year=${year}&sportid=1&classid=${apiClassId}${riderCoastId ? `&ridercoastid=${riderCoastId}` : ""}`;
        startUrl = `/api/season/start-stats?year=${year}&sportid=1&classid=${apiClassId}${riderCoastId ? `&ridercoastid=${riderCoastId}` : ""}`;
        lapsUrl = `/api/season/laps-led?year=${year}&sportid=1&classid=${apiClassId}${riderCoastId ? `&ridercoastid=${riderCoastId}` : ""}`;
        pointsUrl = `/api/season/points-progression?year=${year}&sportid=1&classid=${apiClassId}${riderCoastId ? `&ridercoastid=${riderCoastId}` : ""}`;
      } else {
        mainUrl = `/api/mx/season/overall?year=${year}&classid=${apiClassId}`;
        startUrl = `/api/mx/season/moto-qual?year=${year}&classid=${apiClassId}`;
        lapsUrl = `/api/mx/season/laps-led?year=${year}&classid=${apiClassId}`;
        pointsUrl = `/api/mx/season/points-progression?year=${year}&classid=${apiClassId}`;
      }

      const [mainRes, startRes, lapsRes, pointsRes] = await Promise.all([
        fetch(mainUrl),
        fetch(startUrl),
        fetch(lapsUrl),
        fetch(pointsUrl)
      ]);

      setMainStats(await mainRes.json());
      setStartStats(await startRes.json());
      setLapsLedStats(await lapsRes.json());
      setPointsData(await pointsRes.json());

      setLoading(false);
    }

    loadData();
  }, [year, classId, sport]);

  return (
    <div className="season-dashboard">

      {/* 🔥 Dynamic Header */}
      <h1>
        {year}{" "}
        {classId === "250W"
          ? "250 West"
          : classId === "250E"
          ? "250 East"
          : classId}
          {" "}
        {sport === "sx" ? "Supercross" : "Motocross"}
    
        
      </h1>

      {/* 🔥 NEW FILTERS */}
      <div className="filters">

        {/* SPORT */}
        <select
  value={selectedSport}
  onChange={(e) => {
    const newSport = e.target.value;
    setSelectedSport(newSport);

    // 🔥 KEY FIX: reset class when switching sport
    if (newSport === "mx") {
      setSelectedClass("450"); // default MX class
    } else {
      setSelectedClass("450"); // default SX class (safe)
    }
  }}
>
          {selectedYear <= 1973 ? (
            <option value="mx">MX</option>
          ) : (
            <>
              <option value="sx">SX</option>
              <option value="mx">MX</option>
            </>
          )}
        </select>

        {/* YEAR */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

    <select
  value={selectedClass}
  onChange={(e) => setSelectedClass(e.target.value)}
>
  {availableClasses.map((c) => (
    <option key={c} value={c}>{c}</option>
  ))}
</select>

    <button
      onClick={() => {
  navigate(`/season/${selectedSport}/${selectedYear}/${selectedClass}`, {
    replace: true
  });
}}
    >
      Go
    </button>

      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <section>
            <h2>
              {sport === "sx"
                ? "Main Event Performance"
                : "Overall Performance"}
            </h2>
            <div className="stats-table-wrapper">
              <MainStatsTable data={mainStats} sport={sport} />
            </div>
          </section>

          <section>
            <h2>
              {sport === "sx"
                ? "Qualifying / Heats / LCQs"
                : "Motos / Qualifying"}
            </h2>
            <div className="stats-table-wrapper">
              <StartStatsTable data={startStats} sport={sport} />
            </div>
          </section>

          <section>
            <h2>Race Control (Laps Led)</h2>
            <div className="laps-led-grid">
              <LapsLedPie data={lapsLedStats} sport={sport} />
            </div>
          </section>

          <section>
            <h2>Championship Progression</h2>
            <PointsProgressionChart data={pointsData} sport={sport} />
          </section>
        </>
      )}
    </div>
  );
}