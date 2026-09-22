import { useRaceSection } from "./raceSections";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QualifyingTable from "./QualifyingTable";
import { apiUrl } from "./api";
import { parseRaceId } from "./seo";

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
  const { raceid: raceParam } = useParams();
  const raceid = parseRaceId(raceParam);
  const [results, setResults] = useState([]);
  const sectionId = useRaceSection("qualifying", Array.isArray(results) && results.length > 0);

  useEffect(() => {
  async function fetchQualifying() {
    try {
      const sportId = 1; // 👈 this is SX

      const res = await fetch(
        apiUrl(`/api/race/qualifying?raceid=${raceid}&classid=${classid}&sport_id=${sportId}`)
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
    <div id={sectionId} className="race-jump-target" style={{ marginTop: 30 }}>
      <h3 className="class-header">{heading}</h3>
      <QualifyingTable
        results={results}
        raceId={raceid}
        classId={classid}
      />
    </div>
  );
}
