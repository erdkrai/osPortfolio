"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/settings";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme, accentColor } = useSettingsStore();

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute("data-theme", theme);

        // Apply accent color to CSS variable
        document.documentElement.style.setProperty("--accent-color", accentColor);
        document.documentElement.style.setProperty("--accent-color-hover", adjustBrightness(accentColor, -20));
    }, [theme, accentColor]);

    return <>{children}</>;
}

// Helper function to darken/lighten hex color
function adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    const clamp = (val: number) => Math.max(0, Math.min(255, val));
    return "#" + (
        0x1000000 +
        clamp(R) * 0x10000 +
        clamp(G) * 0x100 +
        clamp(B)
    ).toString(16).slice(1);
}