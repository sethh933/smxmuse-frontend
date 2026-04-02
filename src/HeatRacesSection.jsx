import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HeatRaceTable from "./HeatRaceTable";

/* -------------------------
   Coast label helper
------------------------- */
function getCoastLabel(results) {
  const coastId = results?.[0]?.coastid;

  if (coastId === 1) return "West";
  if (coastId === 2) return "East";
  if (coastId === 3) return "East/West";

  return "";
}

export default function HeatRacesSection({ classid }) {
  const { raceid } = useParams();
  const [heats, setHeats] = useState({});

  useEffect(() => {
    async function fetchHeats() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/race/heats?raceid=${raceid}&classid=${classid}`
        );
        const data = await res.json();
        setHeats(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchHeats();
  }, [raceid, classid]);

  return (
    <div style={{ marginTop: 30 }}>
      {Object.keys(heats).map((heatNum) => {
        const results = heats[heatNum];

        const heading =
          classid === 1
            ? `Premier Class Heat ${heatNum}`
            : `Lites Class Heat ${heatNum} (${getCoastLabel(results)})`;

        return (
          <div key={heatNum} style={{ marginBottom: 24 }}>
            <h3 className="class-header">{heading}</h3>
            <HeatRaceTable results={results} />
          </div>
        );
      })}
    </div>
  );
}
