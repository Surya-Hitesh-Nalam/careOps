import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem("careops_theme") || "light");
    const [accent, setAccent] = useState(() => localStorage.getItem("careops_accent") || "#6366f1");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("careops_theme", theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.style.setProperty("--accent", accent);
        const r = parseInt(accent.slice(1, 3), 16);
        const g = parseInt(accent.slice(3, 5), 16);
        const b = parseInt(accent.slice(5, 7), 16);
        document.documentElement.style.setProperty("--accent-light", `rgba(${r},${g},${b},0.1)`);
        document.documentElement.style.setProperty("--accent-lighter", `rgba(${r},${g},${b},0.05)`);
        document.documentElement.style.setProperty("--accent-hover", accent);
        localStorage.setItem("careops_accent", accent);
    }, [accent]);

    const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, accent, setAccent }}>
            {children}
        </ThemeContext.Provider>
    );
}
