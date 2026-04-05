import React, { useEffect, useState } from "react";
import MXConsiTable from "./MXConsiTable";
import { apiUrl } from "./api";

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
  apiUrl(`/api/race/consi?raceid=${raceId}&classid=${classId}`)
)
      .then((res) => res.json())
      .then((data) => setConsi(data))
      .catch((err) => console.error(err));
  }, [raceId, classId]);

  if (!Array.isArray(consi) || consi.length === 0) {
    return null;
  }

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
