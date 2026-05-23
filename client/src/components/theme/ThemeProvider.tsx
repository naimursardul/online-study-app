import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};
type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
);

function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    return savedTheme || defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;

    // 1. Freeze all transitions to prevent Android Chrome GPU layer explosion
    root.classList.add("theme-transitioning");

    // 2. Apply theme on next frame so the freeze is painted first
    requestAnimationFrame(() => {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      localStorage.setItem(storageKey, theme);

      // 3. Unfreeze after paint settles
      requestAnimationFrame(() => {
        root.classList.remove("theme-transitioning");
      });
    });
  }, [theme, storageKey]);

  const setTheme = (theme: Theme) => setThemeState(theme);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

export { ThemeProvider, useTheme };
