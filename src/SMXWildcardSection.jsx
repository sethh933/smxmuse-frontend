import React, { useEffect, useState } from "react";
import { apiUrl } from "./api";
import MXConsiTable from "./MXConsiTable";

function SMXWildcardSection({ raceId, classId }) {
  const [wildcard, setWildcard] = useState([]);

  const getClassName = (classId) => {
    if (classId === 1) return "450";
    if (classId === 2) return "250";
    if (classId === 3) return "500";
    return classId;
  };

  useEffect(() => {
    fetch(apiUrl(`/api/race/smx-wildcard?raceid=${raceId}&classid=${classId}`))
      .then((res) => {
        if (!res.ok) throw new Error("API request failed");
        return res.json();
      })
      .then((data) => setWildcard(data))
      .catch((err) => console.error(err));
  }, [raceId, classId]);

  if (!Array.isArray(wildcard) || wildcard.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="section-header">
        {getClassName(classId)} Wildcard
      </h2>

      <MXConsiTable data={wildcard} />
    </div>
  );
}

export default SMXWildcardSection;
