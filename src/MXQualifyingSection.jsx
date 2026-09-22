import { useRaceSection } from "./raceSections";
import React, { useEffect, useState } from "react";
import MXQualifyingTable from "./MXQualifyingTable";
import { apiUrl } from "./api";

function MXQualifyingSection({ raceId, classId, sportId }) {
  const [qualifying, setQualifying] = useState([]);
  const sectionId = useRaceSection("qualifying", Array.isArray(qualifying) && qualifying.length > 0);
  const getClassName = (classId) => {
  if (classId === 1) return "450";
  if (classId === 2) return "250";
  if (classId === 3) return "500";
  return classId;
};

  useEffect(() => {
  fetch(apiUrl(`/api/race/qualifying?raceid=${raceId}&classid=${classId}&sport_id=${sportId}`))
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
  <div id={sectionId} className="race-jump-target">
    <h2 className="section-header">
      {getClassName(classId)} Qualifying
    </h2>

    <MXQualifyingTable
      key={`${raceId}-${classId}-${sportId}`}
      data={qualifying}
      raceId={raceId}
      classId={classId}
      sportId={sportId}
    />
  </div>
);
}

export default MXQualifyingSection;
