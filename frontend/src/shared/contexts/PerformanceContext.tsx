import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
  memo,
} from "react";

// =============================================================================
// Context Splitting - Separate contexts for different concerns
// =============================================================================

// 1. UI State Context (changes frequently)
interface UIState {
  isLoading: boolean;
  isSidebarCollapsed: boolean;
  theme: "light" | "dark";
  layoutMode: "grid" | "list";
}

interface UIContextValue {
  state: UIState;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setLayoutMode: (mode: "grid" | "list") => void;
  setLoading: (loading: boolean) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

// 2. User Context (changes less frequently)
interface UserState {
  user: {
    id: string;
    name: string;
    email: string;
    preferences: Record<string, any>;
  } | null;
}

interface UserContextValue {
  state: UserState;
  updateUser: (user: Partial<UserState["user"]>) => void;
  updatePreferences: (preferences: Record<string, any>) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

// 3. App Settings Context (rarely changes)
interface AppSettingsState {
  locale: string;
  timezone: string;
  features: Record<string, boolean>;
}

interface AppSettingsContextValue {
  state: AppSettingsState;
  updateLocale: (locale: string) => void;
  updateTimezone: (timezone: string) => void;
  toggleFeature: (feature: string) => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

// =============================================================================
// Optimized Providers with Memoization
// =============================================================================

// UI Provider - Most frequently changing context
export const UIProvider: React.FC<{ children: React.ReactNode }> = memo(
  ({ children }) => {
    const [state, setState] = useState<UIState>(() => ({
      isLoading: false,
      isSidebarCollapsed: localStorage.getItem("sidebar-collapsed") === "true",
      theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
      layoutMode:
        (localStorage.getItem("layout-mode") as "grid" | "list") || "grid",
    }));

    // Memoized callbacks to prevent unnecessary re-renders
    const toggleSidebar = useCallback(() => {
      setState((prev) => {
        const newCollapsed = !prev.isSidebarCollapsed;
        localStorage.setItem("sidebar-collapsed", String(newCollapsed));
        return { ...prev, isSidebarCollapsed: newCollapsed };
      });
    }, []);

    const toggleTheme = useCallback(() => {
      setState((prev) => {
        const newTheme = prev.theme === "light" ? "dark" : "light";
        localStorage.setItem("theme", newTheme);
        return { ...prev, theme: newTheme };
      });
    }, []);

    const setLayoutMode = useCallback((mode: "grid" | "list") => {
      setState((prev) => {
        localStorage.setItem("layout-mode", mode);
        return { ...prev, layoutMode: mode };
      });
    }, []);

    const setLoading = useCallback((loading: boolean) => {
      setState((prev) => ({ ...prev, isLoading: loading }));
    }, []);

    // Memoized context value to prevent unnecessary provider re-renders
    const value = useMemo(
      (): UIContextValue => ({
        state,
        toggleSidebar,
        toggleTheme,
        setLayoutMode,
        setLoading,
      }),
      [state, toggleSidebar, toggleTheme, setLayoutMode, setLoading]
    );

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
  }
);

UIProvider.displayName = "UIProvider";

// User Provider - Medium frequency changes
export const UserProvider: React.FC<{ children: React.ReactNode }> = memo(
  ({ children }) => {
    const [state, setState] = useState<UserState>(() => ({
      user: JSON.parse(localStorage.getItem("user") || "null"),
    }));

    const updateUser = useCallback((userUpdate: Partial<UserState["user"]>) => {
      setState((prev) => {
        if (!prev.user) return prev;

        const newUser = { ...prev.user, ...userUpdate };
        localStorage.setItem("user", JSON.stringify(newUser));
        return { ...prev, user: newUser };
      });
    }, []);

    const updatePreferences = useCallback(
      (preferences: Record<string, any>) => {
        setState((prev) => {
          if (!prev.user) return prev;

          const newUser = {
            ...prev.user,
            preferences: { ...prev.user.preferences, ...preferences },
          };
          localStorage.setItem("user", JSON.stringify(newUser));
          return { ...prev, user: newUser };
        });
      },
      []
    );

    const value = useMemo(
      (): UserContextValue => ({
        state,
        updateUser,
        updatePreferences,
      }),
      [state, updateUser, updatePreferences]
    );

    return (
      <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
  }
);

UserProvider.displayName = "UserProvider";

// App Settings Provider - Rarely changes
export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> =
  memo(({ children }) => {
    const [state, setState] = useState<AppSettingsState>(() => ({
      locale: localStorage.getItem("locale") || "en",
      timezone: localStorage.getItem("timezone") || "UTC",
      features: JSON.parse(localStorage.getItem("features") || "{}"),
    }));

    const updateLocale = useCallback((locale: string) => {
      setState((prev) => {
        localStorage.setItem("locale", locale);
        return { ...prev, locale };
      });
    }, []);

    const updateTimezone = useCallback((timezone: string) => {
      setState((prev) => {
        localStorage.setItem("timezone", timezone);
        return { ...prev, timezone };
      });
    }, []);

    const toggleFeature = useCallback((feature: string) => {
      setState((prev) => {
        const newFeatures = {
          ...prev.features,
          [feature]: !prev.features[feature],
        };
        localStorage.setItem("features", JSON.stringify(newFeatures));
        return { ...prev, features: newFeatures };
      });
    }, []);

    const value = useMemo(
      (): AppSettingsContextValue => ({
        state,
        updateLocale,
        updateTimezone,
        toggleFeature,
      }),
      [state, updateLocale, updateTimezone, toggleFeature]
    );

    return (
      <AppSettingsContext.Provider value={value}>
        {children}
      </AppSettingsContext.Provider>
    );
  });

AppSettingsProvider.displayName = "AppSettingsProvider";

// =============================================================================
// Optimized Hooks with Selective Subscriptions
// =============================================================================

// Hook for UI state (used by components that need UI state)
export const useUIState = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUIState must be used within UIProvider");
  }
  return context;
};

// Selective hooks for specific UI state parts
export const useTheme = () => {
  const { state } = useUIState();
  return state.theme;
};

export const useSidebarState = () => {
  const { state, toggleSidebar } = useUIState();
  return {
    isCollapsed: state.isSidebarCollapsed,
    toggle: toggleSidebar,
  };
};

export const useLayoutMode = () => {
  const { state, setLayoutMode } = useUIState();
  return {
    mode: state.layoutMode,
    setMode: setLayoutMode,
  };
};

export const useLoadingState = () => {
  const { state, setLoading } = useUIState();
  return {
    isLoading: state.isLoading,
    setLoading,
  };
};

// Hook for user state
export const useUserState = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserState must be used within UserProvider");
  }
  return context;
};

// Selective hook for user preferences only
export const useUserPreferences = () => {
  const { state, updatePreferences } = useUserState();
  return {
    preferences: state.user?.preferences || {},
    updatePreferences,
  };
};

// Hook for app settings
export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return context;
};

// =============================================================================
// Combined Provider for Easy Setup
// =============================================================================

export const PerformanceOptimizedProviders: React.FC<{
  children: React.ReactNode;
}> = memo(({ children }) => {
  return (
    <AppSettingsProvider>
      <UserProvider>
        <UIProvider>{children}</UIProvider>
      </UserProvider>
    </AppSettingsProvider>
  );
});

PerformanceOptimizedProviders.displayName = "PerformanceOptimizedProviders";

// =============================================================================
// Performance Monitoring Hook
// =============================================================================

export const usePerformanceMonitor = () => {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());

  renderCount.current += 1;

  useEffect(() => {
    const renderTime = Date.now() - mountTime.current;
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Component rendered ${renderCount.current} times, mount time: ${renderTime}ms`
      );
    }
  });

  return {
    renderCount: renderCount.current,
    mountTime: mountTime.current,
  };
};

// =============================================================================
// Context Selector Hook for Granular Subscriptions
// =============================================================================

// Generic context selector to prevent unnecessary re-renders
export const useContextSelector = <T, R>(
  context: React.Context<T>,
  selector: (value: T) => R
): R => {
  const contextValue = useContext(context);
  const selectedValue = useRef<R>();
  const selectorRef = useRef(selector);

  // Update selector ref
  selectorRef.current = selector;

  // Memoize selected value
  const newSelectedValue = useMemo(() => {
    if (!contextValue) return undefined as R;
    return selectorRef.current(contextValue);
  }, [contextValue]);

  // Only update if value actually changed
  if (selectedValue.current !== newSelectedValue) {
    selectedValue.current = newSelectedValue;
  }

  return selectedValue.current as R;
};
