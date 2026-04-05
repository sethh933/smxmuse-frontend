import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QualifyingTable from "./QualifyingTable";

/* -------------------------
   Coast label helper
------------------------- */
function getCoastLabel(raceCoastId, results) {
  const coastId = raceCoastId ?? results?.[0]?.coastid;

  if (coastId === 1) return "West";
  if (coastId === 2) return "East";
  if (coastId === 3) return "East/West";

  return "";
}

export default function QualifyingSection({ classid, raceCoastId }) {
  const { raceid } = useParams();
  const [results, setResults] = useState([]);

  useEffect(() => {
  async function fetchQualifying() {
    try {
      const sportId = 1; // 👈 this is SX

      const res = await fetch(
        `/api/race/qualifying?raceid=${raceid}&classid=${classid}&sport_id=${sportId}`
      );

      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  }

  fetchQualifying();
}, [raceid, classid]);

  if (!results || results.length === 0) return null;

  const heading =
    classid === 1
      ? "Premier Class Qualifying"
      : `Lites Class Qualifying (${getCoastLabel(raceCoastId, results)})`;

  return (
    <div style={{ marginTop: 30 }}>
      <h3 className="class-header">{heading}</h3>
      <QualifyingTable results={results} />
    </div>
  );
}
