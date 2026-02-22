"use client";

import React from "react";
import { useWindowStore } from "@/store/windows";
import { useSettingsStore, IconSize } from "@/store/settings";
import { AppConfig } from "./Desktop";
import { clsx } from "clsx";

interface DesktopIconProps {
    app: AppConfig;
}

// Function that generates icons with dynamic size class
const getIconSvgs = (svgSizeClass: string): Record<string, React.ReactNode> => ({
    about: (
        /* GNOME Contacts — blue squircle, user silhouette */
        <svg viewBox="0 0 48 48" fill="none" className={`${svgSizeClass} drop-shadow-md`}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ico-about)" />
            <circle cx="24" cy="18" r="7" fill="white" />
            <path d="M12 42c0-8 5.4-13 12-13s12 5 12 13" fill="white" />
            <defs>
                <linearGradient id="ico-about" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3584e4" /><stop offset="1" stopColor="#1a5fb4" />
                </linearGradient>
            </defs>
        </svg>
    ),
    projects: (
        /* GNOME Builder — blueprint/code style */
        <svg viewBox="0 0 48 48" fill="none" className={`${svgSizeClass} drop-shadow-md`}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ico-proj)" />
            <rect x="10" y="8" width="28" height="32" rx="4" fill="white" fillOpacity="0.15" />
            <path d="M15 18l-4 5 4 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M33 18l4 5-4 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M27 14l-6 20" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <defs>
                <linearGradient id="ico-proj" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1c71d8" /><stop offset="1" stopColor="#1a5fb4" />
                </linearGradient>
            </defs>
        </svg>
    ),
    resume: (
        /* Evince / Document Viewer — document with fold */
        <svg viewBox="0 0 48 48" fill="none" className={`${svgSizeClass} drop-shadow-md`}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ico-res)" />
            <rect x="10" y="6" width="28" height="36" rx="3" fill="white" />
            <path d="M28 6v8h10" fill="#ddd" />
            <path d="M28 6l10 8" stroke="#ccc" strokeWidth="0.5" />
            <rect x="15" y="18" width="18" height="2" rx="1" fill="#c0392b" opacity="0.7" />
            <rect x="15" y="23" width="14" height="2" rx="1" fill="#bbb" />
            <rect x="15" y="28" width="16" height="2" rx="1" fill="#bbb" />
            <rect x="15" y="33" width="10" height="2" rx="1" fill="#bbb" />
            <defs>
                <linearGradient id="ico-res" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#e01b24" /><stop offset="1" stopColor="#c01c28" />
                </linearGradient>
            </defs>
        </svg>
    ),
    terminal: (
        /* GNOME Terminal — Ubuntu aubergine bg with prompt */
        <svg viewBox="0 0 48 48" fill="none" className={`${svgSizeClass} drop-shadow-md`}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ico-term)" />
            <path d="M12 18l7 6-7 6" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 32h14" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" opacity="0.7" />
            <defs>
                <linearGradient id="ico-term" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#300a24" /><stop offset="1" stopColor="#241f31" />
                </linearGradient>
            </defs>
        </svg>
    ),
    settings: (
        /* GNOME Settings — gear on gray */
        <svg viewBox="0 0 48 48" fill="none" className={`${svgSizeClass} drop-shadow-md`}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ico-settings)" />
            <path d="M24 10l2.2 3.8 4.3-.5 1.2 4.1-3.5 2.3.5 4.3H24h-4.7l.5-4.3-3.5-2.3 1.2-4.1 4.3.5z" fill="none" />
            <circle cx="24" cy="24" r="5" stroke="white" strokeWidth="2.5" fill="none" />
            <g stroke="white" strokeWidth="3" strokeLinecap="round">
                <line x1="24" y1="6" x2="24" y2="11" />
                <line x1="24" y1="37" x2="24" y2="42" />
                <line x1="6" y1="24" x2="11" y2="24" />
                <line x1="37" y1="24" x2="42" y2="24" />
                <line x1="11.3" y1="11.3" x2="14.8" y2="14.8" />
                <line x1="33.2" y1="33.2" x2="36.7" y2="36.7" />
                <line x1="36.7" y1="11.3" x2="33.2" y2="14.8" />
                <line x1="14.8" y1="33.2" x2="11.3" y2="36.7" />
            </g>
            <defs>
                <linearGradient id="ico-settings" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6d6d6d" /><stop offset="1" stopColor="#464646" />
                </linearGradient>
            </defs>
        </svg>
    ),
    photos: (
        /* Shotwell / Image Viewer — mountains + sun */
        <svg viewBox="0 0 48 48" fill="none" className={`${svgSizeClass} drop-shadow-md`}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ico-photos)" />
            <circle cx="16" cy="16" r="5" fill="#f6d32d" />
            <path d="M4 36l11-13 7 8 6-6 16 11H4z" fill="white" fillOpacity="0.9" />
            <defs>
                <linearGradient id="ico-photos" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#26a269" /><stop offset="1" stopColor="#1a8553" />
                </linearGradient>
            </defs>
        </svg>
    ),
    games: (
        /* GNOME Files / Nautilus folder — Ubuntu folder with gamepad overlay */
        <svg viewBox="0 0 48 48" fill="none" className={`${svgSizeClass} drop-shadow-md`}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ico-games)" />
            {/* Folder shape */}
            <path d="M8 14a2 2 0 012-2h8.5a2 2 0 011.6.8L22 15h16a2 2 0 012 2v17a2 2 0 01-2 2H10a2 2 0 01-2-2V14z" fill="white" fillOpacity="0.9" />
            {/* Gamepad icon inside folder */}
            <rect x="17" y="22" width="14" height="9" rx="3" fill="#5e5c64" />
            <circle cx="21" cy="26" r="1.2" fill="white" />
            <circle cx="27" cy="26" r="1.2" fill="white" />
            <rect x="23" y="24.5" width="2" height="3" rx="1" fill="white" fillOpacity="0.5" />
            <defs>
                <linearGradient id="ico-games" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#613583" /><stop offset="1" stopColor="#462a63" />
                </linearGradient>
            </defs>
        </svg>
    ),
    snake: (
        /* GNOME Games-style snake */
        <svg viewBox="0 0 48 48" fill="none" className={`${svgSizeClass} drop-shadow-md`}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ico-snake)" />
            <path d="M10 34c2-10 6-10 10-6s4 8 8 6 4-10 8-10 4 4 4 8" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="12" cy="27" r="2.5" fill="white" />
            <circle cx="11" cy="26" r="1" fill="#2ec27e" />
            <defs>
                <linearGradient id="ico-snake" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#26a269" /><stop offset="1" stopColor="#1a7a4c" />
                </linearGradient>
            </defs>
        </svg>
    ),
    tetris: (
        /* Quadrapassel-style — colored blocks */
        <svg viewBox="0 0 48 48" fill="none" className={`${svgSizeClass} drop-shadow-md`}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ico-tetris)" />
            <g opacity="0.95">
                <rect x="11" y="30" width="8" height="8" rx="1.5" fill="#33b2df" />
                <rect x="19" y="30" width="8" height="8" rx="1.5" fill="#33b2df" />
                <rect x="11" y="22" width="8" height="8" rx="1.5" fill="#33b2df" />
                <rect x="19" y="14" width="8" height="8" rx="1.5" fill="#e66100" />
                <rect x="19" y="22" width="8" height="8" rx="1.5" fill="#e66100" />
                <rect x="27" y="22" width="8" height="8" rx="1.5" fill="#e66100" />
                <rect x="27" y="30" width="8" height="8" rx="1.5" fill="#9141ac" />
            </g>
            <defs>
                <linearGradient id="ico-tetris" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#241f31" /><stop offset="1" stopColor="#1a1528" />
                </linearGradient>
            </defs>
        </svg>
    ),
    minesweeper: (
        /* GNOME Mines — bomb on dark grid */
        <svg viewBox="0 0 48 48" fill="none" className={`${svgSizeClass} drop-shadow-md`}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ico-mines)" />
            <circle cx="24" cy="25" r="8" fill="#333" />
            <circle cx="24" cy="25" r="6" fill="#555" />
            <g stroke="#333" strokeWidth="2.5" strokeLinecap="round">
                <line x1="24" y1="13" x2="24" y2="17" />
                <line x1="24" y1="33" x2="24" y2="37" />
                <line x1="13" y1="25" x2="17" y2="25" />
                <line x1="31" y1="25" x2="35" y2="25" />
                <line x1="16.2" y1="17.2" x2="19" y2="20" />
                <line x1="29" y1="30" x2="31.8" y2="32.8" />
                <line x1="31.8" y1="17.2" x2="29" y2="20" />
                <line x1="19" y1="30" x2="16.2" y2="32.8" />
            </g>
            <circle cx="21.5" cy="22.5" r="2" fill="white" fillOpacity="0.5" />
            <rect x="22" y="9" width="4" height="4" rx="2" fill="#e01b24" />
            <defs>
                <linearGradient id="ico-mines" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#77767b" /><stop offset="1" stopColor="#504e55" />
                </linearGradient>
            </defs>
        </svg>
    ),
    music: (
        /* Rhythmbox / GNOME Music — note on orange */
        <svg viewBox="0 0 48 48" fill="none" className={`${svgSizeClass} drop-shadow-md`}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ico-music)" />
            <path d="M20 34V16l14-4v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="16" cy="34" r="4" fill="white" />
            <circle cx="30" cy="30" r="4" fill="white" />
            <defs>
                <linearGradient id="ico-music" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#e66100" /><stop offset="1" stopColor="#c64600" />
                </linearGradient>
            </defs>
        </svg>
    ),
});

export function DesktopIcon({ app }: DesktopIconProps) {
    const { openWindow, windows } = useWindowStore();
    const { iconSize, accentColor } = useSettingsStore();
    const isOpen = windows.some((w) => w.appId === app.appId);

    const iconSizeClasses: Record<IconSize, { svg: string; container: string; text: string }> = {
        small: { svg: "w-8 h-8", container: "w-[64px]", text: "text-[10px]" },
        medium: { svg: "w-10 h-10", container: "w-[72px]", text: "text-[11px]" },
        large: { svg: "w-12 h-12", container: "w-[80px]", text: "text-[12px]" },
    };

    const sizeClasses = iconSizeClasses[iconSize];
    const icons = getIconSvgs(sizeClasses.svg);

    const handleOpen = (e: React.MouseEvent | React.KeyboardEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        openWindow({
            appId: app.appId,
            title: app.title,
            defaultSize: app.defaultSize,
            originRect: { x: rect.left, y: rect.top, w: rect.width, h: rect.height }
        });
    };

    return (
        <button
            className={clsx(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-lg group",
                sizeClasses.container,
                "transition-all duration-150 cursor-default",
                "hover:bg-white/10 focus:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]/60"
            )}
            onDoubleClick={handleOpen}
            onClick={(e) => e.currentTarget.focus()}
            onKeyDown={(e) => e.key === "Enter" && handleOpen(e)}
            aria-label={`Open ${app.title}`}
            title="Double click to open"
            role="listitem"
        >
            <div className="group-hover:scale-105 transition-transform duration-150">
                {icons[app.icon]}
            </div>
            <span
                className={clsx("text-white font-medium leading-tight text-center break-words w-full drop-shadow", sizeClasses.text)}
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
            >
                {app.title}
            </span>
            {/* Running dot */}
            {isOpen && (
                <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_4px_currentColor" style={{ backgroundColor: accentColor, color: accentColor }} />
            )}
        </button>
    );
}