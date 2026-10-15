import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useLocal } from "@/lib/store";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [stored, setTheme, ready] = useLocal<Theme>("wpa.theme", "light");
  const theme = stored === "dark" ? "dark" : "light";
  useEffect(() => {
    if (ready) document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, ready]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}