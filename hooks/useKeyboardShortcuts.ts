"use client";

import { useEffect, useCallback, useRef } from "react";
import { useWindowStore } from "@/store/windows";
import { useSettingsStore } from "@/store/settings";
import { playLockSound } from "@/lib/sound";
import { getIsMac } from "@/lib/shortcuts";

/**
 * Matches key combos and dispatches actions.
 * Handles both macOS (⌘ = Meta) and Windows/Linux (Super = Meta, Ctrl) bindings.
 */
interface UseKeyboardShortcutsOptions {
    onActivities: () => void;
    onShowApps: () => void;
}

export function useKeyboardShortcuts({ onActivities, onShowApps }: UseKeyboardShortcutsOptions) {
    const {
        windows,
        activeWindowId,
        openWindow,
        closeActiveWindow,
        minimizeWindow,
        toggleMaximize,
        snapWindow,
        focusWindow,
    } = useWindowStore();

    const { lockScreen } = useSettingsStore();

    const windowsRef = useRef(windows);
    windowsRef.current = windows;
    const activeRef = useRef(activeWindowId);
    activeRef.current = activeWindowId;

    const isMac = typeof navigator !== "undefined" && getIsMac();

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const meta = e.metaKey || e.key === "Meta";
            const ctrl = e.ctrlKey;
            const alt = e.altKey;
            const shift = e.shiftKey;
            const key = e.key.toLowerCase();

            // Ignore when typing inside an input / textarea / contenteditable
            const tag = (e.target as HTMLElement)?.tagName;
            const editable = (e.target as HTMLElement)?.isContentEditable;
            if ((tag === "INPUT" || tag === "TEXTAREA" || editable) && !meta && !ctrl) return;

            // Use e.code for physical key detection (Ctrl+Alt produces Unicode chars on Mac)
            const code = e.code;

            /* ── Alt + 1 — Activities overview ── */
            if (alt && code === "Digit1" && !ctrl && !meta && !shift) {
                e.preventDefault();
                onActivities();
                return;
            }

            /* ── Alt + 2 — Show Applications ── */
            if (alt && code === "Digit2" && !ctrl && !meta && !shift) {
                e.preventDefault();
                onShowApps();
                return;
            }

            /* ── Ctrl + Alt combos (App launchers) — same on both platforms ── */
            if (ctrl && alt && !shift && !meta) {
                let handled = true;
                switch (code) {
                    case "KeyT":
                        openWindow({ appId: "terminal", title: "Terminal", defaultSize: { w: 720, h: 480 } });
                        break;
                    case "KeyA":
                        openWindow({ appId: "about", title: "About Me", defaultSize: { w: 560, h: 500 } });
                        break;
                    case "KeyP":
                        openWindow({ appId: "projects", title: "Projects", defaultSize: { w: 900, h: 620 } });
                        break;
                    case "KeyE":
                        openWindow({ appId: "photos", title: "Photos", defaultSize: { w: 900, h: 640 } });
                        break;
                    case "KeyG":
                        openWindow({ appId: "games", title: "Games", defaultSize: { w: 740, h: 520 } });
                        break;
                    case "KeyM":
                        openWindow({ appId: "music", title: "Music", defaultSize: { w: 580, h: 640 } });
                        break;
                    case "KeyR":
                        openWindow({ appId: "resume", title: "Resume", defaultSize: { w: 800, h: 640 } });
                        break;
                    default:
                        handled = false;
                }
                if (handled) { e.preventDefault(); return; }
            }

            /* ── Close window — macOS: ⌘+Q, Windows: Ctrl+Q ── */
            if (isMac) {
                if (meta && key === "q" && !ctrl && !alt && !shift) {
                    e.preventDefault();
                    closeActiveWindow();
                    return;
                }
            } else {
                if (ctrl && key === "q" && !alt && !shift && !meta) {
                    e.preventDefault();
                    closeActiveWindow();
                    return;
                }
            }

            /* ── Super/⌘ + key combos ── */
            if (meta && !ctrl && !alt) {
                let handled = true;
                switch (key) {
                    case "d": {
                        const wins = windowsRef.current;
                        const anyVisible = wins.some((w) => !w.minimized);
                        if (anyVisible) {
                            wins.forEach((w) => { if (!w.minimized) minimizeWindow(w.windowId); });
                        }
                        break;
                    }
                    case "l":
                        playLockSound();
                        lockScreen();
                        break;
                    case "h":
                        if (activeRef.current) minimizeWindow(activeRef.current);
                        break;
                    case "arrowup":
                        if (activeRef.current) toggleMaximize(activeRef.current);
                        break;
                    case "arrowdown":
                        if (activeRef.current) {
                            const win = windowsRef.current.find((w) => w.windowId === activeRef.current);
                            if (win?.maximized) toggleMaximize(activeRef.current);
                        }
                        break;
                    case "arrowleft":
                        if (activeRef.current) snapWindow(activeRef.current, "left");
                        break;
                    case "arrowright":
                        if (activeRef.current) snapWindow(activeRef.current, "right");
                        break;
                    case "k":
                        openWindow({ appId: "shortcuts", title: "Keyboard Shortcuts", defaultSize: { w: 680, h: 560 } });
                        break;
                    case "i":
                        openWindow({ appId: "settings", title: "Settings", defaultSize: { w: 900, h: 600 } });
                        break;
                    default:
                        handled = false;
                }
                if (handled) { e.preventDefault(); return; }
            }

            /* ── Alt + Tab — cycle windows ── */
            if (alt && key === "tab" && !ctrl && !meta) {
                e.preventDefault();
                const wins = windowsRef.current.filter((w) => !w.minimized);
                if (wins.length < 2) return;
                const sorted = [...wins].sort((a, b) => b.z - a.z);
                const currentIdx = sorted.findIndex((w) => w.windowId === activeRef.current);
                const nextIdx = (currentIdx + 1) % sorted.length;
                focusWindow(sorted[nextIdx].windowId);
                return;
            }

            /* ── Full screen — F11 (Windows/Linux), Ctrl+⌘+F (macOS) ── */
            if (isMac) {
                if (ctrl && meta && key === "f" && !alt && !shift) {
                    e.preventDefault();
                    if (document.fullscreenElement) document.exitFullscreen();
                    else document.documentElement.requestFullscreen();
                    return;
                }
            } else {
                if (key === "f11" && !ctrl && !alt && !meta && !shift) {
                    e.preventDefault();
                    if (document.fullscreenElement) document.exitFullscreen();
                    else document.documentElement.requestFullscreen();
                    return;
                }
            }
        },
        [openWindow, closeActiveWindow, minimizeWindow, toggleMaximize, snapWindow, focusWindow, lockScreen, onActivities, onShowApps, isMac]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);
}
