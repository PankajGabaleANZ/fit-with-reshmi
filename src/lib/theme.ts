import { useState, useEffect } from "react";

export type ThemeMode = "light" | "dark";
export type ThemeStyle = "peach" | "classic" | "earthy";

// Save to localStorage and apply to DOM on load or change
export function applyTheme(mode: ThemeMode, style: ThemeStyle) {
  localStorage.setItem("theme-mode", mode);
  localStorage.setItem("theme-style", style);

  const root = document.documentElement;
  const body = document.body;

  // Apply Light/Dark mode
  if (mode === "dark") {
    root.classList.add("theme-dark");
    body.classList.add("theme-dark");
    body.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("theme-dark");
    body.classList.remove("theme-dark");
    body.removeAttribute("data-theme");
  }

  // Apply Theme Style
  body.setAttribute("data-style-theme", style);
  root.setAttribute("data-style-theme", style);
}

// Custom listeners for cross-component reactivity
let listeners: (() => void)[] = [];

export function subscribeToTheme(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function notifyThemeChange() {
  listeners.forEach((l) => l());
}

export function getThemeSettings() {
  // Safe SSR / Browser environment check
  if (typeof window === "undefined") {
    return { mode: "light" as ThemeMode, style: "peach" as ThemeStyle };
  }
  const mode = (localStorage.getItem("theme-mode") as ThemeMode) || "light";
  // Always lock to vibrant peach theme
  const style: ThemeStyle = "peach";
  return { mode, style };
}

export function setThemeSettings(mode: ThemeMode, style: ThemeStyle) {
  applyTheme(mode, style);
  notifyThemeChange();
}

/**
 * Reactive hook to use centralized, synchronized theme settings anywhere.
 */
export function useTheme() {
  const [settings, setSettings] = useState(getThemeSettings);

  useEffect(() => {
    // Initial boot apply on first layout
    const { mode, style } = getThemeSettings();
    applyTheme(mode, style);

    const handleSync = () => {
      setSettings(getThemeSettings());
    };
    const unsubscribe = subscribeToTheme(handleSync);
    return unsubscribe;
  }, []);

  const toggleMode = () => {
    const nextMode: ThemeMode = settings.mode === "light" ? "dark" : "light";
    setThemeSettings(nextMode, settings.style);
  };

  const setStyle = (style: ThemeStyle) => {
    setThemeSettings(settings.mode, style);
  };

  return {
    mode: settings.mode,
    style: settings.style,
    isDark: settings.mode === "dark",
    toggleMode,
    setStyle,
  };
}
