"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { useWindowStore } from "@/store/windows";
import { useSettingsStore, DockPosition } from "@/store/settings";
import { AppConfig } from "./Desktop";
import { clsx } from "clsx";

interface DockProps {
    apps: AppConfig[];
}

// Magnification config
const DEFAULT_MAGNIFICATION = 60;   // magnified size in px
const DEFAULT_DISTANCE = 140;       // pixel range of the magnification field

// Spring config matching macOS feel — snappy but smooth
const DOCK_SPRING = { mass: 0.1, stiffness: 150, damping: 12 };

// Function that generates dock icons with dynamic size
const getDockIcons = (iconSizeClass: string): Record<string, React.ReactNode> => ({
    about: (
        <svg viewBox="0 0 48 48" fill="none" className={iconSizeClass}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#d-about)" />
            <circle cx="24" cy="18" r="7" fill="white" />
            <path d="M12 42c0-8 5.4-13 12-13s12 5 12 13" fill="white" />
            <defs>
                <linearGradient id="d-about" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3584e4" /><stop offset="1" stopColor="#1a5fb4" />
                </linearGradient>
            </defs>
        </svg>
    ),
    projects: (
        <svg viewBox="0 0 48 48" fill="none" className={iconSizeClass}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#d-proj)" />
            <rect x="10" y="8" width="28" height="32" rx="4" fill="white" fillOpacity="0.15" />
            <path d="M15 18l-4 5 4 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M33 18l4 5-4 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M27 14l-6 20" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <defs>
                <linearGradient id="d-proj" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1c71d8" /><stop offset="1" stopColor="#1a5fb4" />
                </linearGradient>
            </defs>
        </svg>
    ),
    resume: (
        <svg viewBox="0 0 48 48" fill="none" className={iconSizeClass}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#d-res)" />
            <rect x="10" y="6" width="28" height="36" rx="3" fill="white" />
            <path d="M28 6v8h10" fill="#ddd" />
            <path d="M28 6l10 8" stroke="#ccc" strokeWidth="0.5" />
            <rect x="15" y="18" width="18" height="2" rx="1" fill="#c0392b" opacity="0.7" />
            <rect x="15" y="23" width="14" height="2" rx="1" fill="#bbb" />
            <rect x="15" y="28" width="16" height="2" rx="1" fill="#bbb" />
            <rect x="15" y="33" width="10" height="2" rx="1" fill="#bbb" />
            <defs>
                <linearGradient id="d-res" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#e01b24" /><stop offset="1" stopColor="#c01c28" />
                </linearGradient>
            </defs>
        </svg>
    ),
    terminal: (
        <svg viewBox="0 0 48 48" fill="none" className={iconSizeClass}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#d-term)" />
            <path d="M12 18l7 6-7 6" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 32h14" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" opacity="0.7" />
            <defs>
                <linearGradient id="d-term" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#300a24" /><stop offset="1" stopColor="#241f31" />
                </linearGradient>
            </defs>
        </svg>
    ),
    settings: (
        <svg viewBox="0 0 48 48" fill="none" className={iconSizeClass}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#d-settings)" />
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
                <linearGradient id="d-settings" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6d6d6d" /><stop offset="1" stopColor="#464646" />
                </linearGradient>
            </defs>
        </svg>
    ),
    photos: (
        <svg viewBox="0 0 48 48" fill="none" className={iconSizeClass}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#d-photos)" />
            <circle cx="16" cy="16" r="5" fill="#f6d32d" />
            <path d="M4 36l11-13 7 8 6-6 16 11H4z" fill="white" fillOpacity="0.9" />
            <defs>
                <linearGradient id="d-photos" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#26a269" /><stop offset="1" stopColor="#1a8553" />
                </linearGradient>
            </defs>
        </svg>
    ),
    games: (
        <svg viewBox="0 0 48 48" fill="none" className={iconSizeClass}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#d-games)" />
            <path d="M8 14a2 2 0 012-2h8.5a2 2 0 011.6.8L22 15h16a2 2 0 012 2v17a2 2 0 01-2 2H10a2 2 0 01-2-2V14z" fill="white" fillOpacity="0.9" />
            <rect x="17" y="22" width="14" height="9" rx="3" fill="#5e5c64" />
            <circle cx="21" cy="26" r="1.2" fill="white" />
            <circle cx="27" cy="26" r="1.2" fill="white" />
            <rect x="23" y="24.5" width="2" height="3" rx="1" fill="white" fillOpacity="0.5" />
            <defs>
                <linearGradient id="d-games" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#613583" /><stop offset="1" stopColor="#462a63" />
                </linearGradient>
            </defs>
        </svg>
    ),
    snake: (
        <svg viewBox="0 0 48 48" fill="none" className={iconSizeClass}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#d-snake)" />
            <path d="M10 34c2-10 6-10 10-6s4 8 8 6 4-10 8-10 4 4 4 8" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="12" cy="27" r="2.5" fill="white" />
            <circle cx="11" cy="26" r="1" fill="#2ec27e" />
            <defs>
                <linearGradient id="d-snake" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#26a269" /><stop offset="1" stopColor="#1a7a4c" />
                </linearGradient>
            </defs>
        </svg>
    ),
    tetris: (
        <svg viewBox="0 0 48 48" fill="none" className={iconSizeClass}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#d-tetris)" />
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
                <linearGradient id="d-tetris" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#241f31" /><stop offset="1" stopColor="#1a1528" />
                </linearGradient>
            </defs>
        </svg>
    ),
    minesweeper: (
        <svg viewBox="0 0 48 48" fill="none" className={iconSizeClass}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#d-mines)" />
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
                <linearGradient id="d-mines" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#77767b" /><stop offset="1" stopColor="#504e55" />
                </linearGradient>
            </defs>
        </svg>
    ),
    music: (
        <svg viewBox="0 0 48 48" fill="none" className={iconSizeClass}>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#d-music)" />
            <path d="M20 34V16l14-4v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="16" cy="34" r="4" fill="white" />
            <circle cx="30" cy="30" r="4" fill="white" />
            <defs>
                <linearGradient id="d-music" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#e66100" /><stop offset="1" stopColor="#c64600" />
                </linearGradient>
            </defs>
        </svg>
    ),
});

/* ─── Per-icon component: uses motion values for GPU-accelerated magnification ─── */
interface DockItemProps {
    app: AppConfig;
    mouseX: MotionValue<number>;
    dockIconSize: number;
    dockPosition: DockPosition;
    accentColor: string;
    isOpen: boolean;
    isActive: boolean;
    indicatorPosition: string;
    icon: React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
}

function DockItem({ app, mouseX, dockIconSize, dockPosition, accentColor, isOpen, isActive, indicatorPosition, icon, onClick }: DockItemProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);

    const isVertical = dockPosition === "left" || dockPosition === "right";
    const magnifiedSize = Math.max(dockIconSize * 1.7, DEFAULT_MAGNIFICATION);
    const distance = DEFAULT_DISTANCE;

    // Transform: compute distance from mouse to this icon's center → magnified size
    const sizeTransform = useTransform(mouseX, (val: number) => {
        const el = ref.current;
        if (!el || val === -9999) return dockIconSize;
        const bounds = el.getBoundingClientRect();
        const center = isVertical
            ? bounds.top + bounds.height / 2
            : bounds.left + bounds.width / 2;
        const d = val - center;
        // Gaussian-like falloff for a natural macOS feel
        const scale = Math.exp(-0.5 * (d / (distance * 0.45)) ** 2);
        return dockIconSize + (magnifiedSize - dockIconSize) * scale;
    });

    // Spring-smooth the size so it feels bouncy like macOS
    const size = useSpring(sizeTransform, DOCK_SPRING);

    // Icon inner size (72% of the magnified button)
    const iconWidth = useTransform(size, (s: number) => s * 0.72);
    const iconHeight = useTransform(size, (s: number) => s * 0.72);

    // Layout cell dimensions: expand along the dock axis, fixed perpendicular
    // This pushes neighbors apart (like macOS) while keeping dock thickness constant
    const cellWidth = isVertical ? dockIconSize : size;
    const cellHeight = isVertical ? size : dockIconSize;

    // Tooltip offset: accounts for the magnified icon overflowing beyond the cell
    // For bottom: tooltip bottom = icon overshoot + gap (8px)
    // For side: tooltip offset = icon overshoot + gap
    const tooltipOffset = useTransform(size, (s: number) => {
        const overshoot = Math.max(s - dockIconSize, 0);
        return overshoot + 8;
    });

    return (
        <div className={clsx("relative flex items-center gap-0.5", indicatorPosition)}>
            {/* Layout cell — expands along dock axis to space neighbors, fixed on the other */}
            <motion.div
                ref={ref}
                className="relative flex items-end justify-center"
                style={{
                    width: cellWidth,
                    height: cellHeight,
                    // For side docks, align icons to edge
                    ...(dockPosition === "left" && { justifyContent: "flex-start" }),
                    ...(dockPosition === "right" && { justifyContent: "flex-end" }),
                }}
            >
                {/* Tooltip — dynamically offset to stay above the magnified icon */}
                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.9 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={clsx(
                                "absolute z-50 pointer-events-none whitespace-nowrap",
                                "px-2.5 py-1 rounded-md text-xs font-medium",
                                "bg-[#3c3c3c] text-white shadow-lg border border-white/10",
                                dockPosition === "bottom" && "bottom-full left-1/2 -translate-x-1/2",
                                dockPosition === "left" && "left-full top-1/2 -translate-y-1/2",
                                dockPosition === "right" && "right-full top-1/2 -translate-y-1/2"
                            )}
                            style={{
                                ...(dockPosition === "bottom" && { marginBottom: tooltipOffset }),
                                ...(dockPosition === "left" && { marginLeft: tooltipOffset }),
                                ...(dockPosition === "right" && { marginRight: tooltipOffset }),
                            }}
                        >
                            {app.title}
                            <div
                                className={clsx(
                                    "absolute w-2 h-2 bg-[#3c3c3c] rotate-45 border-white/10",
                                    dockPosition === "bottom" && "-bottom-1 left-1/2 -translate-x-1/2 border-b border-r",
                                    dockPosition === "left" && "-right-1 top-1/2 -translate-y-1/2 border-t border-r",
                                    dockPosition === "right" && "-left-1 top-1/2 -translate-y-1/2 border-b border-l"
                                )}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* The icon itself — pops outward from the dock surface */}
                <motion.button
                    onClick={onClick}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    aria-label={`Open ${app.title}`}
                    className={clsx(
                        "flex items-center justify-center rounded-xl",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]/60",
                        isActive ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
                    )}
                    style={{
                        width: size,
                        height: size,
                    }}
                >
                    <motion.div
                        className="flex items-center justify-center [&>svg]:!w-full [&>svg]:!h-full"
                        style={{
                            width: iconWidth,
                            height: iconHeight,
                        }}
                    >
                        {icon}
                    </motion.div>
                </motion.button>
            </motion.div>
            {/* Running indicator */}
            <div
                className={clsx(
                    "rounded-full transition-all duration-200",
                    "w-1 h-1",
                    isOpen ? "shadow-[0_0_4px_currentColor]" : "bg-transparent"
                )}
                style={isOpen ? { backgroundColor: accentColor, color: accentColor } : {}}
            />
        </div>
    );
}

/* ─── Main Dock ─── */
export function Dock({ apps }: DockProps) {
    const { windows, openWindow, focusWindow, restoreWindow, activeWindowId } = useWindowStore();
    const { dockPosition, dockAutoHide, dockIconSize, accentColor } = useSettingsStore();
    const [isHovered, setIsHovered] = useState(false);

    // Single motion value shared across all DockItems — no React re-renders
    const mouseX = useMotionValue(-9999);

    const handleDockClick = (e: React.MouseEvent, app: AppConfig) => {
        const existing = windows.find((w) => w.appId === app.appId);
        const rect = e.currentTarget.getBoundingClientRect();
        const dockRect = { x: rect.left, y: rect.top, w: rect.width, h: rect.height };

        if (!existing) {
            openWindow({
                appId: app.appId,
                title: app.title,
                defaultSize: app.defaultSize,
                originRect: dockRect,
                dockRect: dockRect
            });
        } else if (existing.minimized) {
            restoreWindow(existing.windowId, dockRect);
        } else {
            focusWindow(existing.windowId, dockRect);
        }
    };

    // Calculate icon size class based on dockIconSize
    const getIconSizeClass = (size: number): string => {
        if (size <= 44) return "w-7 h-7";
        if (size <= 52) return "w-8 h-8";
        if (size <= 60) return "w-9 h-9";
        return "w-10 h-10";
    };

    const iconSizeClass = getIconSizeClass(dockIconSize);
    const dockIcons = getDockIcons(iconSizeClass);

    const isVertical = dockPosition === "left" || dockPosition === "right";

    // Position classes
    const getPositionClasses = (position: DockPosition) => {
        switch (position) {
            case "left":
                return "fixed left-3 top-1/2 -translate-y-1/2 flex-col items-start";
            case "right":
                return "fixed right-3 top-1/2 -translate-y-1/2 flex-col items-end";
            case "bottom":
            default:
                return "fixed bottom-3 left-1/2 -translate-x-1/2 flex-row items-end";
        }
    };

    // Gap classes based on position
    const getGapClass = (position: DockPosition) => {
        switch (position) {
            case "left":
            case "right":
                return "gap-1.5";
            case "bottom":
            default:
                return "gap-1.5";
        }
    };

    // Padding classes based on position
    const getPaddingClass = (position: DockPosition) => {
        switch (position) {
            case "left":
                return "py-3 px-2";
            case "right":
                return "py-3 px-2";
            case "bottom":
            default:
                return "px-3 py-2";
        }
    };

    // Running indicator position
    const getIndicatorPosition = (position: DockPosition) => {
        switch (position) {
            case "left":
                return "flex-row";
            case "right":
                return "flex-row";
            case "bottom":
            default:
                return "flex-col";
        }
    };

    const positionClasses = getPositionClasses(dockPosition);
    const gapClass = getGapClass(dockPosition);
    const paddingClass = getPaddingClass(dockPosition);
    const indicatorPosition = getIndicatorPosition(dockPosition);

    return (
        <>
            {/* Desktop dock */}
            <motion.div
                initial={{ opacity: 1 }}
                animate={{
                    opacity: dockAutoHide ? (isHovered ? 1 : 0) : 1,
                    transform: dockAutoHide ? (isHovered ? "translateX(0)" : dockPosition === "left" ? "translateX(-20px)" : dockPosition === "right" ? "translateX(20px)" : "translateY(20px)") : "translateX(0)"
                }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => { setIsHovered(false); mouseX.set(-9999); }}
                onMouseMove={(e) => mouseX.set(isVertical ? e.clientY : e.clientX)}
                className={clsx(
                    "hidden md:flex z-[9999]",
                    positionClasses,
                    gapClass,
                    paddingClass,
                    "rounded-2xl ubuntu-dock"
                )}
                aria-label="Application dock"
            >
                {apps.map((app) => {
                    const win = windows.find((w) => w.appId === app.appId);
                    const isOpen = !!win;
                    const isActive = win?.windowId === activeWindowId && !win?.minimized;

                    return (
                        <DockItem
                            key={app.appId}
                            app={app}
                            mouseX={mouseX}
                            dockIconSize={dockIconSize}
                            dockPosition={dockPosition}
                            accentColor={accentColor}
                            isOpen={isOpen}
                            isActive={isActive}
                            indicatorPosition={indicatorPosition}
                            icon={dockIcons[app.icon]}
                            onClick={(e) => handleDockClick(e, app)}
                        />
                    );
                })}

            </motion.div>

            {/* Mobile bottom nav */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-around px-4 py-2
          bg-[var(--bg-tertiary)]/95 backdrop-blur-xl border-t border-[var(--border-color)]"
                aria-label="Mobile navigation"
            >
                {apps.map((app) => {
                    const isOpen = windows.some((w) => w.appId === app.appId && !w.minimized);
                    return (
                        <button
                            key={app.appId}
                            onClick={(e) => handleDockClick(e, app)}
                            aria-label={`Open ${app.title}`}
                            className={clsx(
                                "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-150",
                                isOpen ? "opacity-100" : "opacity-60 hover:opacity-90"
                            )}
                        >
                            {dockIcons[app.icon]}
                            <span className="text-[var(--text-secondary)] text-[10px] font-medium">{app.title}</span>
                        </button>
                    );
                })}
            </nav>
        </>
    );
}