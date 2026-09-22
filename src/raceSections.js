import { createContext, useContext, useEffect, useId } from "react";

export const RaceSections = createContext(null);

export function useRaceSections() {
  return useContext(RaceSections)?.sections || {};
}

// Register only sections whose existing data request returned result rows.
export function useRaceSection(group, hasData) {
  const key = useId();
  const id = `race-section-${key.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const register = useContext(RaceSections)?.register;
  useEffect(() => {
    if (!register || !hasData) return;
    register(key, { group, id });
    return () => register(key, null);
  }, [register, key, group, id, hasData]);
  return id;
}
