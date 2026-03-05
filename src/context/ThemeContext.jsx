import { createContext, useContext, useState, useEffect } from "react";
import { themes } from "../data/themes";

const ThemeCtx = createContext();

function getInitialDark() {
  // Check localStorage first
  try {
    var saved = localStorage.getItem("xsbl-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
  } catch (e) {
    // localStorage unavailable
  }
  // Fall back to system preference
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return true;
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(getInitialDark);
  const t = dark ? themes.dark : themes.light;

  const toggle = () =>
    setDark((d) => {
      var next = !d;
      try {
        localStorage.setItem("xsbl-theme", next ? "dark" : "light");
      } catch (e) {
        // localStorage unavailable
      }
      return next;
    });

  return (
    <ThemeCtx.Provider value={{ t, dark, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
