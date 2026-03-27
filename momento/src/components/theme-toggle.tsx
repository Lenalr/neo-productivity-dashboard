"use client";

import { useState } from "react";

const storageKey = "momento-theme";

function resolveInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  const saved = window.localStorage.getItem(storageKey);
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const resolved = saved === "dark" || saved === "light" ? saved : systemTheme;
  return (document.documentElement.dataset.theme as "light" | "dark") || resolved;
}

function applyTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(storageKey, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(resolveInitialTheme);

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      onClick={() => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
      suppressHydrationWarning
    >
      <span
        className={`theme-toggle__thumb theme-toggle__thumb--${theme}`}
        suppressHydrationWarning
      />
      <span className="theme-toggle__label" suppressHydrationWarning>
        {theme === "dark" ? "Dark" : "Light"}
      </span>
    </button>
  );
}
