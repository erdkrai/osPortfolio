"use client";

import { useState, useCallback } from "react";
import { useWindowStore, AppId } from "@/store/windows";
import { APPS } from "@/components/desktop/Desktop";

/* ── Types ─────────────────────────────────────────────────────────────── */
type FolderPath = "home" | "games";

interface FileEntry {
    id: string;
    title: string;
    type: "app" | "folder";
    appId?: AppId;
    folderId?: FolderPath;
    description?: string;
    defaultSize?: { w: number; h: number };
}

/* ── Home directory items (mirrors desktop) ────────────────────────────── */
const HOME_ITEMS: FileEntry[] = APPS.map((app) => ({
    id: app.appId,
    title: app.title,
    type: app.appId === "games" ? "folder" as const : "app" as const,
    appId: app.appId === "games" ? undefined : app.appId,
    folderId: app.appId === "games" ? "games" as const : undefined,
    description: app.appId === "games" ? "3 items" : undefined,
    defaultSize: app.defaultSize,
}));

/* ── Games folder items ────────────────────────────────────────────────── */
const GAMES_ITEMS: FileEntry[] = [
    { id: "snake", title: "Snake", type: "app", appId: "snake", description: "Classic snake game", defaultSize: { w: 480, h: 560 } },
    { id: "tetris", title: "Tetris", type: "app", appId: "tetris", description: "Block puzzle game", defaultSize: { w: 420, h: 620 } },
    { id: "minesweeper", title: "Minesweeper", type: "app", appId: "minesweeper", description: "Mine sweeping puzzle", defaultSize: { w: 480, h: 560 } },
];

const FOLDER_CONTENTS: Record<FolderPath, FileEntry[]> = {
    home: HOME_ITEMS,
    games: GAMES_ITEMS,
};

const FOLDER_LABELS: Record<FolderPath, string> = {
    home: "Home",
    games: "Games",
};

/* ── Inline icons for the file manager ─────────────────────────────────── */
function FileIcon({ entry, size = 64 }: { entry: FileEntry; size?: number }) {
    const s = size;

    // Folder icon
    if (entry.type === "folder") {
        return (
            <svg viewBox="0 0 48 48" fill="none" width={s} height={s}>
                <path d="M4 12a3 3 0 013-3h10.172a3 3 0 012.121.879l1.828 1.828a1 1 0 00.707.293H41a3 3 0 013 3v21a3 3 0 01-3 3H7a3 3 0 01-3-3V12z" fill="url(#folder-grad)" />
                <path d="M4 18h40v18a3 3 0 01-3 3H7a3 3 0 01-3-3V18z" fill="url(#folder-front)" />
                <defs>
                    <linearGradient id="folder-grad" x1="4" y1="9" x2="44" y2="39" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#e8a317" /><stop offset="1" stopColor="#c67d11" />
                    </linearGradient>
                    <linearGradient id="folder-front" x1="4" y1="18" x2="44" y2="39" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#f5c638" /><stop offset="1" stopColor="#e8a317" />
                    </linearGradient>
                </defs>
            </svg>
        );
    }

    // App icons — match the GNOME squircle style used on the desktop
    switch (entry.id) {
        case "about":
            return (
                <svg viewBox="0 0 48 48" fill="none" width={s} height={s}>
                    <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#fm-about)" />
                    <circle cx="24" cy="18" r="7" fill="white" />
                    <path d="M12 42c0-8 5.4-13 12-13s12 5 12 13" fill="white" />
                    <defs><linearGradient id="fm-about" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#3584e4" /><stop offset="1" stopColor="#1a5fb4" /></linearGradient></defs>
                </svg>
            );
        case "projects":
            return (
                <svg viewBox="0 0 48 48" fill="none" width={s} height={s}>
                    <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#fm-proj)" />
                    <path d="M15 18l-4 5 4 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M33 18l4 5-4 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M27 14l-6 20" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                    <defs><linearGradient id="fm-proj" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#1c71d8" /><stop offset="1" stopColor="#1a5fb4" /></linearGradient></defs>
                </svg>
            );
        case "resume":
            return (
                <svg viewBox="0 0 48 48" fill="none" width={s} height={s}>
                    <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#fm-res)" />
                    <rect x="10" y="6" width="28" height="36" rx="3" fill="white" />
                    <rect x="15" y="18" width="18" height="2" rx="1" fill="#c0392b" opacity="0.7" />
                    <rect x="15" y="23" width="14" height="2" rx="1" fill="#bbb" />
                    <rect x="15" y="28" width="16" height="2" rx="1" fill="#bbb" />
                    <rect x="15" y="33" width="10" height="2" rx="1" fill="#bbb" />
                    <defs><linearGradient id="fm-res" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#e01b24" /><stop offset="1" stopColor="#c01c28" /></linearGradient></defs>
                </svg>
            );
        case "terminal":
            return (
                <svg viewBox="0 0 48 48" fill="none" width={s} height={s}>
                    <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#fm-term)" />
                    <path d="M12 18l7 6-7 6" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 32h14" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" opacity="0.7" />
                    <defs><linearGradient id="fm-term" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#300a24" /><stop offset="1" stopColor="#241f31" /></linearGradient></defs>
                </svg>
            );
        case "settings":
            return (
                <svg viewBox="0 0 48 48" fill="none" width={s} height={s}>
                    <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#fm-set)" />
                    <circle cx="24" cy="24" r="5" stroke="white" strokeWidth="2.5" fill="none" />
                    <g stroke="white" strokeWidth="3" strokeLinecap="round">
                        <line x1="24" y1="6" x2="24" y2="11" /><line x1="24" y1="37" x2="24" y2="42" />
                        <line x1="6" y1="24" x2="11" y2="24" /><line x1="37" y1="24" x2="42" y2="24" />
                        <line x1="11.3" y1="11.3" x2="14.8" y2="14.8" /><line x1="33.2" y1="33.2" x2="36.7" y2="36.7" />
                        <line x1="36.7" y1="11.3" x2="33.2" y2="14.8" /><line x1="14.8" y1="33.2" x2="11.3" y2="36.7" />
                    </g>
                    <defs><linearGradient id="fm-set" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#6d6d6d" /><stop offset="1" stopColor="#464646" /></linearGradient></defs>
                </svg>
            );
        case "photos":
            return (
                <svg viewBox="0 0 48 48" fill="none" width={s} height={s}>
                    <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#fm-pho)" />
                    <circle cx="16" cy="16" r="5" fill="#f6d32d" />
                    <path d="M4 36l11-13 7 8 6-6 16 11H4z" fill="white" fillOpacity="0.9" />
                    <defs><linearGradient id="fm-pho" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#26a269" /><stop offset="1" stopColor="#1a8553" /></linearGradient></defs>
                </svg>
            );
        case "music":
            return (
                <svg viewBox="0 0 48 48" fill="none" width={s} height={s}>
                    <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#fm-mus)" />
                    <path d="M20 34V16l14-4v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="16" cy="34" r="4" fill="white" /><circle cx="30" cy="30" r="4" fill="white" />
                    <defs><linearGradient id="fm-mus" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#e66100" /><stop offset="1" stopColor="#c64600" /></linearGradient></defs>
                </svg>
            );
        case "snake":
            return (
                <svg viewBox="0 0 48 48" fill="none" width={s} height={s}>
                    <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#fm-snake)" />
                    <path d="M10 34c2-10 6-10 10-6s4 8 8 6 4-10 8-10 4 4 4 8" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                    <circle cx="12" cy="27" r="2.5" fill="white" /><circle cx="11" cy="26" r="1" fill="#2ec27e" />
                    <defs><linearGradient id="fm-snake" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#26a269" /><stop offset="1" stopColor="#1a7a4c" /></linearGradient></defs>
                </svg>
            );
        case "tetris":
            return (
                <svg viewBox="0 0 48 48" fill="none" width={s} height={s}>
                    <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#fm-tetris)" />
                    <g opacity="0.95">
                        <rect x="11" y="30" width="8" height="8" rx="1.5" fill="#33b2df" /><rect x="19" y="30" width="8" height="8" rx="1.5" fill="#33b2df" />
                        <rect x="11" y="22" width="8" height="8" rx="1.5" fill="#33b2df" /><rect x="19" y="14" width="8" height="8" rx="1.5" fill="#e66100" />
                        <rect x="19" y="22" width="8" height="8" rx="1.5" fill="#e66100" /><rect x="27" y="22" width="8" height="8" rx="1.5" fill="#e66100" />
                        <rect x="27" y="30" width="8" height="8" rx="1.5" fill="#9141ac" />
                    </g>
                    <defs><linearGradient id="fm-tetris" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#241f31" /><stop offset="1" stopColor="#1a1528" /></linearGradient></defs>
                </svg>
            );
        case "minesweeper":
            return (
                <svg viewBox="0 0 48 48" fill="none" width={s} height={s}>
                    <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#fm-mines)" />
                    <circle cx="24" cy="25" r="8" fill="#333" /><circle cx="24" cy="25" r="6" fill="#555" />
                    <g stroke="#333" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="24" y1="13" x2="24" y2="17" /><line x1="24" y1="33" x2="24" y2="37" />
                        <line x1="13" y1="25" x2="17" y2="25" /><line x1="31" y1="25" x2="35" y2="25" />
                        <line x1="16.2" y1="17.2" x2="19" y2="20" /><line x1="29" y1="30" x2="31.8" y2="32.8" />
                        <line x1="31.8" y1="17.2" x2="29" y2="20" /><line x1="19" y1="30" x2="16.2" y2="32.8" />
                    </g>
                    <circle cx="21.5" cy="22.5" r="2" fill="white" fillOpacity="0.5" />
                    <rect x="22" y="9" width="4" height="4" rx="2" fill="#e01b24" />
                    <defs><linearGradient id="fm-mines" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#77767b" /><stop offset="1" stopColor="#504e55" /></linearGradient></defs>
                </svg>
            );
        default:
            return (
                <svg viewBox="0 0 48 48" fill="none" width={s} height={s}>
                    <rect x="2" y="2" width="44" height="44" rx="12" fill="#888" />
                    <rect x="10" y="8" width="28" height="32" rx="3" fill="white" fillOpacity="0.3" />
                </svg>
            );
    }
}

/* ── Sidebar folder items ──────────────────────────────────────────────── */
const SIDEBAR_PLACES: { id: FolderPath; label: string; icon: React.ReactNode }[] = [
    {
        id: "home",
        label: "Home",
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 6.5L8 2l5 4.5V13a1 1 0 01-1 1H4a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.4" fill="none" />
                <rect x="6" y="9" width="4" height="5" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
        ),
    },
    {
        id: "games",
        label: "Games",
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4.5A1.5 1.5 0 013.5 3h3.172a1.5 1.5 0 011.06.44l.768.767a.5.5 0 00.354.147H12.5A1.5 1.5 0 0114 5.854V11.5A1.5 1.5 0 0112.5 13h-9A1.5 1.5 0 012 11.5v-7z" fill="currentColor" />
            </svg>
        ),
    },
];

/* ══════════════════════════════════════════════════════════════════════════
   GamesApp — Nautilus-style file manager with Home + Games navigation
   ══════════════════════════════════════════════════════════════════════════ */
export function GamesApp() {
    const { openWindow } = useWindowStore();
    const [currentPath, setCurrentPath] = useState<FolderPath>("home");
    const [history, setHistory] = useState<FolderPath[]>(["home"]);
    const [historyIdx, setHistoryIdx] = useState(0);

    const items = FOLDER_CONTENTS[currentPath];

    const navigateTo = useCallback((path: FolderPath) => {
        setCurrentPath(path);
        setHistory((prev) => {
            const newHistory = prev.slice(0, historyIdx + 1);
            newHistory.push(path);
            return newHistory;
        });
        setHistoryIdx((i) => i + 1);
    }, [historyIdx]);

    const goBack = useCallback(() => {
        if (historyIdx > 0) {
            const newIdx = historyIdx - 1;
            setHistoryIdx(newIdx);
            setCurrentPath(history[newIdx]);
        }
    }, [history, historyIdx]);

    const goForward = useCallback(() => {
        if (historyIdx < history.length - 1) {
            const newIdx = historyIdx + 1;
            setHistoryIdx(newIdx);
            setCurrentPath(history[newIdx]);
        }
    }, [history, historyIdx]);

    const canGoBack = historyIdx > 0;
    const canGoForward = historyIdx < history.length - 1;

    const handleItemOpen = (entry: FileEntry) => {
        if (entry.type === "folder" && entry.folderId) {
            navigateTo(entry.folderId);
        } else if (entry.appId && entry.defaultSize) {
            openWindow({
                appId: entry.appId,
                title: entry.title,
                defaultSize: entry.defaultSize,
            });
        }
    };

    return (
        <div
            className="flex flex-col h-full select-none"
            style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}
        >
            {/* ── Nautilus-style path bar / header ──────────────────────────── */}
            <div
                className="flex items-center gap-2 px-4 py-2 shrink-0"
                style={{ borderBottom: "1px solid var(--border-color)" }}
            >
                {/* Back / Forward buttons */}
                <div className="flex items-center gap-0.5">
                    <button
                        className="p-1.5 rounded-md transition-colors"
                        style={{ color: "var(--text-primary)", opacity: canGoBack ? 1 : 0.3 }}
                        onClick={goBack}
                        disabled={!canGoBack}
                        aria-label="Back"
                        onMouseEnter={(e) => { if (canGoBack) e.currentTarget.style.background = "var(--hover-bg)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <button
                        className="p-1.5 rounded-md transition-colors"
                        style={{ color: "var(--text-primary)", opacity: canGoForward ? 1 : 0.3 }}
                        onClick={goForward}
                        disabled={!canGoForward}
                        aria-label="Forward"
                        onMouseEnter={(e) => { if (canGoForward) e.currentTarget.style.background = "var(--hover-bg)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Breadcrumb path bar */}
                <div
                    className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)" }}
                >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                        <path d="M2 4.5A1.5 1.5 0 013.5 3h3.172a1.5 1.5 0 011.06.44l.768.767a.5.5 0 00.354.147H12.5A1.5 1.5 0 0114 5.854V11.5A1.5 1.5 0 0112.5 13h-9A1.5 1.5 0 012 11.5v-7z" fill="currentColor" />
                    </svg>
                    {currentPath === "home" ? (
                        <span style={{ color: "var(--text-primary)" }}>Home</span>
                    ) : (
                        <>
                            <button
                                className="hover:underline cursor-pointer"
                                style={{ color: "var(--text-muted)" }}
                                onClick={() => navigateTo("home")}
                            >
                                Home
                            </button>
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ color: "var(--text-muted)" }}>
                                <path d="M3 1.5l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span style={{ color: "var(--text-primary)" }}>{FOLDER_LABELS[currentPath]}</span>
                        </>
                    )}
                </div>

                {/* View mode / search icons */}
                <div className="flex items-center gap-0.5">
                    <button
                        className="p-1.5 rounded-md transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        aria-label="Grid view"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
                            <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
                            <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
                            <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
                        </svg>
                    </button>
                    <button
                        className="p-1.5 rounded-md transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        aria-label="Search"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
                            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Sidebar + Content (Nautilus layout) ──────────────────────── */}
            <div className="flex flex-1 min-h-0">
                {/* Sidebar */}
                <div
                    className="hidden sm:flex flex-col w-[180px] shrink-0 py-2 px-2 gap-0.5"
                    style={{
                        background: "var(--sidebar-bg)",
                        borderRight: "1px solid var(--border-color)",
                    }}
                >
                    <div
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 pt-2 pb-1"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Places
                    </div>

                    {SIDEBAR_PLACES.map((place) => (
                        <button
                            key={place.id}
                            onClick={() => navigateTo(place.id)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors cursor-default"
                            style={
                                currentPath === place.id
                                    ? { background: "var(--accent-subtle)", color: "var(--accent-color)", fontWeight: 500 }
                                    : { color: "var(--text-secondary)" }
                            }
                            onMouseEnter={(e) => { if (currentPath !== place.id) e.currentTarget.style.background = "var(--hover-bg)"; }}
                            onMouseLeave={(e) => { if (currentPath !== place.id) e.currentTarget.style.background = "transparent"; }}
                        >
                            {place.icon}
                            {place.label}
                        </button>
                    ))}

                    <div className="mt-4 text-[10px] font-semibold uppercase tracking-wider px-2 pt-2 pb-1" style={{ color: "var(--text-muted)" }}>
                        Info
                    </div>
                    <div className="px-2 text-xs" style={{ color: "var(--text-muted)" }}>
                        {items.length} items
                    </div>
                </div>

                {/* Main content — icon grid */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {/* Mobile header */}
                    <div className="sm:hidden mb-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        {items.length} items
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {items.map((entry) => (
                            <button
                                key={entry.id}
                                className="group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-150 cursor-default"
                                style={{ border: "1px solid transparent" }}
                                onDoubleClick={() => handleItemOpen(entry)}
                                onClick={(e) => e.currentTarget.focus()}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "var(--hover-bg)";
                                    e.currentTarget.style.borderColor = "var(--border-color)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.borderColor = "transparent";
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.background = "var(--accent-muted)";
                                    e.currentTarget.style.borderColor = "var(--accent-color)";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.borderColor = "transparent";
                                }}
                                aria-label={entry.type === "folder" ? `Open ${entry.title} folder` : `Open ${entry.title}`}
                                title="Double click to open"
                            >
                                <div className="group-hover:scale-105 transition-transform duration-150">
                                    <FileIcon entry={entry} size={64} />
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                        {entry.title}
                                    </div>
                                    {entry.description && (
                                        <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                                            {entry.description}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Nautilus-style status bar */}
                    <div
                        className="mt-6 pt-3 text-xs"
                        style={{ borderTop: "1px solid var(--border-color)", color: "var(--text-muted)" }}
                    >
                        {items.length} items — Double click to open
                    </div>
                </div>
            </div>
        </div>
    );
}
