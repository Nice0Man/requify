import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  memo,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Selective hook for theme value only (prevents re-renders on function changes)
export const useThemeValue = () => {
  const { theme } = useTheme();
  return theme;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Optimized ThemeProvider with memoization
export const ThemeProvider: React.FC<ThemeProviderProps> = memo(
  ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
      const savedTheme = localStorage.getItem("theme") as Theme;
      return savedTheme || "light";
    });

    // Memoized callbacks to prevent unnecessary re-renders of consumers
    const toggleTheme = useCallback(() => {
      setThemeState((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    }, []);

    const setTheme = useCallback((newTheme: Theme) => {
      setThemeState(newTheme);
    }, []);

    // Effect for persisting theme
    useEffect(() => {
      localStorage.setItem("theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    // Memoized context value to prevent provider re-renders
    const value = useMemo(
      (): ThemeContextValue => ({
        theme,
        toggleTheme,
        setTheme,
      }),
      [theme, toggleTheme, setTheme]
    );

    return (
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
  }
);

ThemeProvider.displayName = "ThemeProvider";
