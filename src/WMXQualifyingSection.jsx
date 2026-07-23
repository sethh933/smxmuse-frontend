import React, { useEffect, useState } from "react";
import { apiUrl } from "./api";
import MXQualifyingTable from "./MXQualifyingTable";

function WMXQualifyingSection({ raceId }) {
  const [qualifying, setQualifying] = useState([]);

  useEffect(() => {
    fetch(apiUrl(`/api/race/wmx-qualifying?raceid=${raceId}`))
      .then((res) => {
        if (!res.ok) throw new Error("API request failed");
        return res.json();
      })
      .then((data) => setQualifying(data))
      .catch((err) => console.error(err));
  }, [raceId]);

  if (!Array.isArray(qualifying) || qualifying.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="section-header">WMX Qualifying</h2>
      <MXQualifyingTable
        data={qualifying}
        raceId={raceId}
        classId={0}
        sportId={4}
        detailEndpoint="/api/race/wmx-qualifying-rider-details"
      />
    </div>
  );
}

export default WMXQualifyingSection;
