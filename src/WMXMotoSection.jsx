import React, { useEffect, useState } from "react";
import { apiUrl } from "./api";
import SMXMotoTable from "./SMXMotoTable";

function WMXMotoSection({ raceId, moto }) {
  const [motos, setMotos] = useState([]);

  useEffect(() => {
    fetch(apiUrl(`/api/race/wmx-motos?raceid=${raceId}&moto=${moto}`))
      .then((res) => {
        if (!res.ok) throw new Error("API request failed");
        return res.json();
      })
      .then((data) => setMotos(data))
      .catch((err) => console.error(err));
  }, [raceId, moto]);

  if (!Array.isArray(motos) || motos.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="section-header">WMX Moto {moto}</h2>
      <SMXMotoTable
        data={motos}
        raceId={raceId}
        classId={0}
        moto={moto}
        detailEndpoint="/api/race/wmx-moto-rider-details"
        startLabel="Lap1Pos"
        showHoleshotLine
      />
    </div>
  );
}

export default WMXMotoSection;
