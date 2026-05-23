import React, { useEffect, useState } from "react";
import MXOverallsTable from "./MXOverallsTable";
import { apiUrl } from "./api";

function MXOverallsSection({ raceId, classId, sportId = 2, onLoaded }) {
  const [overalls, setOveralls] = useState([]);
  const [loading, setLoading] = useState(true);

  const getClassName = (classId) => {
    if (classId === 1) return "450";
    if (classId === 2) return "250";
    if (classId === 3) return "500";
    return classId;
  };

  useEffect(() => {
    let isCurrent = true;

    async function fetchOveralls() {
      setLoading(true);

      try {
        const res = await fetch(
          apiUrl(`/api/race/overalls?raceid=${raceId}&classid=${classId}&sport_id=${sportId}`)
        );

        if (!res.ok) {
          throw new Error("API request failed");
        }

        const data = await res.json();

        if (!isCurrent) return;

        setOveralls(data);
        setLoading(false);
        onLoaded?.(classId);
      } catch (err) {
        if (!isCurrent) return;

        console.error("Failed to fetch MX overalls:", err);
        setLoading(false);
        onLoaded?.(classId);
      }
    }

    fetchOveralls();

    return () => {
      isCurrent = false;
    };
  }, [raceId, classId, sportId, onLoaded]);

  if (loading) return <p>Loading Overalls...</p>;

  return (
    <div>
      <h2 className="section-header">
        {getClassName(classId)} Overall Results
      </h2>

      <MXOverallsTable data={overalls} />
    </div>
  );
}

export default MXOverallsSection;
