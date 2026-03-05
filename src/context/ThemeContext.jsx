import { createContext, useContext, useState } from "react";
import { themes } from "../data/themes";

const ThemeCtx = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);
  const t = dark ? themes.dark : themes.light;
  const toggle = () => setDark((d) => !d);

  return (
    <ThemeCtx.Provider value={{ t, dark, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
