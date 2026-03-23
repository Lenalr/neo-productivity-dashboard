"use client";

import styles from "./page.module.css";

type Theme = "light" | "dark";

const STORAGE_KEY = "momento-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export default function ThemeToggle() {
  const toggleTheme = () => {
    const currentTheme = document.documentElement.dataset.theme === "dark"
      ? "dark"
      : "light";
    const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <span className={styles.themeToggleTrack}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.themeIcon}>
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path
            d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
        <span className={styles.themeToggleThumb} />
        <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.themeIcon}>
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>
  );
}
