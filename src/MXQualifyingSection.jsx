import React, { useEffect, useState } from "react";
import MXQualifyingTable from "./MXQualifyingTable";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function MXQualifyingSection({ raceId, classId, sportId }) {
  const [qualifying, setQualifying] = useState([]);
  const getClassName = (classId) => {
  if (classId === 1) return "450";
  if (classId === 2) return "250";
  if (classId === 3) return "500";
  return classId;
};

  useEffect(() => {
  fetch(`/api/race/qualifying?raceid=${raceId}&classid=${classId}&sport_id=${sportId}`)
    .then((res) => {
      if (!res.ok) throw new Error("API request failed");
      return res.json();
    })
    .then((data) => setQualifying(data))
    .catch((err) => console.error(err));
}, [raceId, classId, sportId]);

  if (!Array.isArray(qualifying) || qualifying.length === 0) {
    return null;
  }

  return (
  <div>
    <h2 className="section-header">
      {getClassName(classId)} Qualifying
    </h2>

    <MXQualifyingTable data={qualifying} />
  </div>
);
}

export default MXQualifyingSection;
