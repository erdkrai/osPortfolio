"use client";

import { useRef, useEffect, useCallback } from "react";
import { useWindowStore, WindowInstance, SnapZone } from "@/store/windows";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface WindowSnapMenuProps {
    win: WindowInstance;
    anchorRef: React.RefObject<HTMLButtonElement | null>;
    onClose: () => void;
}

// ---------- SVG tile icons (macOS-style) ----------
// Each icon is a 36×26 rounded rect with a highlighted region
function TileIcon({ highlighted, className }: { highlighted: React.ReactNode; className?: string }) {
    return (
        <svg width="36" height="26" viewBox="0 0 36 26" fill="none" className={className}>
            <rect x="0.5" y="0.5" width="35" height="25" rx="3" stroke="currentColor" strokeOpacity="0.25" />
            {highlighted}
        </svg>
    );
}

// Move & Resize icons
function IconLeft() {
    return <TileIcon highlighted={<rect x="1" y="1" width="17" height="24" rx="2.5" fill="currentColor" fillOpacity="0.85" />} />;
}
function IconRight() {
    return <TileIcon highlighted={<rect x="18" y="1" width="17" height="24" rx="2.5" fill="currentColor" fillOpacity="0.85" />} />;
}
function IconTop() {
    return <TileIcon highlighted={<rect x="1" y="1" width="34" height="12" rx="2.5" fill="currentColor" fillOpacity="0.85" />} />;
}
function IconBottom() {
    return <TileIcon highlighted={<rect x="1" y="13" width="34" height="12" rx="2.5" fill="currentColor" fillOpacity="0.85" />} />;
}

// Fill & Arrange icons
function IconTopLeft() {
    return <TileIcon highlighted={<rect x="1" y="1" width="17" height="12" rx="2.5" fill="currentColor" fillOpacity="0.85" />} />;
}
function IconTopRight() {
    return <TileIcon highlighted={<rect x="18" y="1" width="17" height="12" rx="2.5" fill="currentColor" fillOpacity="0.85" />} />;
}
function IconBottomLeft() {
    return <TileIcon highlighted={<rect x="1" y="13" width="17" height="12" rx="2.5" fill="currentColor" fillOpacity="0.85" />} />;
}
function IconBottomRight() {
    return <TileIcon highlighted={<rect x="18" y="13" width="17" height="12" rx="2.5" fill="currentColor" fillOpacity="0.85" />} />;
}

// Full-screen icon
function IconFullScreen() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <rect x="3" y="3" width="10" height="10" rx="1" fill="currentColor" fillOpacity="0.35" />
        </svg>
    );
}

const MOVE_RESIZE: { zone: SnapZone; label: string; Icon: () => React.JSX.Element }[] = [
    { zone: "left", label: "Left", Icon: IconLeft },
    { zone: "right", label: "Right", Icon: IconRight },
    { zone: "top-left", label: "Top", Icon: IconTop },       // reusing top-left zone as "top half"
    { zone: "bottom-left", label: "Bottom", Icon: IconBottom }, // reusing bottom-left zone as "bottom half"
];

const FILL_ARRANGE: { zone: SnapZone; label: string; Icon: () => React.JSX.Element }[] = [
    { zone: "top-left", label: "Top Left", Icon: IconTopLeft },
    { zone: "top-right", label: "Top Right", Icon: IconTopRight },
    { zone: "bottom-left", label: "Bottom Left", Icon: IconBottomLeft },
    { zone: "bottom-right", label: "Bottom Right", Icon: IconBottomRight },
];

export function WindowSnapMenu({ win, anchorRef, onClose }: WindowSnapMenuProps) {
    const { snapWindow, unsnapWindow, toggleMaximize } = useWindowStore();
    const menuRef = useRef<HTMLDivElement>(null);

    const handleSnap = useCallback((zone: SnapZone) => {
        if (win.snapZone === zone) {
            unsnapWindow(win.windowId);
        } else {
            snapWindow(win.windowId, zone);
        }
        onClose();
    }, [win.snapZone, win.windowId, snapWindow, unsnapWindow, onClose]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute top-full mt-2 left-0 z-50"
            >
                <div
                    ref={menuRef}
                    className="backdrop-blur-2xl bg-[#2a2a2a]/90 border border-white/[0.08] rounded-[14px] shadow-[0_8px_40px_rgba(0,0,0,0.55)] p-3 min-w-[240px]"
                >
                    {/* Move & Resize */}
                    <div className="text-[11px] font-medium text-white/40 px-1 pb-2 tracking-wide">
                        Move &amp; Resize
                    </div>
                    <div className="flex gap-1.5 mb-2">
                        {MOVE_RESIZE.map(({ zone, label, Icon }) => (
                            <button
                                key={`mr-${zone}`}
                                onClick={() => handleSnap(zone)}
                                className={clsx(
                                    "flex-1 flex items-center justify-center p-2 rounded-lg transition-all",
                                    win.snapZone === zone
                                        ? "bg-white/15 text-white"
                                        : "hover:bg-white/[0.08] text-white/60 hover:text-white/80"
                                )}
                                title={label}
                            >
                                <Icon />
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/[0.08] mx-1 my-2" />

                    {/* Fill & Arrange */}
                    <div className="text-[11px] font-medium text-white/40 px-1 pb-2 tracking-wide">
                        Fill &amp; Arrange
                    </div>
                    <div className="flex gap-1.5 mb-2">
                        {FILL_ARRANGE.map(({ zone, label, Icon }) => (
                            <button
                                key={`fa-${zone}`}
                                onClick={() => handleSnap(zone)}
                                className={clsx(
                                    "flex-1 flex items-center justify-center p-2 rounded-lg transition-all",
                                    win.snapZone === zone
                                        ? "bg-white/15 text-white"
                                        : "hover:bg-white/[0.08] text-white/60 hover:text-white/80"
                                )}
                                title={label}
                            >
                                <Icon />
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/[0.08] mx-1 my-2" />

                    {/* Full Screen */}
                    <button
                        onClick={() => {
                            if (win.snapZone) {
                                unsnapWindow(win.windowId);
                            }
                            toggleMaximize(win.windowId);
                            onClose();
                        }}
                        className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-left text-[13px] hover:bg-white/[0.08] transition-colors text-white/70 hover:text-white/90"
                    >
                        <IconFullScreen />
                        <span className="flex-1">Full Screen</span>
                        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="text-white/30">
                            <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}