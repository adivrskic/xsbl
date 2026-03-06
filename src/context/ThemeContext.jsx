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

function applyCssVars(themeObj) {
  var root = document.documentElement;
  Object.entries(themeObj).forEach(function ([key, value]) {
    // Convert camelCase to kebab-case: paperWarm -> paper-warm
    var cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    root.style.setProperty("--" + cssKey, value);
  });
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(getInitialDark);
  const t = dark ? themes.dark : themes.light;

  // Sync CSS custom properties whenever theme changes
  useEffect(
    function () {
      applyCssVars(t);
    },
    [dark, t]
  );

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
