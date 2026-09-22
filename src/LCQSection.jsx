import { useRaceSection } from "./raceSections";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HeatRaceTable from "./HeatRaceTable";
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

export default function LCQSection({ classid, raceCoastId }) {
  const { raceid: raceParam } = useParams();
  const raceid = parseRaceId(raceParam);
  const [lcqs, setLcqs] = useState([]);
  const sectionId = useRaceSection("heats", Array.isArray(lcqs) && lcqs.length > 0);

  useEffect(() => {
    async function fetchLCQs() {
      try {
        const res = await fetch(
          apiUrl(`/api/race/lcqs?raceid=${raceid}&classid=${classid}`)
        );
        const data = await res.json();
        setLcqs(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchLCQs();
  }, [raceid, classid]);

  if (!lcqs || lcqs.length === 0) return null;

  const heading =
    classid === 1
      ? "Premier Class LCQ"
      : `Lites Class LCQ (${getCoastLabel(raceCoastId, lcqs)})`;

  return (
    <div id={sectionId} className="race-jump-target" style={{ marginTop: 30 }}>
      <h3 className="class-header">{heading}</h3>
      <HeatRaceTable results={lcqs} />
    </div>
  );
}
