import React, { useEffect, useState } from "react";
import MXOverallsTable from "./MXOverallsTable";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function MXOverallsSection({ raceId, classId }) {
  const [overalls, setOveralls] = useState([]);
  const [loading, setLoading] = useState(true);
  const getClassName = (classId) => {
  if (classId === 1) return "450";
  if (classId === 2) return "250";
  if (classId === 3) return "500";
  return classId;
};

  useEffect(() => {
    async function fetchOveralls() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/race/overalls?raceid=${raceId}&classid=${classId}`
        );

        if (!res.ok) {
          throw new Error("API request failed");
        }

        const data = await res.json();

        setOveralls(data);
        setLoading(false);   // ← missing

      } catch (err) {
        console.error("Failed to fetch MX overalls:", err);
        setLoading(false);   // ← also needed
      }
    }

    fetchOveralls();
  }, [raceId, classId]);

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