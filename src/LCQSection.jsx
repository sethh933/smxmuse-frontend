import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HeatRaceTable from "./HeatRaceTable";

/* -------------------------
   Coast label helper
------------------------- */
function getCoastLabel(results) {
  const coastIds = [
    ...new Set(
      results
        .map(r => r.ridercoastid)
        .filter(id => id !== null && id !== undefined)
    )
  ];

  if (coastIds.length === 1) {
    if (coastIds[0] === 1) return "West";
    if (coastIds[0] === 2) return "East";
    if (coastIds[0] === 3) return "East/West";
  }

  return "East/West";
}

export default function LCQSection({ classid }) {
  const { raceid } = useParams();
  const [lcqs, setLcqs] = useState([]);

  useEffect(() => {
    async function fetchLCQs() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/race/lcqs?raceid=${raceid}&classid=${classid}`
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
      : `Lites Class LCQ (${getCoastLabel(lcqs)})`;

  return (
    <div style={{ marginTop: 30 }}>
      <h3 className="class-header">{heading}</h3>
      <HeatRaceTable results={lcqs} />
    </div>
  );
}
