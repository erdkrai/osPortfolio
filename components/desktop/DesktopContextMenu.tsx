"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowStore } from "@/store/windows";
import { useSettingsStore, type DesktopSort, type IconSize } from "@/store/settings";
import { APPS } from "./Desktop";

interface ContextMenuState {
    x: number;
    y: number;
    visible: boolean;
    submenu?: string;
}

interface MenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    shortcut?: string;
    action?: () => void;
    submenu?: MenuItem[];
    divider?: boolean;
    toggle?: boolean;
    checked?: boolean;
    disabled?: boolean;
}

export function DesktopContextMenu() {
    const [menu, setMenu] = useState<ContextMenuState>({ x: 0, y: 0, visible: false });
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const [submenuPos, setSubmenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const submenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { openWindow } = useWindowStore();
    const {
        showDesktopIcons,
        setShowDesktopIcons,
        theme,
        setTheme,
        iconSize,
        setIconSize,
        desktopSort,
        setDesktopSort,
        dockAutoHide,
        setDockAutoHide,
        soundEffects,
        setSoundEffects,
    } = useSettingsStore();

    const openApp = useCallback((appId: string, initialData?: Record<string, unknown>) => {
        const app = APPS.find((a) => a.appId === appId);
        if (!app) return;
        openWindow({
            appId: app.appId,
            title: app.title,
            defaultSize: app.defaultSize,
            initialData,
        });
        setMenu((m) => ({ ...m, visible: false }));
    }, [openWindow]);

    const closeMenu = useCallback(() => {
        setMenu((m) => ({ ...m, visible: false }));
        setActiveSubmenu(null);
    }, []);

    // Context menu handler — only on the desktop bg, not child windows
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Only trigger on the desktop background wallpaper or the desktop icons area
            const isDesktopBg =
                target.closest(".wallpaper") ||
                target.closest("[data-desktop-area]") ||
                target.classList.contains("wallpaper");

            // Don't trigger inside windows, dock, topbar
            const isInsideWidget =
                target.closest("[data-window]") ||
                target.closest("[data-dock]") ||
                target.closest("[data-topbar]") ||
                target.closest("nav"); // mobile nav

            if (!isDesktopBg || isInsideWidget) return;

            e.preventDefault();
            e.stopPropagation();

            // Position with boundary check
            const menuW = 240;
            const menuH = 380;
            let x = e.clientX;
            let y = e.clientY;
            if (x + menuW > window.innerWidth) x = window.innerWidth - menuW - 8;
            if (y + menuH > window.innerHeight) y = window.innerHeight - menuH - 8;

            setMenu({ x, y, visible: true });
            setActiveSubmenu(null);
        };

        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                closeMenu();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeMenu();
        };

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [closeMenu]);

    const handleSubmenuEnter = (id: string, el: HTMLDivElement) => {
        if (submenuTimerRef.current) clearTimeout(submenuTimerRef.current);
        const rect = el.getBoundingClientRect();
        const submenuW = 200;
        let x = rect.right + 2;
        if (x + submenuW > window.innerWidth) x = rect.left - submenuW - 2;
        setSubmenuPos({ x, y: rect.top });
        setActiveSubmenu(id);
    };

    const handleSubmenuLeave = () => {
        submenuTimerRef.current = setTimeout(() => setActiveSubmenu(null), 200);
    };

    const handleSubmenuStay = () => {
        if (submenuTimerRef.current) clearTimeout(submenuTimerRef.current);
    };

    const menuItems: MenuItem[] = [
        {
            id: "new-window",
            label: "Open Terminal",
            icon: <TerminalIcon />,
            shortcut: "Ctrl+Alt+T",
            action: () => openApp("terminal"),
        },
        { id: "d1", label: "", divider: true },
        {
            id: "icon-size",
            label: "Icon Size",
            icon: <IconSizeIcon />,
            submenu: [
                { id: "icon-small", label: "Small", checked: iconSize === "small", action: () => { setIconSize("small"); closeMenu(); } },
                { id: "icon-medium", label: "Medium", checked: iconSize === "medium", action: () => { setIconSize("medium"); closeMenu(); } },
                { id: "icon-large", label: "Large", checked: iconSize === "large", action: () => { setIconSize("large"); closeMenu(); } },
            ],
        },
        { id: "d2", label: "", divider: true },
        {
            id: "desktop-icons",
            label: "Show Desktop Icons",
            toggle: true,
            checked: showDesktopIcons,
            action: () => {
                setShowDesktopIcons(!showDesktopIcons);
            },
        },
        {
            id: "dark-mode",
            label: "Dark Style",
            toggle: true,
            checked: theme === "dark",
            action: () => {
                setTheme(theme === "dark" ? "light" : "dark");
            },
        },
        {
            id: "auto-hide-dock",
            label: "Auto Hide Dock",
            toggle: true,
            checked: dockAutoHide,
            action: () => {
                setDockAutoHide(!dockAutoHide);
            },
        },
        {
            id: "sound-effects",
            label: "Sound Effects",
            toggle: true,
            checked: soundEffects,
            action: () => {
                setSoundEffects(!soundEffects);
            },
        },
        { id: "d3", label: "", divider: true },
        {
            id: "sort-by",
            label: "Sort Files",
            icon: <SortIcon />,
            submenu: [
                { id: "sort-name", label: "Name", checked: desktopSort === "name", action: () => { setDesktopSort("name"); closeMenu(); } },
                { id: "sort-modified", label: "Last Modified", checked: desktopSort === "modified", action: () => { setDesktopSort("modified"); closeMenu(); } },
                { id: "sort-size", label: "Size", checked: desktopSort === "size", action: () => { setDesktopSort("size"); closeMenu(); } },
                { id: "sort-type", label: "Type", checked: desktopSort === "type", action: () => { setDesktopSort("type"); closeMenu(); } },
            ],
        },
        { id: "d4", label: "", divider: true },
        {
            id: "change-bg",
            label: "Change Background…",
            icon: <WallpaperIcon />,
            action: () => openApp("settings", { tab: "background" }),
        },
        {
            id: "about",
            label: "About",
            icon: <AboutIcon />,
            action: () => openApp("settings", { tab: "about" }),
        },
    ];

    return (
        <AnimatePresence>
            {menu.visible && (
                <div ref={menuRef} className="fixed inset-0 z-[99999] pointer-events-none">
                    {/* Main menu */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.12, ease: [0.2, 0, 0, 1] }}
                        className="absolute pointer-events-auto"
                        style={{
                            left: menu.x,
                            top: menu.y,
                            transformOrigin: "top left",
                        }}
                    >
                        <div
                            className="w-[240px] rounded-xl py-1.5 shadow-2xl backdrop-blur-2xl"
                            style={{
                                background: "rgba(48, 48, 48, 0.95)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.1)",
                            }}
                        >
                            {menuItems.map((item) => {
                                if (item.divider) {
                                    return (
                                        <div
                                            key={item.id}
                                            className="mx-3 my-1"
                                            style={{ height: 1, background: "rgba(255,255,255,0.08)" }}
                                        />
                                    );
                                }

                                const hasSubmenu = !!item.submenu;

                                return (
                                    <div
                                        key={item.id}
                                        ref={(el) => {
                                            if (hasSubmenu && el) {
                                                el.dataset.submenuId = item.id;
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            if (hasSubmenu) {
                                                handleSubmenuEnter(item.id, e.currentTarget);
                                            } else {
                                                setActiveSubmenu(null);
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            if (hasSubmenu) handleSubmenuLeave();
                                        }}
                                        onClick={() => {
                                            if (item.disabled) return;
                                            if (!hasSubmenu && item.action) {
                                                item.action();
                                                if (!item.toggle) closeMenu();
                                            }
                                        }}
                                        className="group flex items-center gap-2.5 px-3 py-[6px] mx-1.5 rounded-lg cursor-default transition-colors"
                                        style={{
                                            color: item.disabled ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)",
                                        }}
                                        onMouseOver={(e) => {
                                            if (!item.disabled) {
                                                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = "transparent";
                                        }}
                                    >
                                        {/* Icon or Toggle */}
                                        {item.toggle ? (
                                            <ToggleSwitch checked={!!item.checked} />
                                        ) : (
                                            <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: 0.7 }}>
                                                {item.icon || <span style={{ width: 16 }} />}
                                            </span>
                                        )}

                                        {/* Label */}
                                        <span className="text-[13px] flex-1">{item.label}</span>

                                        {/* Shortcut or submenu arrow */}
                                        {item.shortcut && (
                                            <span className="text-[11px] opacity-40 ml-auto">{item.shortcut}</span>
                                        )}
                                        {hasSubmenu && (
                                            <svg className="w-3 h-3 opacity-40 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                            </svg>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Submenu */}
                    <AnimatePresence>
                        {activeSubmenu && (() => {
                            const parentItem = menuItems.find((m) => m.id === activeSubmenu);
                            if (!parentItem?.submenu) return null;
                            return (
                                <motion.div
                                    key={activeSubmenu}
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -4 }}
                                    transition={{ duration: 0.1 }}
                                    className="absolute pointer-events-auto"
                                    style={{ left: submenuPos.x, top: submenuPos.y }}
                                    onMouseEnter={handleSubmenuStay}
                                    onMouseLeave={handleSubmenuLeave}
                                >
                                    <div
                                        className="w-[200px] rounded-xl py-1.5 shadow-2xl backdrop-blur-2xl"
                                        style={{
                                            background: "rgba(48, 48, 48, 0.95)",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                                        }}
                                    >
                                        {parentItem.submenu.map((sub) => (
                                            <div
                                                key={sub.id}
                                                onClick={() => {
                                                    sub.action?.();
                                                }}
                                                className="flex items-center gap-2 px-3 py-[6px] mx-1.5 rounded-lg cursor-default transition-colors"
                                                style={{ color: "rgba(255,255,255,0.9)" }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.background = "transparent";
                                                }}
                                            >
                                                <span style={{ width: 14, textAlign: "center", fontSize: 12, opacity: sub.checked ? 1 : 0 }}>✓</span>
                                                <span className="text-[13px]">{sub.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })()}
                    </AnimatePresence>
                </div>
            )}
        </AnimatePresence>
    );
}

/* ── Inline SVG icons ── */
function ToggleSwitch({ checked }: { checked: boolean }) {
    return (
        <div
            style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                position: "relative",
                flexShrink: 0,
                background: checked ? "#E95420" : "rgba(255,255,255,0.2)",
                transition: "background 0.2s ease",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: 2,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    transition: "transform 0.2s ease",
                    transform: checked ? "translateX(18px)" : "translateX(2px)",
                }}
            />
        </div>
    );
}

function TerminalIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-8-2h6v-2h-6v2zm-3.41-1.41L7.17 13l1.42-1.59L6.17 9l2.42-2.41L7.17 5.17l-4 4 4 4z" />
        </svg>
    );
}

function SortIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
        </svg>
    );
}

function IconSizeIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="13" y="3" width="8" height="8" rx="2" opacity="0.5" />
            <rect x="13" y="14" width="5" height="5" rx="1" opacity="0.3" />
        </svg>
    );
}

function WallpaperIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z" />
        </svg>
    );
}

function AboutIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
    );
}
