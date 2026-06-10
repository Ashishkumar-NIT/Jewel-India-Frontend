"use client";

import { createContext, useContext, useState } from "react";

const ThemeContext = createContext({
  theme: "indian",
  setTheme: () => {},
});

export function ThemeProvider({ children, initialTheme = "indian" }) {
  const [theme, setTheme] = useState(initialTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
