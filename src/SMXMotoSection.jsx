import React, { useEffect, useState } from "react";
import { apiUrl } from "./api";
import SMXMotoTable from "./SMXMotoTable";

function SMXMotoSection({ raceId, classId, moto }) {
  const [motos, setMotos] = useState([]);

  const getClassName = (classId) => {
    if (classId === 1) return "450";
    if (classId === 2) return "250";
    if (classId === 3) return "500";
    return classId;
  };

  useEffect(() => {
    fetch(apiUrl(`/api/race/smx-motos?raceid=${raceId}&classid=${classId}&moto=${moto}`))
      .then((res) => {
        if (!res.ok) throw new Error("API request failed");
        return res.json();
      })
      .then((data) => setMotos(data))
      .catch((err) => console.error(err));
  }, [raceId, classId, moto]);

  if (!Array.isArray(motos) || motos.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="section-header">
        {getClassName(classId)} Moto {moto}
      </h2>

      <SMXMotoTable data={motos} />
    </div>
  );
}

export default SMXMotoSection;
