"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language } from "@/lib/i18n";

type Theme = "blue" | "green" | "purple" | "orange" | "dark";

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppContext = createContext<AppContextType>({
  theme: "blue",
  setTheme: () => {},
  language: "en",
  setLanguage: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
});

export const useApp = () => useContext(AppContext);

function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("blue");
  const [language, setLanguageState] = useState<Language>("en");
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sms-theme") as Theme;
    if (saved) setThemeState(saved);
    const savedLang = localStorage.getItem("sms-lang") as Language;
    if (savedLang) setLanguageState(savedLang);
    const savedCollapsed = localStorage.getItem("sms-sidebar-collapsed");
    if (savedCollapsed) setSidebarCollapsedState(savedCollapsed === "true");
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("sms-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem("sms-lang", l);
    if (l === "ar") {
      document.documentElement.setAttribute("dir", "rtl");
    } else {
      document.documentElement.removeAttribute("dir");
    }
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    localStorage.setItem("sms-sidebar-collapsed", String(collapsed));
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (language === "ar") {
      document.documentElement.setAttribute("dir", "rtl");
    }
  }, [theme, language]);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AppProvider>{children}</AppProvider>
    </SessionProvider>
  );
}
