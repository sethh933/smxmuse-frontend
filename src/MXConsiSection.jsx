import React, { useEffect, useState } from "react";
import MXConsiTable from "./MXConsiTable";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function MXConsiSection({ raceId, classId }) {
  const [consi, setConsi] = useState([]);
  const getClassName = (classId) => {
  if (classId === 1) return "450";
  if (classId === 2) return "250";
  if (classId === 3) return "500";
  return classId;
};

  useEffect(() => {
    fetch(
  `http://localhost:8000/api/race/consi?raceid=${raceId}&classid=${classId}`
)
      .then((res) => res.json())
      .then((data) => setConsi(data))
      .catch((err) => console.error(err));
  }, [raceId, classId]);

  return (
    <div>
      <h2 className="section-header">
  {getClassName(classId)} Consolation Race
</h2>
      <MXConsiTable data={consi} />
    </div>
  );
}

export default MXConsiSection;