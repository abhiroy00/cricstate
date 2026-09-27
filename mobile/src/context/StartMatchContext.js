import { createContext, useCallback, useContext, useMemo, useState } from "react";

function emptySquads() {
  return { a: [], b: [] };
}

const StartMatchContext = createContext(null);

export function StartMatchProvider({ children }) {
  const [squads, setSquads] = useState(emptySquads);

  const resetSquads = useCallback(() => setSquads(emptySquads()), []);

  const value = useMemo(
    () => ({ squads, setSquads, resetSquads }),
    [squads, resetSquads]
  );

  return <StartMatchContext.Provider value={value}>{children}</StartMatchContext.Provider>;
}

export function useStartMatch() {
  const context = useContext(StartMatchContext);
  if (!context) {
    throw new Error("useStartMatch must be used within a StartMatchProvider");
  }
  return context;
}
