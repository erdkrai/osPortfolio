"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowStore, WindowInstance } from "@/store/windows";
import { useSettingsStore } from "@/store/settings";
import { APPS, AppConfig } from "@/data/apps";
import { getDockIcons } from "./Dock";
import { AppRenderer } from "@/components/common/AppRenderer";
import { clsx } from "clsx";

interface ActivitiesViewProps {
    open: boolean;
    onClose: () => void;
}

/* ── helpers ── */
const PANEL_H = 32;   // top-bar height

/** Compute scaled position/size for a window thumbnail inside available overview area */
function computeThumbLayout(
    win: WindowInstance,
    idx: number,
    total: number,
    areaW: number,
    areaH: number,
) {
    // For ≤3 windows: side by side. For >3: 2-row grid.
    const cols = total <= 3 ? total : Math.ceil(total / 2);
    const rows = total <= 3 ? 1 : 2;

    const gapX = 32;
    const gapY = 48;
    const maxThumbW = Math.min(420, (areaW - gapX * (cols + 1)) / cols);
    const maxThumbH = Math.min(280, (areaH - gapY * (rows + 1)) / rows);

    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const blockW = cols * maxThumbW + (cols - 1) * gapX;
    const blockH = rows * maxThumbH + (rows - 1) * gapY;
    const offsetX = (areaW - blockW) / 2;
    const offsetY = (areaH - blockH) / 2;

    return {
        x: offsetX + col * (maxThumbW + gapX),
        y: offsetY + row * (maxThumbH + gapY),
        w: maxThumbW,
        h: maxThumbH,
    };
}

export function ActivitiesView({ open, onClose }: ActivitiesViewProps) {
    const [search, setSearch] = useState("");
    const [showApps, setShowApps] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const { windows, focusWindow, restoreWindow, openWindow, closeWindow, activeWindowId } = useWindowStore();
    const { accentColor, wallpaper, wallpapers, theme } = useSettingsStore();

    const icons = useMemo(() => getDockIcons("w-full h-full"), []);

    // Reset state on open
    useEffect(() => {
        if (open) {
            setSearch("");
            setShowApps(false);
            const t = setTimeout(() => searchRef.current?.focus(), 200);
            return () => clearTimeout(t);
        }
    }, [open]);

    // Listen for "show apps" event from keyboard shortcuts (Super+A)
    useEffect(() => {
        if (!open) return;
        const handler = () => setShowApps(true);
        window.addEventListener("activities-show-apps", handler);
        return () => window.removeEventListener("activities-show-apps", handler);
    }, [open]);

    // Close on Escape — stop propagation so Desktop doesn't close a window
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                e.stopImmediatePropagation();
                if (showApps) { setShowApps(false); setSearch(""); }
                else onClose();
            }
        };
        // Use capture phase so we intercept before Desktop's handler
        window.addEventListener("keydown", handler, true);
        return () => window.removeEventListener("keydown", handler, true);
    }, [open, onClose, showApps]);

    // Filter apps by search
    const filteredApps = search.trim()
        ? APPS.filter((a) =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.appId.toLowerCase().includes(search.toLowerCase())
        )
        : APPS;

    // All windows (including minimized) for the overview
    const allWindows = windows;

    const handleWindowClick = useCallback((win: WindowInstance) => {
        if (win.minimized) {
            restoreWindow(win.windowId);
        } else {
            focusWindow(win.windowId);
        }
        onClose();
    }, [focusWindow, restoreWindow, onClose]);

    const handleWindowClose = useCallback((e: React.MouseEvent, windowId: string) => {
        e.stopPropagation();
        closeWindow(windowId);
    }, [closeWindow]);

    const handleAppClick = useCallback((app: AppConfig) => {
        const existing = windows.find((w) => w.appId === app.appId);
        if (existing) {
            if (existing.minimized) restoreWindow(existing.windowId);
            else focusWindow(existing.windowId);
        } else {
            openWindow({ appId: app.appId, title: app.title, defaultSize: app.defaultSize });
        }
        onClose();
    }, [windows, focusWindow, restoreWindow, openWindow, onClose]);

    // Determine which view is active
    const isSearching = search.trim().length > 0;
    const showAppGrid = showApps || isSearching;
    const hasWindows = allWindows.length > 0;

    // Wallpaper background style (same as desktop)
    const wpStyle = useMemo(() => {
        if (!wallpaper) return {};
        if (wallpaper.startsWith("linear-gradient") || wallpaper.startsWith("radial-gradient"))
            return { background: wallpaper };
        return { backgroundImage: `url(${wallpaper})`, backgroundSize: "cover", backgroundPosition: "center" };
    }, [wallpaper]);

    // Workspace previews — miniature of current wallpaper + windows
    const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
    const screenH = typeof window !== "undefined" ? window.innerHeight : 800;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="act-root"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onClick={onClose}
                >
                    {/* ── Wallpaper layer (blurred) ── */}
                    <div className="act-wallpaper" style={wpStyle} />
                    <div className="act-scrim" />

                    {/* ── Content ── */}
                    <div className="act-content">
                        {/* Search bar — always visible, top center */}
                        <motion.div
                            className="act-search-wrap"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ y: -12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.22, delay: 0.06 }}
                        >
                            <div className="act-search">
                                <svg className="act-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="M21 21l-4.35-4.35" />
                                </svg>
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); if (e.target.value.trim()) setShowApps(true); }}
                                    placeholder="Type to search…"
                                    className="act-search-input"
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                                {search && (
                                    <button
                                        onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                                        className="act-search-clear"
                                    >
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* ── Main area ── */}
                        <div className="act-main">
                            <AnimatePresence mode="wait">
                                {showAppGrid ? (
                                    /* ════ App Grid ════ */
                                    <motion.div
                                        key="appgrid"
                                        className="act-appgrid-wrap"
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 40 }}
                                        transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                                    >
                                        {filteredApps.length === 0 ? (
                                            <div className="act-no-results">
                                                <svg className="w-16 h-16 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                    <circle cx="11" cy="11" r="8" />
                                                    <path d="M21 21l-4.35-4.35" />
                                                </svg>
                                                <p>No results for &ldquo;{search}&rdquo;</p>
                                            </div>
                                        ) : (
                                            <div className="act-appgrid">
                                                {filteredApps.map((app, i) => {
                                                    const isOpen = windows.some((w) => w.appId === app.appId);
                                                    return (
                                                        <motion.button
                                                            key={app.appId}
                                                            initial={{ opacity: 0, scale: 0.7, y: 16 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            transition={{ duration: 0.22, delay: i * 0.025 }}
                                                            onClick={() => handleAppClick(app)}
                                                            className="act-app-item"
                                                        >
                                                            <div className="act-app-icon-wrap">
                                                                {icons[app.icon]}
                                                            </div>
                                                            <span className="act-app-name">{app.title}</span>
                                                            {isOpen && (
                                                                <span className="act-app-dot" style={{ backgroundColor: accentColor }} />
                                                            )}
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </motion.div>
                                ) : hasWindows ? (
                                    /* ════ Window Overview ════ */
                                    <motion.div
                                        key="windows"
                                        className="act-windows-area"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.18 }}
                                    >
                                        {allWindows.map((win, i) => {
                                            const appConfig = APPS.find((a) => a.appId === win.appId);
                                            const isActive = win.windowId === activeWindowId;
                                            const thumb = computeThumbLayout(
                                                win, i, allWindows.length,
                                                screenW - 120, // leave space for workspace strip
                                                screenH - PANEL_H - 80 - 80, // account for panel + search + bottom
                                            );
                                            // Calculate scale for live preview
                                            const contentW = win.w || 800;
                                            const contentH = (win.h || 500) - 36; // minus header bar
                                            const hbarH = 22;
                                            const labelH = 28;
                                            const availW = thumb.w;
                                            const availH = thumb.h - hbarH - labelH;
                                            const previewScale = Math.min(availW / contentW, availH / contentH, 1);
                                            return (
                                                <motion.div
                                                    key={win.windowId}
                                                    className={clsx("act-win-card", isActive && "act-win-active", win.minimized && "act-win-minimized")}
                                                    style={{ left: thumb.x, top: thumb.y, width: thumb.w, height: thumb.h }}
                                                    initial={{ opacity: 0, scale: 0.7 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.3, delay: i * 0.05, ease: [0.2, 0, 0, 1] }}
                                                    onClick={() => handleWindowClick(win)}
                                                >
                                                    {/* Close button */}
                                                    <button
                                                        onClick={(e) => handleWindowClose(e, win.windowId)}
                                                        className="act-win-close"
                                                        aria-label={`Close ${win.title}`}
                                                    >
                                                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                                        </svg>
                                                    </button>

                                                    {/* Window preview — real app content scaled down */}
                                                    <div className="act-win-mock">
                                                        {/* Header bar */}
                                                        <div className="act-win-hbar">
                                                            <div className="act-win-dots">
                                                                <span /><span /><span />
                                                            </div>
                                                            <span className="act-win-hbar-title">{win.title}</span>
                                                        </div>
                                                        {/* Live app preview — renders actual component scaled to fit */}
                                                        <div className="act-win-live-wrap">
                                                            <div
                                                                className="act-win-live-content"
                                                                style={{
                                                                    width: contentW,
                                                                    height: contentH,
                                                                    '--preview-scale': previewScale,
                                                                } as React.CSSProperties}
                                                            >
                                                                <AppRenderer appId={win.appId} windowId={win.windowId} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Label */}
                                                    <div className="act-win-label">
                                                        <div className="act-win-label-icon">
                                                            {appConfig && icons[appConfig.icon]}
                                                        </div>
                                                        <span>{win.title}</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                ) : (
                                    /* ════ Empty state ════ */
                                    <motion.div
                                        key="empty"
                                        className="act-empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <p className="act-empty-text">No open windows</p>
                                        <p className="act-empty-sub">Search for an app or click below to get started</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Bottom: Show Apps toggle (GNOME dot-grid button) ── */}
                        <motion.div
                            className="act-bottom"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <button
                                onClick={() => { setShowApps(!showApps); if (showApps) setSearch(""); }}
                                className={clsx("act-show-apps", showApps && "act-show-apps-active")}
                                aria-label={showApps ? "Show windows" : "Show applications"}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <rect x="2" y="2" width="4.5" height="4.5" rx="1" />
                                    <rect x="9.75" y="2" width="4.5" height="4.5" rx="1" />
                                    <rect x="17.5" y="2" width="4.5" height="4.5" rx="1" />
                                    <rect x="2" y="9.75" width="4.5" height="4.5" rx="1" />
                                    <rect x="9.75" y="9.75" width="4.5" height="4.5" rx="1" />
                                    <rect x="17.5" y="9.75" width="4.5" height="4.5" rx="1" />
                                    <rect x="2" y="17.5" width="4.5" height="4.5" rx="1" />
                                    <rect x="9.75" y="17.5" width="4.5" height="4.5" rx="1" />
                                    <rect x="17.5" y="17.5" width="4.5" height="4.5" rx="1" />
                                </svg>
                            </button>
                        </motion.div>

                        {/* ── Workspace strip (right edge) ── */}
                        <motion.div
                            className="act-ws-strip"
                            initial={{ x: 40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.25, delay: 0.1 }}
                        >
                            {/* Current workspace */}
                            <div className="act-ws-thumb act-ws-current" style={wpStyle}>
                                <div className="act-ws-scrim" />
                                {allWindows.filter((w) => !w.minimized).map((win) => (
                                    <div
                                        key={win.windowId}
                                        className="act-ws-mini-win"
                                        style={{
                                            left: `${(win.x / screenW) * 100}%`,
                                            top: `${(win.y / screenH) * 100}%`,
                                            width: `${Math.min((win.w / screenW) * 100, 45)}%`,
                                            height: `${Math.min((win.h / screenH) * 100, 45)}%`,
                                        }}
                                    />
                                ))}
                            </div>
                            {/* Empty workspace below (GNOME always shows next empty one) */}
                            <div className="act-ws-thumb act-ws-empty" style={wpStyle}>
                                <div className="act-ws-scrim" />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
