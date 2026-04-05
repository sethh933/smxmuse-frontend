import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiUrl } from "./api";

export default function SeasonRedirect() {
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    fetch(apiUrl("/season/current"))
      .then(res => res.json())
      .then(data => {
        if (data.sport && data.year) {
          setRedirectPath(`/season/${data.sport}/${data.year}/${data.classId}`);
        }
      })
      .catch(err => {
        console.error("Failed to fetch current season:", err);

        // fallback (just in case)
        setRedirectPath("/season/sx/2026/450");
      });
  }, []);

  // 🔥 wait until we have data
  if (!redirectPath) return null;

  return <Navigate to={redirectPath} replace />;
}
