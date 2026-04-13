import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import SeasonDashboard from "./SeasonDashboard";
import Leaderboard1 from './Leaderboard1';
import Leaderboard2 from './Leaderboard2';
import Leaderboard3 from './Leaderboard3';
import Leaderboard4 from './Leaderboard4';
import RiderProfile from "./RiderProfile";
import MainEventSection from "./MainEventSection";
import TripleCrownMainsSection from "./TripleCrownMainsSection";
import HeatRacesSection from "./HeatRacesSection";
import LCQSection from "./LCQSection";
import QualifyingSection from "./QualifyingSection";
import RiderResults from "./RiderResults";
import MXOverallsSection from "./MXOverallsSection";
import MXQualifyingSection from "./MXQualifyingSection";
import MXConsiSection from "./MXConsiSection";
import RiderComparison from "./RiderComparison";
import TrackProfile from "./TrackProfile";
import CountriesPage from './CountriesPage';
import CountryPage from './CountryPage';
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import ResultsHome from './ResultsHome';
import ResultsYear from "./ResultsYear";
import RiderPoints from "./RiderPoints";
import SeasonRedirect from "./SeasonRedirect";
import { useLocation } from "react-router-dom";
import LandingPage from "./LandingPage";
import AboutPage from "./AboutPage";
import { apiUrl } from "./api";
import Seo from "./SiteSeo";
import { buildAbsoluteUrl, buildRacePath, buildTrackPath, parseRaceId, parseRiderId, parseTrackId } from "./seo";




function LeaderboardsPage() {
  const [sport, setSport] = useState("supercross");
  const [classId, setClassId] = useState(1);
  const [selectedRider, setSelectedRider] = useState(null);

  return (
    <div className="leaderboards-page">
      <Seo
        title="All-Time Supercross and Motocross Leaderboards"
        description="Browse all-time SMXmuse leaderboards for wins, podiums, starts, and career milestones across Supercross and Motocross."
        path="/leaderboards"
      />
      <section className="leaderboards-hero">
        <h1>All Time Leaderboards</h1>
        <p className="leaderboards-intro">
          Switch between disciplines and classes to compare the riders who sit at the top of the
          all-time stat categories.
        </p>

        <div className="leaderboards-toggle-stack">
          <div className="toggle-buttons leaderboards-toggle-buttons">
            <button
              onClick={() => {
                setSport("supercross");
                setClassId(1);
              }}
              className={sport === "supercross" ? "active" : ""}
            >
              SX
            </button>

            <button
              onClick={() => {
                setSport("motocross");
                setClassId(1);
              }}
              className={sport === "motocross" ? "active" : ""}
            >
              MX
            </button>
          </div>

          <div className="toggle-buttons leaderboards-toggle-buttons">
            <button
              onClick={() => setClassId(1)}
              className={classId === 1 ? "active" : ""}
            >
              450
            </button>

            <button
              onClick={() => setClassId(2)}
              className={classId === 2 ? "active" : ""}
            >
              250
            </button>

            {sport === "motocross" && (
              <button
                onClick={() => setClassId(3)}
                className={classId === 3 ? "active" : ""}
              >
                500
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid-container leaderboards-grid">
        <Leaderboard1
          sport={sport}
          classId={classId}
          selectedRider={selectedRider}
          setSelectedRider={setSelectedRider}
        />
        <Leaderboard2
          sport={sport}
          classId={classId}
          selectedRider={selectedRider}
          setSelectedRider={setSelectedRider}
        />
        <Leaderboard3
          sport={sport}
          classId={classId}
          selectedRider={selectedRider}
          setSelectedRider={setSelectedRider}
        />
        <Leaderboard4
          sport={sport}
          classId={classId}
          selectedRider={selectedRider}
          setSelectedRider={setSelectedRider}
        />
      </div>
    </div>
  );
}

function RacePage() {
  const { raceid: raceParam } = useParams();
  const raceid = parseRaceId(raceParam);
  const [raceHeader, setRaceHeader] = useState(null);
  const [mainEvent450, setMainEvent450] = useState([]);
  const [mainEvent250, setMainEvent250] = useState([]);
  const [tripleCrownMains, setTripleCrownMains] = useState(null);
  const [mxClasses, setMxClasses] = useState([]);

  // Fetch header (this determines SX vs MX)
  useEffect(() => {
    fetch(apiUrl(`/api/race-header?raceid=${raceid}`))
      .then(res => res.json())
      .then(data => setRaceHeader(data))
      .catch(err => console.error(err));
  }, [raceid]);

  useEffect(() => {
  if (!raceHeader || raceHeader.SportID !== 2) return;

  fetch(apiUrl(`/api/race/mx-classes?raceid=${raceid}`))
    .then(res => res.json())
    .then(data => {
      const classes = data.map(c => c.ClassID);

      // optional sort
      const order = { 1: 1, 3: 2, 2: 3 };

classes.sort((a, b) => order[a] - order[b]);

      setMxClasses(classes);
    })
    .catch(err => console.error(err));
}, [raceHeader, raceid]);

  // Fetch SX main event ONLY if SX
  useEffect(() => {
    if (!raceHeader || raceHeader.SportID !== 1) return;

    fetch(apiUrl(`/api/race/main-event?raceid=${raceid}`))
      .then(res => res.json())
      .then(data => {
        setMainEvent450(data.class450 || []);
        setMainEvent250(data.class250 || []);
      })
      .catch(err => console.error(err));
  }, [raceHeader, raceid]);

  useEffect(() => {
    if (!raceHeader || raceHeader.SportID !== 1 || raceHeader.TripleCrownID !== 1) {
      setTripleCrownMains(null);
      return;
    }

    fetch(apiUrl(`/api/race/triple-crown-mains?raceid=${raceid}`))
      .then(res => res.json())
      .then(data => setTripleCrownMains(data))
      .catch(err => console.error(err));
  }, [raceHeader, raceid]);

  if (!raceHeader) return <p>Loading...</p>;

  const isSX = raceHeader.SportID === 1;

  return (
    <div className="race-page" style={{ padding: 20 }}>
      <Seo
        title={`${raceHeader.Year} ${raceHeader.TrackName} ${isSX ? "Supercross" : "Motocross"} Results`}
        description={`View round ${raceHeader.Round} results, race data, and class breakdowns from ${raceHeader.TrackName} in the ${raceHeader.Year} ${isSX ? "Supercross" : "Motocross"} season.`}
        path={buildRacePath(raceid, raceHeader.TrackName, raceHeader.Year, {
          sportId: raceHeader.SportID,
          city: raceHeader.City
        })}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          name: `${raceHeader.Year} ${raceHeader.TrackName} ${isSX ? "Supercross" : "Motocross"}`,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          sport: isSX ? "Supercross" : "Motocross",
          startDate: `${raceHeader.Year}`,
          url: buildAbsoluteUrl(buildRacePath(raceid, raceHeader.TrackName, raceHeader.Year, {
            sportId: raceHeader.SportID,
            city: raceHeader.City
          }))
        }}
      />

      <h1 style={{ textAlign: "center" }}>
        <Link to={buildTrackPath(raceHeader.SportID, raceHeader.TrackID, raceHeader.TrackName)}>
          {raceHeader.TrackName}
        </Link>
      </h1>

      <p style={{ textAlign: "center", color: "#aaa", marginTop: "-10px" }}>
        {`Round ${raceHeader.Round} of ${raceHeader.MaxRound} • ${raceHeader.Year}`}
      </p>

      {isSX ? (
        <>
          {/* SUPERcross */}
          <MainEventSection
            class450={mainEvent450}
            class250={mainEvent250}
            raceCoastId={raceHeader.CoastID}
            raceYear={raceHeader.Year}
            sportId={raceHeader.SportID}
            tripleCrownId={raceHeader.TripleCrownID}
          />

          <HeatRacesSection classid={1} raceCoastId={raceHeader.CoastID} />
          <HeatRacesSection classid={2} raceCoastId={raceHeader.CoastID} />
          {raceHeader.TripleCrownID === 1 && (
            <TripleCrownMainsSection
              mains={tripleCrownMains}
              raceCoastId={raceHeader.CoastID}
              raceYear={raceHeader.Year}
              sportId={raceHeader.SportID}
            />
          )}
          <LCQSection classid={1} raceCoastId={raceHeader.CoastID} />
          <LCQSection classid={2} raceCoastId={raceHeader.CoastID} />
          <QualifyingSection classid={1} sportId={1} raceCoastId={raceHeader.CoastID} />
          <QualifyingSection classid={2} sportId={1} raceCoastId={raceHeader.CoastID} />
        </>
      ) : (
        <>
          {/* MOTOcross */}

{mxClasses.map(classId => (
  <MXOverallsSection key={`overall-${classId}`} raceId={raceid} classId={classId} />
))}

{mxClasses.map(classId => (
  <MXQualifyingSection key={`qual-${classId}`} raceId={raceid} classId={classId} sportId={2} />
))}

{mxClasses.map(classId => (
  <MXConsiSection key={`consi-${classId}`} raceId={raceid} classId={classId} />
))}
        </>
      )}
    </div>
  );
}

function SeasonRouteWrapper() {
  const location = useLocation();
  return <SeasonDashboard key={location.pathname} />;
}

function RiderProfileRouteWrapper() {
  const { riderId } = useParams();
  return <RiderProfile key={parseRiderId(riderId)} />;
}

function RiderResultsRouteWrapper() {
  const { riderId } = useParams();
  return <RiderResults key={parseRiderId(riderId)} />;
}

function RiderPointsRouteWrapper() {
  const { riderId } = useParams();
  return <RiderPoints key={parseRiderId(riderId)} />;
}

function TrackProfileRouteWrapper() {
  const { track_id } = useParams();
  return <TrackProfile key={parseTrackId(track_id)} />;
}

function RacePageRouteWrapper() {
  const { raceid } = useParams();
  return <RacePage key={parseRaceId(raceid)} />;
}

function LegacyCountryRedirect() {
  const { country } = useParams();
  return <Navigate to={`/riders/${country}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Navbar />
        <div className="page-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/leaderboards" element={<LeaderboardsPage />} />
            <Route path="/season" element={<SeasonRedirect />} />
            <Route
  path="/season/:sport/:year/:classId"
  element={<SeasonRouteWrapper />}
/>
            <Route path="/race/:raceid" element={<RacePageRouteWrapper />} />
            <Route path="/rider/:riderId" element={<RiderProfileRouteWrapper />} />
            <Route path="/rider/:riderId/results" element={<RiderResultsRouteWrapper />} />
            <Route path="/compare" element={<RiderComparison />} />
            <Route path="/track/:sport_id/:track_id" element={<TrackProfileRouteWrapper />} />
            <Route path="/riders" element={<CountriesPage />} />
            <Route path="/riders/:country" element={<CountryPage />} />
            <Route path="/countries" element={<Navigate to="/riders" replace />} />
            <Route path="/countries/:country" element={<LegacyCountryRedirect />} />
            <Route path="/results" element={<ResultsHome />} />
            <Route path="/results/:sport/:year" element={<ResultsYear />} />
            <Route path="/rider/:riderId/points" element={<RiderPointsRouteWrapper />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
