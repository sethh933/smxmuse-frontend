import { useCallback, useMemo, useState } from "react";
import { RaceSections } from "./raceSections";

export function RaceSectionProvider({ children }) {
  const [sections, setSections] = useState({});
  const register = useCallback((key, section) => {
    setSections(previous => {
      if (!section && !previous[key]) return previous;
      const next = { ...previous };
      if (section) next[key] = section;
      else delete next[key];
      return next;
    });
  }, []);
  const value = useMemo(() => ({ sections, register }), [sections, register]);
  return <RaceSections.Provider value={value}>{children}</RaceSections.Provider>;
}

