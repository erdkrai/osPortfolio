"use client";

import { useRef, useState, useCallback } from "react";
import { useWindowStore, WindowInstance } from "@/store/windows";
import { WindowSnapMenu } from "./WindowSnapMenu";

interface WindowControlsProps {
    window: WindowInstance;
}

const LONG_PRESS_MS = 500;

export function WindowControls({ window: win }: WindowControlsProps) {
    const { closeWindow, minimizeWindow, toggleMaximize } = useWindowStore();
    const [menuOpen, setMenuOpen] = useState(false);

    // Ref to the green button so the menu can read its position
    const maxBtnRef = useRef<HTMLButtonElement>(null);

    // Long-press timer ref
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Track whether the long-press fired (so pointerUp doesn't also toggle maximize)
    const didLongPressRef = useRef(false);

    const startLongPress = (e: React.PointerEvent) => {
        e.stopPropagation();
        didLongPressRef.current = false;
        timerRef.current = setTimeout(() => {
            didLongPressRef.current = true;
            setMenuOpen(true);
        }, LONG_PRESS_MS);
    };

    const cancelLongPress = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleMaxPointerDown = (e: React.PointerEvent) => {
        startLongPress(e);
    };

    const handleMaxPointerUp = (e: React.PointerEvent) => {
        cancelLongPress();
        // Only toggle maximize on a short tap (not after long-press opened the menu)
        if (!didLongPressRef.current) {
            e.stopPropagation();
            toggleMaximize(win.windowId);
        }
    };

    const handleMaxPointerLeave = () => {
        cancelLongPress();
    };

    const closeMenu = useCallback(() => setMenuOpen(false), []);

    return (
        <div className="flex items-center gap-2 relative">
            {/* Close */}
            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(win.windowId);
                }}
                className="wm-btn wm-btn-close group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                aria-label={`Close ${win.title}`}
                title="Close"
            >
                <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                    <path d="M1 1l6 6M7 1L1 7" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>

            {/* Minimize */}
            {!win.disableMinimize && (
            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    minimizeWindow(win.windowId);
                }}
                className="wm-btn wm-btn-min group focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                aria-label={`Minimize ${win.title}`}
                title="Minimize"
            >
                <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4h6" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>
            )}

            {/* Maximize / Restore — long-press opens snap menu */}
            {!win.disableResize && (
            <button
                ref={maxBtnRef}
                onPointerDown={handleMaxPointerDown}
                onPointerUp={handleMaxPointerUp}
                onPointerLeave={handleMaxPointerLeave}
                className="wm-btn wm-btn-max group focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                aria-label={win.maximized ? "Restore window" : "Maximize window"}
                title={win.maximized ? "Restore (hold for options)" : "Maximize (hold for options)"}
            >
                {win.maximized ? (
                    /* Restore icon */
                    <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                        <rect x="2.5" y="0.5" width="5" height="5" rx="0.75" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" />
                        <rect x="0.5" y="2.5" width="5" height="5" rx="0.75" fill="rgba(0,0,0,0.15)" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" />
                    </svg>
                ) : (
                    /* Maximize icon */
                    <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                        <rect x="1" y="1" width="6" height="6" rx="1" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />
                    </svg>
                )}
            </button>

            )}

            {/* Snap menu popover */}
            {menuOpen && (
                <WindowSnapMenu
                    win={win}
                    anchorRef={maxBtnRef}
                    onClose={closeMenu}
                />
            )}
        </div>
    );
}