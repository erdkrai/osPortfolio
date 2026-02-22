"use client";

import { useState, useEffect } from "react";
import { useSettingsStore, Theme, DockPosition, IconSize, accentColors } from "@/store/settings";
import { clsx } from "clsx";

type SidebarItem =
    | "background"
    | "appearance"
    | "desktop"
    | "dock"
    | "sound"
    | "about";

const sidebarItems: { id: SidebarItem; label: string; icon: string }[] = [
    { id: "background", label: "Background", icon: "" },
    { id: "appearance", label: "Appearance", icon: "" },
    { id: "desktop", label: "Desktop", icon: "" },
    { id: "dock", label: "Dock", icon: "" },
    { id: "sound", label: "Sound", icon: "" },
    { id: "about", label: "About", icon: "" },
];

// Icons as SVG components
const WallpaperIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
    </svg>
);

const PaletteIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
);

const DesktopIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
);

const DockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="4" y="16" width="16" height="4" rx="1" />
        <circle cx="8" cy="14" r="1.5" fill="currentColor" />
        <circle cx="12" cy="14" r="1.5" fill="currentColor" />
        <circle cx="16" cy="14" r="1.5" fill="currentColor" />
    </svg>
);

const SoundIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
);

const InfoIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const SunIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

const MoonIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const getIconComponent = (id: SidebarItem) => {
    switch (id) {
        case "background": return <WallpaperIcon />;
        case "appearance": return <PaletteIcon />;
        case "desktop": return <DesktopIcon />;
        case "dock": return <DockIcon />;
        case "sound": return <SoundIcon />;
        case "about": return <InfoIcon />;
        default: return null;
    }
};

export function SettingsApp({ initialTab }: { initialTab?: string }) {
    const [activeTab, setActiveTab] = useState<SidebarItem>(
        (initialTab as SidebarItem) || "background"
    );

    // Update tab when initialTab changes (e.g. refocus from context menu)
    useEffect(() => {
        if (initialTab && sidebarItems.some(s => s.id === initialTab)) {
            setActiveTab(initialTab as SidebarItem);
        }
    }, [initialTab]);
    const [isMobile, setIsMobile] = useState(false);
    const {
        theme,
        setTheme,
        accentColor,
        setAccentColor,
        wallpaper,
        wallpapers,
        setWallpaper,
        showDesktopIcons,
        setShowDesktopIcons,
        iconSize,
        setIconSize,
        dockPosition,
        setDockPosition,
        dockAutoHide,
        setDockAutoHide,
        dockIconSize,
        setDockIconSize,
        soundEffects,
        setSoundEffects,
        notifications,
        setNotifications,
        resetSettings,
    } = useSettingsStore();

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <div className="flex h-full w-full overflow-hidden" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
            {/* Desktop Sidebar */}
            {!isMobile && (
                <div className="w-56 min-w-56 flex flex-col shrink-0" style={{ background: "var(--bg-primary)", borderRight: "1px solid var(--border-color)" }}>
                    <div className="p-4" style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <h1 className="text-lg font-semibold">Settings</h1>
                    </div>
                    <nav className="flex-1 p-2">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={clsx(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left"
                                )}
                                style={
                                    activeTab === item.id
                                        ? { background: "var(--accent-subtle)", color: "var(--accent-color)" }
                                        : { color: "var(--text-secondary)" }
                                }
                                onMouseEnter={(e) => { if (activeTab !== item.id) (e.currentTarget as HTMLElement).style.background = "var(--hover-bg)"; }}
                                onMouseLeave={(e) => { if (activeTab !== item.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                            >
                                {getIconComponent(item.id)}
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                {isMobile && (
                    <div className="p-4 shrink-0" style={{ borderBottom: "1px solid var(--border-color)", background: "var(--bg-primary)" }}>
                        <h1 className="text-lg font-semibold">Settings</h1>
                    </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 md:p-6 lg:p-8">
                        {activeTab === "background" && (
                            <>
                                <div className="mb-6 md:mb-8">
                                    <h2 className="text-xl md:text-2xl font-semibold mb-1">Background</h2>
                                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Change your desktop wallpaper</p>
                                </div>

                                <h3 className="text-xs md:text-sm font-semibold opacity-50 uppercase tracking-widest mb-4">Wallpapers</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                                    {wallpapers.map((wp) => (
                                        <button
                                            key={wp.id}
                                            onClick={() => { setWallpaper(wp.url); }}
                                            className={clsx(
                                                "group relative aspect-video rounded-xl overflow-hidden border-2 transition-all",
                                                wallpaper === wp.url ? "ring-2" : ""
                                            )}
                                            style={
                                                wallpaper === wp.url
                                                    ? { borderColor: "var(--accent-color)", boxShadow: "0 0 0 2px color-mix(in srgb, var(--accent-color) 30%, transparent)" }
                                                    : { borderColor: "transparent" }
                                            }
                                            onMouseEnter={(e) => { if (wallpaper !== wp.url) e.currentTarget.style.borderColor = "var(--border-color)"; }}
                                            onMouseLeave={(e) => { if (wallpaper !== wp.url) e.currentTarget.style.borderColor = "transparent"; }}
                                        >
                                            {wp.url ? (
                                                wp.url.startsWith("linear-gradient") || wp.url.startsWith("radial-gradient") ? (
                                                    <div
                                                        className="w-full h-full transition-transform group-hover:scale-105"
                                                        style={{ background: wp.url }}
                                                    />
                                                ) : (
                                                    <img src={wp.url} alt={wp.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                )
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[#4f194c] to-[#2c001e] flex items-center justify-center">
                                                    <span className="text-xs opacity-40">Default Ubuntu</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform">
                                                <p className="text-xs font-medium truncate">{wp.name}</p>
                                            </div>
                                            {wallpaper === wp.url && (
                                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-lg" style={{ background: "var(--accent-color)" }}>
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === "appearance" && (
                            <>
                                <div className="mb-6 md:mb-8">
                                    <h2 className="text-xl md:text-2xl font-semibold mb-1">Appearance</h2>
                                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Customize the look and feel</p>
                                </div>

                                <div className="space-y-6 md:space-y-8">
                                    {/* Theme Selection */}
                                    <section>
                                        <h3 className="text-xs md:text-sm font-semibold opacity-50 uppercase tracking-widest mb-4">Theme</h3>
                                        <div className="flex gap-4 md:gap-6">
                                            <button
                                                onClick={() => { setTheme("light"); }}
                                                className={clsx(
                                                    "flex flex-col gap-3 group items-center p-3 md:p-4 rounded-xl border-2 transition-all"
                                                )}
                                                style={
                                                    theme === "light"
                                                        ? { borderColor: "var(--accent-color)", background: "var(--accent-muted)" }
                                                        : { borderColor: "transparent" }
                                                }
                                            >
                                                <div className="w-20 md:w-24 aspect-video bg-white rounded-lg border border-gray-200 overflow-hidden p-2 shadow-sm">
                                                    <div className="w-full h-2 bg-gray-200 rounded-full mb-1" />
                                                    <div className="w-2/3 h-2 bg-gray-100 rounded-full" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <SunIcon />
                                                    <span className="text-sm font-medium">Light</span>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { setTheme("dark"); }}
                                                className={clsx(
                                                    "flex flex-col gap-3 group items-center p-3 md:p-4 rounded-xl border-2 transition-all"
                                                )}
                                                style={
                                                    theme === "dark"
                                                        ? { borderColor: "var(--accent-color)", background: "var(--accent-muted)" }
                                                        : { borderColor: "transparent" }
                                                }
                                            >
                                                <div className="w-20 md:w-24 aspect-video bg-[#2d2d2d] rounded-lg border border-white/10 overflow-hidden p-2 shadow-sm">
                                                    <div className="w-full h-2 bg-white/10 rounded-full mb-1" />
                                                    <div className="w-2/3 h-2 bg-white/5 rounded-full" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MoonIcon />
                                                    <span className="text-sm font-medium">Dark</span>
                                                </div>
                                            </button>
                                        </div>
                                    </section>

                                    {/* Accent Color */}
                                    <section>
                                        <h3 className="text-xs md:text-sm font-semibold opacity-50 uppercase tracking-widest mb-4">Accent Color</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {accentColors.map((color) => (
                                                <button
                                                    key={color.id}
                                                    onClick={() => { setAccentColor(color.value); }}
                                                    className={clsx(
                                                        "group relative w-12 h-12 rounded-full transition-all",
                                                        accentColor === color.value ? "ring-2 ring-offset-2 scale-110" : "hover:scale-105"
                                                    )}
                                                    style={
                                                        accentColor === color.value
                                                            ? { backgroundColor: color.value, boxShadow: `0 0 0 2px var(--bg-secondary), 0 0 0 4px ${color.value}` }
                                                            : { backgroundColor: color.value }
                                                    }
                                                    title={color.name}
                                                >
                                                    {accentColor === color.value && (
                                                        <svg className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </>
                        )}

                        {activeTab === "desktop" && (
                            <>
                                <div className="mb-6 md:mb-8">
                                    <h2 className="text-xl md:text-2xl font-semibold mb-1">Desktop</h2>
                                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Manage your desktop icons and behavior</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Show Desktop Icons */}
                                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--card-bg)" }}>
                                        <div>
                                            <p className="font-medium">Show Desktop Icons</p>
                                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Display app icons on the desktop</p>
                                        </div>
                                        <button
                                            onClick={() => { setShowDesktopIcons(!showDesktopIcons); }}
                                            className={clsx(
                                                "relative w-12 h-6 rounded-full transition-colors shrink-0"
                                            )}
                                            style={{ background: showDesktopIcons ? "var(--accent-color)" : "var(--card-bg)" }}
                                        >
                                            <div
                                                className={clsx(
                                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                                                    showDesktopIcons ? "left-7" : "left-1"
                                                )}
                                            />
                                        </button>
                                    </div>

                                    {/* Icon Size */}
                                    <div>
                                        <p className="font-medium mb-2">Icon Size</p>
                                        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Choose the size of desktop icons</p>
                                        <div className="flex gap-3 flex-wrap">
                                            {(Object.keys({ small: null, medium: null, large: null }) as IconSize[]).map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => { setIconSize(size); }}
                                                    className={clsx(
                                                        "px-4 py-2 rounded-lg border capitalize transition-all"
                                                    )}
                                                    style={
                                                        iconSize === size
                                                            ? { borderColor: "var(--accent-color)", background: "var(--accent-muted)", color: "var(--accent-color)" }
                                                            : { borderColor: "var(--border-color)" }
                                                    }
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "dock" && (
                            <>
                                <div className="mb-6 md:mb-8">
                                    <h2 className="text-xl md:text-2xl font-semibold mb-1">Dock</h2>
                                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Configure dock behavior and appearance</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Dock Position */}
                                    <div>
                                        <p className="font-medium mb-2">Position</p>
                                        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Choose where the dock appears</p>
                                        <div className="flex gap-3 flex-wrap">
                                            {(["bottom", "left", "right"] as DockPosition[]).map((position) => (
                                                <button
                                                    key={position}
                                                    onClick={() => { setDockPosition(position); }}
                                                    className={clsx(
                                                        "px-4 py-2 rounded-lg border capitalize transition-all"
                                                    )}
                                                    style={
                                                        dockPosition === position
                                                            ? { borderColor: "var(--accent-color)", background: "var(--accent-muted)", color: "var(--accent-color)" }
                                                            : { borderColor: "var(--border-color)" }
                                                    }
                                                >
                                                    {position}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dock Auto Hide */}
                                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--card-bg)" }}>
                                        <div>
                                            <p className="font-medium">Auto-hide Dock</p>
                                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Hide dock when not in use</p>
                                        </div>
                                        <button
                                            onClick={() => { setDockAutoHide(!dockAutoHide); }}
                                            className={clsx(
                                                "relative w-12 h-6 rounded-full transition-colors shrink-0"
                                            )}
                                            style={{ background: dockAutoHide ? "var(--accent-color)" : "var(--card-bg)" }}
                                        >
                                            <div
                                                className={clsx(
                                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                                                    dockAutoHide ? "left-7" : "left-1"
                                                )}
                                            />
                                        </button>
                                    </div>

                                    {/* Dock Icon Size */}
                                    <div>
                                        <p className="font-medium mb-2">Icon Size</p>
                                        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Adjust the size of dock icons</p>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="40"
                                                max="64"
                                                step="4"
                                                value={dockIconSize}
                                                onChange={(e) => { setDockIconSize(Number(e.target.value)); }}
                                                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                                                style={{ background: "var(--card-bg)", accentColor: "var(--accent-color)" }}
                                            />
                                            <span className="text-sm font-medium w-12 text-right shrink-0">{dockIconSize}px</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "sound" && (
                            <>
                                <div className="mb-6 md:mb-8">
                                    <h2 className="text-xl md:text-2xl font-semibold mb-1">Sound</h2>
                                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>System sounds and notifications</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Sound Effects */}
                                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--card-bg)" }}>
                                        <div>
                                            <p className="font-medium">Sound Effects</p>
                                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Play sounds for system events</p>
                                        </div>
                                        <button
                                            onClick={() => { setSoundEffects(!soundEffects); }}
                                            className={clsx(
                                                "relative w-12 h-6 rounded-full transition-colors shrink-0"
                                            )}
                                            style={{ background: soundEffects ? "var(--accent-color)" : "var(--card-bg)" }}
                                        >
                                            <div
                                                className={clsx(
                                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                                                    soundEffects ? "left-7" : "left-1"
                                                )}
                                            />
                                        </button>
                                    </div>

                                    {/* Notifications */}
                                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--card-bg)" }}>
                                        <div>
                                            <p className="font-medium">Notification Sounds</p>
                                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Play sound when receiving notifications</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifications(!notifications)}
                                            className={clsx(
                                                "relative w-12 h-6 rounded-full transition-colors shrink-0"
                                            )}
                                            style={{ background: notifications ? "var(--accent-color)" : "var(--card-bg)" }}
                                        >
                                            <div
                                                className={clsx(
                                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                                                    notifications ? "left-7" : "left-1"
                                                )}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "about" && (
                            <>
                                <div className="mb-6 md:mb-8">
                                    <h2 className="text-xl md:text-2xl font-semibold mb-1">About</h2>
                                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>System information</p>
                                </div>

                                <div className="flex flex-col items-center py-4 md:py-8">
                                    <div className="w-24 h-24 md:w-28 md:h-28 mb-4 md:mb-6 rounded-3xl flex items-center justify-center p-4 md:p-6 shadow-2xl" style={{ background: `linear-gradient(135deg, var(--accent-color), #772953)` }}>
                                        <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <circle cx="12" cy="12" r="10" />
                                            <circle cx="12" cy="12" r="3" />
                                            <line x1="12" y1="2" x2="12" y2="5" />
                                            <line x1="12" y1="19" x2="12" y2="22" />
                                            <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
                                            <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
                                            <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
                                            <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-1">Ubuntu UI Portfolio</h3>
                                    <p className="text-sm mb-6 md:mb-8" style={{ color: "var(--text-muted)" }}>Version 2026.02.22 (LTS Compatible)</p>

                                    <div className="w-full max-w-sm md:max-w-md space-y-2">
                                        {[
                                            { k: "Device Name", v: "antigravity-portfolio" },
                                            { k: "Memory", v: "16.0 GB" },
                                            { k: "Processor", v: "Claude 4.6 Opus @ 4.0GHz" },
                                            { k: "Graphics", v: "WebGL 2.0 Compatible" },
                                            { k: "OS Type", v: "64-bit Web Native" },
                                            { k: "Disk", v: "256 GB SSD" },
                                        ].map((row) => (
                                            <div key={row.k} className="flex items-center justify-between p-3 rounded-lg text-sm" style={{ background: "var(--card-bg)" }}>
                                                <span style={{ color: "var(--text-muted)" }}>{row.k}</span>
                                                <span className="font-medium">{row.v}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={resetSettings}
                                        className="mt-6 md:mt-8 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        Reset All Settings to Default
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Bottom Tab Bar */}
                {isMobile && (
                    <div className="shrink-0" style={{ background: "var(--bg-primary)", borderTop: "1px solid var(--border-color)" }}>
                        <div className="flex justify-around py-2">
                            {sidebarItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={clsx(
                                        "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
                                    )}
                                    style={{ color: activeTab === item.id ? "var(--accent-color)" : "var(--text-muted)" }}
                                >
                                    <div className="w-5 h-5">
                                        {getIconComponent(item.id)}
                                    </div>
                                    <span className="text-[10px]">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}