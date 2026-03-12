import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { themes } from "../data/themes";

const ThemeCtx = createContext();

function getSavedPreference() {
  try {
    return localStorage.getItem("xsbl-theme"); // "dark" | "light" | null
  } catch (e) {
    return null;
  }
}

function getSystemPrefersDark() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return true;
}

function getInitialDark() {
  var saved = getSavedPreference();
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return getSystemPrefersDark();
}

function applyCssVars(themeObj) {
  var root = document.documentElement;
  Object.entries(themeObj).forEach(function ([key, value]) {
    var cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    root.style.setProperty("--" + cssKey, value);
  });
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(getInitialDark);
  const [hasExplicitPref, setHasExplicitPref] = useState(
    () => getSavedPreference() !== null
  );
  const t = dark ? themes.dark : themes.light;

  // Sync CSS custom properties whenever theme changes
  useEffect(
    function () {
      applyCssVars(t);
    },
    [dark, t]
  );

  // Listen for OS theme changes — only follow them if user hasn't set a manual preference
  useEffect(function () {
    if (typeof window === "undefined" || !window.matchMedia) return;
    var mql = window.matchMedia("(prefers-color-scheme: dark)");
    var handler = function (e) {
      // Only auto-switch if user hasn't explicitly toggled
      if (!getSavedPreference()) {
        setDark(e.matches);
      }
    };
    mql.addEventListener("change", handler);
    return function () {
      mql.removeEventListener("change", handler);
    };
  }, []);

  const toggle = useCallback(function () {
    setDark(function (d) {
      var next = !d;
      try {
        localStorage.setItem("xsbl-theme", next ? "dark" : "light");
      } catch (e) {}
      setHasExplicitPref(true);
      return next;
    });
  }, []);

  // Allow resetting to "follow system" (useful for a future settings UI)
  const followSystem = useCallback(function () {
    try {
      localStorage.removeItem("xsbl-theme");
    } catch (e) {}
    setHasExplicitPref(false);
    setDark(getSystemPrefersDark());
  }, []);

  return (
    <ThemeCtx.Provider
      value={{ t, dark, toggle, hasExplicitPref, followSystem }}
    >
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
