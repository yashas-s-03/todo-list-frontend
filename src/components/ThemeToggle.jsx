import React from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = ({ darkMode, setDarkMode }) => {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
    >
      {darkMode ? <Sun className="text-yellow-300" /> : <Moon className="text-black" />}
    </button>
  );
};

export default ThemeToggle;
