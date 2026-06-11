"use client";

import { createContext, useContext, useState } from "react";
import {
  normalizeThemeId,
  THEME_COOKIE_MAX_AGE,
  THEME_STORAGE_KEY,
} from "@/lib/config/themePreference";

const ThemeContext = createContext({
  theme: "indian",
  setTheme: () => {},
});

export function ThemeProvider({ children, initialTheme = "indian" }) {
  const [theme, setThemeState] = useState(() => {
    const safeInitialTheme = normalizeThemeId(initialTheme);
    if (typeof window === "undefined") return safeInitialTheme;
    return normalizeThemeId(localStorage.getItem(THEME_STORAGE_KEY), safeInitialTheme);
  });

  const setTheme = (nextTheme) => {
    const safeTheme = normalizeThemeId(nextTheme);
    setThemeState(safeTheme);
    localStorage.setItem(THEME_STORAGE_KEY, safeTheme);
    document.cookie = `${THEME_STORAGE_KEY}=${safeTheme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
