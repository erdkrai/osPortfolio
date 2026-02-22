"use client";

import { useEffect, useState } from "react";
import { useWindowStore } from "@/store/windows";
import { useSettingsStore } from "@/store/settings";
import { clsx } from "clsx";
import { AnalogClockDropdown } from "./AnalogClockDropdown";
import { CalendarDropdown } from "./CalendarDropdown";
import { profile } from "@/data/profile";
import { playLockSound } from "@/lib/sound";

export function TopBar() {
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);
    const [showClock, setShowClock] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const { windows, activeWindowId, openWindow } = useWindowStore();
    const { wallpaper, setWallpaper, wallpapers, accentColor, lockScreen, theme } = useSettingsStore();

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }));
            setDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
        };
        update();
        const id = setInterval(update, 10_000);
        return () => clearInterval(id);
    }, []);

    const activeWin = windows.find((w) => w.windowId === activeWindowId && !w.minimized);

    // Derive topbar tint from current wallpaper (dark theme only — light theme keeps its own panel-bg)
    const currentWp = wallpapers.find((wp) => wp.url === wallpaper);
    const panelBg = theme === "dark" && currentWp?.topbarColor ? currentWp.topbarColor : undefined;

    return (
        <div
            className="ubuntu-panel fixed top-0 left-0 right-0 z-[9998] flex items-center justify-between px-4 select-none"
            style={panelBg ? { background: panelBg } : undefined}
            role="banner"
            aria-label="Ubuntu top panel"
        >
            {/* Click-outside backdrop for clock/calendar dropdowns */}
            {(showClock || showCalendar) && (
                <div
                    className="fixed inset-0 z-[9997]"
                    onClick={() => { setShowClock(false); setShowCalendar(false); }}
                />
            )}

            {/* Left: Activities + focused app name */}
            <div className="flex items-center gap-4">
                <button
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[var(--text-primary)] text-sm font-medium
            hover:bg-[var(--border-color)] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-color)]"
                    aria-label="Activities overview"
                >
                    {/* Ubuntu logo */}
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                        <circle cx="12" cy="12" r="11" fill={accentColor} />
                        <circle cx="12" cy="4.5" r="2.5" fill="white" />
                        <circle cx="4.5" cy="17.5" r="2.5" fill="white" />
                        <circle cx="19.5" cy="17.5" r="2.5" fill="white" />
                        <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5" fill="none" />
                        <line x1="12" y1="7" x2="12" y2="9" stroke="white" strokeWidth="1.5" />
                        <line x1="6.5" y1="16" x2="9" y2="14.5" stroke="white" strokeWidth="1.5" />
                        <line x1="17.5" y1="16" x2="15" y2="14.5" stroke="white" strokeWidth="1.5" />
                    </svg>
                    Activities
                </button>

                {/* Focused window app name */}
                {activeWin && (
                    <span className="text-[var(--text-secondary)] text-sm hidden sm:block">
                        {activeWin.title}
                    </span>
                )}
            </div>

            {/* Center: Date & Time */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0 z-[9999]">
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowCalendar(!showCalendar);
                            setShowClock(false);
                            setShowMenu(false);
                        }}
                        className={clsx(
                            "flex items-center px-2 py-0.5 rounded-l text-sm transition-colors focus:outline-none",
                            showCalendar ? "bg-[var(--border-color)]" : "hover:bg-[var(--border-color)]"
                        )}
                        aria-label="Calendar"
                    >
                        <span className="text-[var(--text-secondary)] text-xs">{date}</span>
                    </button>
                    <CalendarDropdown open={showCalendar} onClose={() => setShowCalendar(false)} />
                </div>
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowClock(!showClock);
                            setShowCalendar(false);
                            setShowMenu(false);
                        }}
                        className={clsx(
                            "flex items-center px-2 py-0.5 rounded-r text-sm transition-colors focus:outline-none",
                            showClock ? "bg-[var(--border-color)]" : "hover:bg-[var(--border-color)]"
                        )}
                        aria-label="Clock"
                    >
                        <span className="font-semibold text-[var(--text-primary)]">{time}</span>
                    </button>
                    <AnalogClockDropdown open={showClock} onClose={() => setShowClock(false)} />
                </div>
            </div>

            {/* Right: System tray */}
            <div className="flex items-center gap-1">
                {/* Network */}
                <button
                    className="p-1 rounded hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none"
                    aria-label="Network settings"
                    title="Network"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                    </svg>
                </button>

                {/* Volume */}
                <button
                    className="p-1 rounded hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none"
                    aria-label="Volume settings"
                    title="Volume"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    </svg>
                </button>

                {/* Battery */}
                <button
                    className="p-1 rounded hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none"
                    aria-label="Battery status"
                    title="Battery"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
                    </svg>
                </button>

                {/* System menu */}
                <button
                    onClick={() => {
                        setShowMenu(!showMenu);
                        setShowClock(false);
                        setShowCalendar(false);
                    }}
                    className={clsx(
                        "flex items-center gap-1 px-2 py-0.5 rounded transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium focus:outline-none",
                        showMenu ? "bg-[var(--border-color)]" : "hover:bg-[var(--border-color)]"
                    )}
                    aria-label="System menu"
                    aria-expanded={showMenu}
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                    <svg className="w-3 h-3 opacity-60" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 10l5 5 5-5z" />
                    </svg>
                </button>

                {/* Dropdown menu */}
                {showMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-[9998]"
                            onClick={() => setShowMenu(false)}
                        />
                        <div
                            className="absolute top-8 right-2 z-[9999] w-64 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]
                shadow-2xl shadow-[var(--shadow-color)] py-1 overflow-hidden"
                        >
                            <div className="px-4 py-2.5 border-b border-[var(--border-color)]">
                                <p className="text-[var(--text-primary)] text-sm font-medium">{profile.name}</p>
                                <p className="text-[var(--text-secondary)] text-xs">{profile.email}</p>
                            </div>
                            <div className="py-1">
                                {/* Settings */}
                                <button
                                    onClick={() => {
                                        openWindow({ appId: "settings", title: "Settings", defaultSize: { w: 900, h: 600 } });
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors text-left"
                                >
                                    <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                                    </svg>
                                    Settings
                                </button>

                                {/* Change Background — inline expandable */}
                                <div>
                                    <button
                                        onClick={() => setShowWallpaperMenu(!showWallpaperMenu)}
                                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors text-left"
                                    >
                                        <span className="flex items-center gap-3">
                                            <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                            Background
                                        </span>
                                        <svg className={clsx("w-3 h-3 transition-transform opacity-50", showWallpaperMenu && "rotate-180")} viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7 10l5 5 5-5z" />
                                        </svg>
                                    </button>

                                    {/* Inline wallpaper grid */}
                                    {showWallpaperMenu && (
                                        <div className="px-3 pb-2 pt-1">
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {wallpapers.map((wp) => (
                                                    <button
                                                        key={wp.id}
                                                        onClick={() => {
                                                            setWallpaper(wp.url);
                                                        }}
                                                        className={clsx(
                                                            "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                                                            wallpaper === wp.url
                                                                ? "border-[var(--accent-color)] ring-1 ring-[var(--accent-color)]"
                                                                : "border-transparent hover:border-[var(--border-color)]"
                                                        )}
                                                        title={wp.name}
                                                    >
                                                        {wp.url ? (
                                                            wp.url.startsWith("linear-gradient") || wp.url.startsWith("radial-gradient") ? (
                                                                <div className="w-full h-full" style={{ background: wp.url }} />
                                                            ) : (
                                                                <img
                                                                    src={wp.thumbnail || wp.url}
                                                                    alt={wp.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            )
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-[#4f194c] to-[#2c001e]" />
                                                        )}
                                                        {wallpaper === wp.url && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Lock Screen */}
                                <button
                                    onClick={() => {
                                        playLockSound();
                                        lockScreen();
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors text-left"
                                >
                                    <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                    Lock Screen
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
