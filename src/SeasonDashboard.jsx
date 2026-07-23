import { useEffect, useState } from "react";
import { MainStatsTable } from "./MainStatsTable";
import { StartStatsTable } from "./StartStatsTable";
import { LapsLedPie } from "./LapsLedPie";
import { PointsProgressionChart } from "./PointsProgressionChart";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "./api";
import Seo from "./SiteSeo";

const START_YEAR = 1972;
const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i
);

function getSeasonLabel(classId, sport) {
  if (sport === "wmx") return "WMX";

  const classLabel =
    classId === "250W"
      ? "250 West"
      : classId === "250E"
      ? "250 East"
      : classId;

  const sportLabel = sport === "sx" ? "Supercross" : sport === "mx" ? "Motocross" : "SMX";
  return `${classLabel} ${sportLabel}`;
}

export default function SeasonDashboard() {
  const { sport, year: yearParam, classId } = useParams();
  const navigate = useNavigate();
  const [classCache, setClassCache] = useState({});

  const year = Number(yearParam);

  const [selectedSport, setSelectedSport] = useState(sport);
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedClass, setSelectedClass] = useState(classId);
  const [availableClasses, setAvailableClasses] = useState([]);
  const selectableYears = selectedSport === "smx"
    ? YEARS.filter((y) => y >= 2023)
    : selectedSport === "wmx"
    ? YEARS.filter((y) => y >= 1998)
    : YEARS;

  useEffect(() => {
    setSelectedSport(sport);
    setSelectedYear(year);
    setSelectedClass(classId);
  }, [sport, year, classId]);

  useEffect(() => {
    if (selectedSport === "smx" && selectedYear < 2023) {
      setSelectedYear(2023);
    } else if (selectedSport === "wmx" && selectedYear < 1998) {
      setSelectedYear(1998);
    }
  }, [selectedSport, selectedYear]);

  useEffect(() => {
    async function loadClasses() {
      if (selectedSport === "wmx") {
        setAvailableClasses([]);
        return;
      }

      const key = `${selectedSport}-${selectedYear}`;

      if (classCache[key]) {
        setAvailableClasses(classCache[key]);
        return;
      }

      const sportId = selectedSport === "sx" ? 1 : selectedSport === "mx" ? 2 : 3;
      const res = await fetch(apiUrl(`/api/available-classes?sport_id=${sportId}&year=${selectedYear}`));
      const data = await res.json();

      const mapped = data
        .map((c) => c.ClassID ?? c.classid)
        .filter(Boolean)
        .sort((a, b) => a - b)
        .flatMap((id) => {
          if (id === 1) return ["450"];
          if (id === 2) return selectedSport === "sx" ? ["250W", "250E"] : ["250"];
          if (id === 3) return ["500"];
          return [];
        });

      setClassCache((prev) => ({ ...prev, [key]: mapped }));
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

      let mainUrl;
      let startUrl;
      let lapsUrl;
      let pointsUrl;

      if (sport === "sx") {
        mainUrl = `/api/season/main-stats?year=${year}&sportid=1&classid=${apiClassId}${riderCoastId ? `&ridercoastid=${riderCoastId}` : ""}`;
        startUrl = `/api/season/start-stats?year=${year}&sportid=1&classid=${apiClassId}${riderCoastId ? `&ridercoastid=${riderCoastId}` : ""}`;
        lapsUrl = `/api/season/laps-led?year=${year}&sportid=1&classid=${apiClassId}${riderCoastId ? `&ridercoastid=${riderCoastId}` : ""}`;
        pointsUrl = `/api/season/points-progression?year=${year}&sportid=1&classid=${apiClassId}${riderCoastId ? `&ridercoastid=${riderCoastId}` : ""}`;
      } else if (sport === "wmx") {
        mainUrl = `/api/wmx/season/overall?year=${year}`;
        startUrl = `/api/wmx/season/moto-qual?year=${year}`;
        lapsUrl = `/api/wmx/season/laps-led?year=${year}`;
        pointsUrl = `/api/wmx/season/points-progression?year=${year}`;
      } else {
        const seasonPrefix = sport === "smx" ? "smx" : "mx";
        mainUrl = `/api/${seasonPrefix}/season/overall?year=${year}&classid=${apiClassId}`;
        startUrl = `/api/${seasonPrefix}/season/moto-qual?year=${year}&classid=${apiClassId}`;
        lapsUrl = `/api/${seasonPrefix}/season/laps-led?year=${year}&classid=${apiClassId}`;
        pointsUrl = `/api/${seasonPrefix}/season/points-progression?year=${year}&classid=${apiClassId}`;
      }

      const requests = [
        fetch(apiUrl(mainUrl)),
        fetch(apiUrl(startUrl)),
        fetch(apiUrl(lapsUrl))
      ];

      if (pointsUrl) {
        requests.push(fetch(apiUrl(pointsUrl)));
      }

      const [mainRes, startRes, lapsRes, pointsRes] = await Promise.all(requests);

      setMainStats(await mainRes.json());
      setStartStats(await startRes.json());
      setLapsLedStats(await lapsRes.json());
      setPointsData(pointsRes ? await pointsRes.json() : []);
      setLoading(false);
    }

    loadData();
  }, [year, classId, sport]);

  return (
    <div className="season-dashboard">
      <Seo
        title={`${year} ${getSeasonLabel(classId, sport)} Season Dashboard`}
        description={`Explore ${year} ${getSeasonLabel(classId, sport)} standings, stats, laps led, and championship progression on smxmuse.`}
        path={`/season/${sport}/${year}/${classId}`}
      />
      <section className="season-dashboard-hero">
        <p className="results-home-kicker">Season dashboard</p>
        <h1>{year} {getSeasonLabel(classId, sport)}</h1>
        <p className="season-dashboard-intro">
          Track the totals and averages from each rider over the course of a season, then switch
          sport, year, or class to jump into another season long deep dive.
        </p>

        <div className="filters">
          <div className="filters-inner">
            <select
              value={selectedSport}
              onChange={(e) => {
                const newSport = e.target.value;
                setSelectedSport(newSport);
                if (newSport === "smx" && selectedYear < 2023) {
                  setSelectedYear(2023);
                } else if (newSport === "wmx" && selectedYear < 1998) {
                  setSelectedYear(1998);
                }
                setSelectedClass(newSport === "wmx" ? "wmx" : "450");
              }}
            >
              {selectedYear <= 1973 ? (
                <option value="mx">MX</option>
              ) : (
                <>
                  <option value="sx">SX</option>
                  <option value="mx">MX</option>
                  <option value="smx">SMX</option>
                  <option value="wmx">WMX</option>
                </>
              )}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {selectableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {selectedSport !== "wmx" && (
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {availableClasses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            <button
              onClick={() =>
                navigate(`/season/${selectedSport}/${selectedYear}/${selectedSport === "wmx" ? "wmx" : selectedClass}`, {
                  replace: true
                })
              }
            >
              Go
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <section className="season-dashboard-section">
            <h2>{sport === "sx" ? "Main Event Performance" : "Overall Performance"}</h2>
            <div className="stats-table-wrapper">
              <MainStatsTable data={mainStats} sport={sport} />
            </div>
          </section>

          <section className="season-dashboard-section">
            <h2>{sport === "sx" ? "Qualifying / Heats / LCQs" : "Motos / Qualifying"}</h2>
            <div className="stats-table-wrapper">
              <StartStatsTable data={startStats} sport={sport} year={year} />
            </div>
          </section>

          {(sport !== "sx" || year >= 2003) && (
            <section className="season-dashboard-section">
              <h2>Race Control (Laps Led)</h2>
              <div className="laps-led-grid">
                <LapsLedPie data={lapsLedStats} sport={sport} mainStats={mainStats} />
              </div>
            </section>
          )}

          <section className="season-dashboard-section">
            <h2>Championship Progression (Top Five in Points)</h2>
            <PointsProgressionChart data={pointsData} sport={sport} mainStats={mainStats} />
          </section>
        </>
      )}
    </div>
  );
}
