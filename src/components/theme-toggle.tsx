"use client";

import { useLayoutEffect } from "react";

export const THEME_STORAGE_KEY = "theme";

/**
 * Runs before first paint to apply the stored theme to <html>, so a user who
 * chose dark mode never sees a white flash on load. Falls back to the OS
 * setting when nothing has been stored yet. Keep in sync with
 * `toggleTheme` below.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

function setTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle() {
  // The inline script only runs on full page loads. React's dev Strict Mode
  // remounts the tree and resets <html> to the attributes it manages from JSX,
  // dropping the class the script set, so re-apply it here. No-op in production.
  useLayoutEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  function toggleTheme() {
    const next = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="rounded-md px-2 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      {/* Which icon shows is left to CSS, keyed off the .dark class, so the
          markup React hydrates always matches the DOM the script produced. */}
      <span aria-hidden="true" className="hidden dark:inline">
        ☀
      </span>
      <span aria-hidden="true" className="inline dark:hidden">
        ☾
      </span>
    </button>
  );
}