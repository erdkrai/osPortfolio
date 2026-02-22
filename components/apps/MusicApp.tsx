"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

/* ─── helpers ────────────────────────────────────────────────────────────── */

function parseSpotifyLink(input: string): { type: string; id: string } | null {
    const trimmed = input.trim();
    const uriMatch = trimmed.match(
        /^spotify:(playlist|album|track|artist|episode|show):([a-zA-Z0-9]+)/
    );
    if (uriMatch) return { type: uriMatch[1], id: uriMatch[2] };
    try {
        const url = new URL(trimmed);
        if (!url.hostname.includes("spotify.com")) return null;
        const segs = url.pathname.split("/").filter(Boolean);
        const idx = segs.findIndex((s) =>
            ["playlist", "album", "track", "artist", "episode", "show"].includes(s)
        );
        if (idx === -1 || idx + 1 >= segs.length) return null;
        return { type: segs[idx], id: segs[idx + 1].split("?")[0] };
    } catch {
        return null;
    }
}

function embedUrl(type: string, id: string): string {
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
}

/* ─── preset playlists ───────────────────────────────────────────────────── */

interface Preset {
    name: string;
    type: string;
    id: string;
}

const PRESETS: Preset[] = [
    { name: "Today's Top Hits", type: "playlist", id: "37i9dQZF1DXcBWIGoYBM5M" },
    { name: "RapCaviar", type: "playlist", id: "37i9dQZF1DX0XUsuxWHRQd" },
    { name: "All Out 2010s", type: "playlist", id: "37i9dQZF1DX5Ejj0EkURtP" },
    { name: "Chill Hits", type: "playlist", id: "37i9dQZF1DX4WYpdgoIcn6" },
    { name: "Hot Hits India", type: "playlist", id: "37i9dQZF1DX0XUfTFmNBRM" },
    { name: "Bollywood Butter", type: "playlist", id: "37i9dQZF1DWVwmhNaOFRRe" },
];

const DEFAULT = PRESETS[0]; // Today's Top Hits

/* ─── localStorage library ───────────────────────────────────────────────── */

interface SavedItem {
    name: string;
    type: string;
    id: string;
}

const LS_KEY = "os-portfolio-music-playlists";

function loadLibrary(): SavedItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function persistLibrary(list: SavedItem[]) {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
}

/* ─── component ──────────────────────────────────────────────────────────── */

export function MusicApp() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [compact, setCompact] = useState(false); // < 460px triggers compact
    const [input, setInput] = useState("");
    const [current, setCurrent] = useState<Preset>({ ...DEFAULT });
    const [library, setLibrary] = useState<SavedItem[]>([]);
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Load library + measure width
    useEffect(() => {
        setLibrary(loadLibrary());
    }, []);

    // ResizeObserver for responsive layout
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            const w = entry.contentRect.width;
            setCompact(w < 460);
            if (w < 460) setSidebarOpen(false);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const handlePlay = useCallback(() => {
        setError("");
        const parsed = parseSpotifyLink(input);
        if (!parsed) {
            setError("Invalid Spotify link.");
            return;
        }
        setCurrent({
            name:
                parsed.type.charAt(0).toUpperCase() +
                parsed.type.slice(1) +
                " · " +
                parsed.id.slice(0, 6),
            ...parsed,
        });
        setInput("");
    }, [input]);

    const handleSave = useCallback(() => {
        if (!current) return;
        if (library.some((l) => l.id === current.id)) return;
        const updated = [...library, { name: current.name, type: current.type, id: current.id }];
        setLibrary(updated);
        persistLibrary(updated);
    }, [current, library]);

    const handleRemove = useCallback(
        (id: string) => {
            const updated = library.filter((l) => l.id !== id);
            setLibrary(updated);
            persistLibrary(updated);
        },
        [library]
    );

    /* ── sidebar content (shared between sidebar and bottom sheet) ── */
    const sidebarContent = (
        <>
            {/* Presets */}
            <div className="px-2 pt-2 pb-1">
                <p className="text-[10px] uppercase tracking-wider px-2 mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Popular
                </p>
                {PRESETS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setCurrent(p)}
                        className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors"
                        style={{
                            color: current.id === p.id ? "#1db954" : "#ccc",
                            background: current.id === p.id ? "rgba(29,185,84,0.1)" : "transparent",
                        }}
                    >
                        <svg viewBox="0 0 16 16" className="w-3 h-3 shrink-0" fill="currentColor">
                            <path d="M2 4h12v1H2zm0 3h12v1H2zm0 3h8v1H2z" />
                        </svg>
                        <span className="truncate">{p.name}</span>
                    </button>
                ))}
            </div>

            {/* Divider */}
            <div className="mx-3 my-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

            {/* Library */}
            <div className="px-2 pb-2 flex-1 overflow-y-auto min-h-0">
                <div className="flex items-center justify-between px-2 mb-1.5">
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                        My Library
                    </p>
                    <button
                        onClick={handleSave}
                        className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
                        style={{ background: "rgba(255,255,255,0.08)", color: "#aaa" }}
                        title="Save current to library"
                    >
                        + Save
                    </button>
                </div>
                {library.length === 0 ? (
                    <p className="text-[11px] px-2" style={{ color: "rgba(255,255,255,0.2)" }}>
                        No saved items yet.
                    </p>
                ) : (
                    library.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setCurrent(item)}
                            className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-xs group transition-colors"
                            style={{
                                color: current.id === item.id ? "#e66100" : "#ccc",
                                background: current.id === item.id ? "rgba(230,97,0,0.1)" : "transparent",
                            }}
                        >
                            <svg viewBox="0 0 16 16" className="w-3 h-3 shrink-0" fill="currentColor">
                                {item.type === "track" ? (
                                    <path d="M6 14V3l8-2v10.5a2.5 2.5 0 11-1-2V4.3l-6 1.5V12a2.5 2.5 0 11-1-1.8z" />
                                ) : item.type === "album" ? (
                                    <>
                                        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                        <circle cx="8" cy="8" r="2" />
                                    </>
                                ) : (
                                    <path d="M2 4h12v1H2zm0 3h12v1H2zm0 3h8v1H2z" />
                                )}
                            </svg>
                            <span className="truncate flex-1">{item.name}</span>
                            <span
                                className="opacity-0 group-hover:opacity-100 text-[10px] cursor-pointer"
                                style={{ color: "#ff6b6b" }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(item.id);
                                }}
                            >
                                ✕
                            </span>
                        </button>
                    ))
                )}
            </div>
        </>
    );

    return (
        <div
            ref={containerRef}
            className="flex h-full w-full overflow-hidden"
            style={{ background: "#121212" }}
        >
            {/* ─ Sidebar (wide mode) ─ */}
            {!compact && sidebarOpen && (
                <div
                    className="flex flex-col shrink-0 border-r overflow-hidden"
                    style={{
                        width: 190,
                        background: "#0a0a0a",
                        borderColor: "rgba(255,255,255,0.06)",
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center gap-2 px-3 py-2.5 border-b shrink-0"
                        style={{ borderColor: "rgba(255,255,255,0.06)" }}
                    >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="#1db954" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18V5l12-2v13" />
                            <circle cx="6" cy="18" r="3" fill="#1db954" />
                            <circle cx="18" cy="16" r="3" fill="#1db954" />
                        </svg>
                        <span className="text-xs font-semibold" style={{ color: "#e0e0e0" }}>
                            Music
                        </span>
                    </div>
                    {sidebarContent}
                </div>
            )}

            {/* ─ Main area ─ */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
                {/* Top bar: toggle + input */}
                <div
                    className="flex items-center gap-2 px-3 py-2 border-b shrink-0"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                    {/* Sidebar toggle */}
                    {!compact && (
                        <button
                            onClick={() => setSidebarOpen((v) => !v)}
                            className="p-1 rounded transition-colors shrink-0"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                        >
                            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
                                <rect x="1" y="3" width="14" height="1.5" rx="0.75" />
                                <rect x="1" y="7.25" width="14" height="1.5" rx="0.75" />
                                <rect x="1" y="11.5" width="14" height="1.5" rx="0.75" />
                            </svg>
                        </button>
                    )}

                    {/* Compact mode: playlist selector dropdown */}
                    {compact && (
                        <button
                            onClick={() => setSidebarOpen((v) => !v)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] shrink-0"
                            style={{ background: "rgba(255,255,255,0.06)", color: "#ccc" }}
                        >
                            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
                                <path d="M2 4h12v1H2zm0 3h12v1H2zm0 3h8v1H2z" />
                            </svg>
                            Library
                        </button>
                    )}

                    {/* Input */}
                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                        <input
                            type="text"
                            placeholder={compact ? "Paste Spotify link…" : "Paste a Spotify playlist, album, or track link…"}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                setError("");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handlePlay();
                            }}
                            className="flex-1 min-w-0 text-xs outline-none"
                            style={{
                                color: "#e0e0e0",
                                padding: "5px 8px",
                                background: "rgba(255,255,255,0.06)",
                                borderRadius: 6,
                                border: "1px solid rgba(255,255,255,0.06)",
                            }}
                        />
                        <button
                            onClick={handlePlay}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-md shrink-0"
                            style={{ background: "#1db954", color: "#fff" }}
                        >
                            Play
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="text-[11px] px-3 py-1 shrink-0" style={{ color: "#ff6b6b" }}>
                        {error}
                    </p>
                )}

                {/* Now Playing label */}
                <div className="flex items-center gap-2 px-3 py-1.5 shrink-0" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#1db954" }} />
                            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#1db954" }} />
                        </span>
                        <span className="text-[11px] font-medium" style={{ color: "#1db954" }}>
                            Now Playing
                        </span>
                    </div>
                    <span className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
                        {current.name}
                    </span>
                </div>

                {/* Spotify Embed — fills all available space */}
                <div className="flex-1 min-h-0 p-2">
                    <iframe
                        key={`${current.type}-${current.id}`}
                        src={embedUrl(current.type, current.id)}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-lg"
                        style={{ border: "none" }}
                    />
                </div>

                {/* Compact: bottom sheet for library */}
                {compact && sidebarOpen && (
                    <div
                        className="absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-xl overflow-hidden"
                        style={{
                            background: "#0a0a0a",
                            maxHeight: "70%",
                            borderTop: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
                        }}
                    >
                        {/* Drag handle + close */}
                        <div className="flex items-center justify-between px-3 py-2 shrink-0">
                            <span className="text-xs font-semibold" style={{ color: "#e0e0e0" }}>
                                Library
                            </span>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ color: "rgba(255,255,255,0.4)" }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0">
                            {sidebarContent}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
