"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState("fhenixlight");

  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // Default to light as requested
      setTheme("fhenixlight");
      document.documentElement.setAttribute("data-theme", "fhenixlight");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "fhenixlight" ? "fhenixdark" : "fhenixlight";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-sm hover:bg-base-200 border border-transparent hover:border-base-300 transition-all text-base-content/70 hover:text-base-content"
      title={`Switch to ${theme === "fhenixlight" ? "dark" : "light"} mode`}
    >
      {theme === "fhenixlight" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
};

