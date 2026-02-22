"use client";

import React, { useState, useMemo } from "react";
import { SHORTCUTS, Shortcut, getPlatformKeys, getIsMac } from "@/lib/shortcuts";
import { clsx } from "clsx";

const CATEGORIES = ["System", "Windows", "Apps", "Navigation"] as const;

const categoryIcons: Record<string, React.ReactNode> = {
    System: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    ),
    Windows: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    ),
    Apps: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    Navigation: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
    ),
};

/** Render a single keyboard key cap */
function KeyCap({ k }: { k: string }) {
    return (
        <kbd className="sc-keycap">{k}</kbd>
    );
}

/** Render the full combo for a shortcut */
function KeyCombo({ keys }: { keys: string[] }) {
    return (
        <span className="flex items-center gap-1 flex-shrink-0">
            {keys.map((k, i) => (
                <React.Fragment key={i}>
                    {i > 0 && <span className="text-[10px] opacity-40 font-semibold" style={{ color: "var(--text-secondary)" }}>+</span>}
                    <KeyCap k={k} />
                </React.Fragment>
            ))}
        </span>
    );
}

export function KeyboardShortcutsApp() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const isMac = typeof navigator !== "undefined" && getIsMac();

    const filtered = useMemo(() => {
        let list: Shortcut[] = SHORTCUTS;
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((s) =>
                s.label.toLowerCase().includes(q) ||
                getPlatformKeys(s).join(" ").toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q)
            );
        }
        if (activeCategory) {
            list = list.filter((s) => s.category === activeCategory);
        }
        return list;
    }, [search, activeCategory]);

    // Group by category
    const grouped = useMemo(() => {
        const map = new Map<string, Shortcut[]>();
        for (const s of filtered) {
            const arr = map.get(s.category) || [];
            arr.push(s);
            map.set(s.category, arr);
        }
        return map;
    }, [filtered]);

    return (
        <div className="flex h-full w-full overflow-hidden" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
            {/* ── Sidebar ── */}
            <div className="w-52 min-w-52 flex flex-col shrink-0" style={{ background: "var(--bg-primary)", borderRight: "1px solid var(--border-color)" }}>
                {/* Header */}
                <div className="p-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 opacity-60">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M6 8h.01M10 8h.01M14 8h4" />
                        <path d="M6 12h.01M10 12h.01M14 12h4" />
                        <path d="M6 16h12" />
                    </svg>
                    <h1 className="text-base font-semibold">Shortcuts</h1>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-medium opacity-60"
                        style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                        {isMac ? "macOS" : "Windows"}
                    </span>
                </div>

                {/* Nav items */}
                <nav className="flex-1 p-2 flex flex-col gap-0.5">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left"
                        style={
                            !activeCategory
                                ? { background: "var(--accent-subtle)", color: "var(--accent-color)" }
                                : { color: "var(--text-secondary)" }
                        }
                        onMouseEnter={(e) => { if (activeCategory) (e.currentTarget).style.background = "var(--hover-bg)"; }}
                        onMouseLeave={(e) => { if (activeCategory) (e.currentTarget).style.background = "transparent"; }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        All Shortcuts
                    </button>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left"
                            style={
                                activeCategory === cat
                                    ? { background: "var(--accent-subtle)", color: "var(--accent-color)" }
                                    : { color: "var(--text-secondary)" }
                            }
                            onMouseEnter={(e) => { if (activeCategory !== cat) (e.currentTarget).style.background = "var(--hover-bg)"; }}
                            onMouseLeave={(e) => { if (activeCategory !== cat) (e.currentTarget).style.background = "transparent"; }}
                        >
                            {categoryIcons[cat]}
                            {cat}
                        </button>
                    ))}
                </nav>

                {/* Tip */}
                <div className="px-3 py-3 mx-2 mb-2 rounded-lg text-[10px] leading-relaxed flex items-start gap-2 opacity-60"
                    style={{ color: "var(--text-secondary)", background: "var(--bg-secondary)" }}>
                    <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-70" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                    <span>Some shortcuts may be overridden by your browser or OS</span>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Search bar */}
                <div className="shrink-0 px-4 pt-3 pb-1">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)" }}>
                        <svg className="w-4 h-4 flex-shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-secondary)" }}>
                            <circle cx="11" cy="11" r="7" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search shortcuts…"
                            className="flex-1 bg-transparent border-none outline-none text-[13px]"
                            style={{ color: "var(--text-primary)", fontFamily: "'Ubuntu', sans-serif" }}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        {search && (
                            <button onClick={() => setSearch("")}
                                className="p-0.5 rounded-full transition-colors hover:opacity-80"
                                style={{ color: "var(--text-secondary)" }}>
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Shortcut list */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                            <svg className="w-14 h-14 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: "var(--text-secondary)" }}>
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No shortcuts match &ldquo;{search}&rdquo;</p>
                        </div>
                    ) : (
                        Array.from(grouped.entries()).map(([category, shortcuts]) => (
                            <div key={category} className="mb-4">
                                {/* Section header */}
                                <div className="flex items-center gap-2 px-1 pt-2 pb-1.5">
                                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-50"
                                        style={{ color: "var(--text-secondary)" }}>{category}</span>
                                    <span className="text-[10px] opacity-30" style={{ color: "var(--text-secondary)" }}>
                                        ({shortcuts.length})
                                    </span>
                                </div>

                                {/* Shortcut rows in a card */}
                                <div className="rounded-xl overflow-hidden"
                                    style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)" }}>
                                    {shortcuts.map((s, i) => (
                                        <div
                                            key={s.action}
                                            className={clsx(
                                                "flex items-center justify-between px-4 py-2.5 gap-4 transition-colors",
                                                "hover:brightness-95"
                                            )}
                                            style={i > 0 ? { borderTop: "1px solid var(--border-color)" } : undefined}
                                            onMouseEnter={(e) => (e.currentTarget).style.background = "var(--hover-bg)"}
                                            onMouseLeave={(e) => (e.currentTarget).style.background = "transparent"}
                                        >
                                            <span className="text-[13px] font-normal" style={{ color: "var(--text-primary)" }}>
                                                {s.label}
                                            </span>
                                            <KeyCombo keys={getPlatformKeys(s)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
