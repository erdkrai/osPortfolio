import { create } from "zustand";

export type Theme = "light" | "dark";
export type DockPosition = "bottom" | "left" | "right";
export type IconSize = "small" | "medium" | "large";
export type DesktopSort = "name" | "modified" | "size" | "type";

export interface Wallpaper {
    id: string;
    name: string;
    url: string;
    thumbnail: string;
    category: "default" | "gradient" | "nature" | "abstract";
    /** Tinted panel background for dark theme, sampled from the wallpaper's dominant top-edge color */
    topbarColor?: string;
}

export interface AccentColor {
    id: string;
    name: string;
    value: string;
}

interface SettingsState {
    // Appearance
    theme: Theme;
    accentColor: string;

    // Background
    wallpaper: string;
    wallpapers: Wallpaper[];

    // Desktop
    showDesktopIcons: boolean;
    iconSize: IconSize;
    desktopSort: DesktopSort;

    // Dock
    dockPosition: DockPosition;
    dockAutoHide: boolean;
    dockIconSize: number;

    // Window
    windowAnimations: boolean;
    snapEnabled: boolean;

    // System
    soundEffects: boolean;
    notifications: boolean;
    locked: boolean;

    // Actions
    lockScreen: () => void;
    unlockScreen: () => void;
    setTheme: (theme: Theme) => void;
    setAccentColor: (color: string) => void;
    setWallpaper: (url: string) => void;
    setShowDesktopIcons: (show: boolean) => void;
    setIconSize: (size: IconSize) => void;
    setDesktopSort: (sort: DesktopSort) => void;
    setDockPosition: (position: DockPosition) => void;
    setDockAutoHide: (hide: boolean) => void;
    setDockIconSize: (size: number) => void;
    setWindowAnimations: (enabled: boolean) => void;
    setSnapEnabled: (enabled: boolean) => void;
    setSoundEffects: (enabled: boolean) => void;
    setNotifications: (enabled: boolean) => void;
    resetSettings: () => void;
}

const defaultWallpapers: Wallpaper[] = [
    {
        id: "ubuntu-default",
        name: "Default Ubuntu",
        url: "",
        thumbnail: "",
        category: "default",
        topbarColor: "rgba(36, 12, 57, 0.92)",
    },
    {
        id: "sunset-gradient",
        name: "Sunset Gradient",
        url: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        thumbnail: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        category: "gradient",
        topbarColor: "rgba(76, 54, 138, 0.88)",
    },
    {
        id: "ocean-wave",
        name: "Ocean Wave",
        url: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&q=80&w=2070",
        thumbnail: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&q=80&w=200",
        category: "nature",
        topbarColor: "rgba(14, 38, 68, 0.88)",
    },
    {
        id: "mountain-mist",
        name: "Mountain Mist",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070",
        thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=200",
        category: "nature",
        topbarColor: "rgba(32, 38, 48, 0.88)",
    },
    {
        id: "deep-purple",
        name: "Deep Purple",
        url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2070",
        thumbnail: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=200",
        category: "abstract",
        topbarColor: "rgba(48, 18, 72, 0.88)",
    },
    {
        id: "northern-lights",
        name: "Northern Lights",
        url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=2070",
        thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=200",
        category: "nature",
        topbarColor: "rgba(8, 22, 36, 0.88)",
    },
    {
        id: "cosmic-dust",
        name: "Cosmic Dust",
        url: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&q=80&w=2070",
        thumbnail: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&q=80&w=200",
        category: "abstract",
        topbarColor: "rgba(16, 10, 32, 0.88)",
    },
    {
        id: "aurora",
        name: "Aurora Borealis",
        url: "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&q=80&w=2070",
        thumbnail: "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&q=80&w=200",
        category: "nature",
        topbarColor: "rgba(10, 26, 20, 0.88)",
    },
];

const accentColors: AccentColor[] = [
    { id: "orange", name: "Ubuntu Orange", value: "#E95420" },
    { id: "blue", name: "Yaru Blue", value: "#2C7DE8" },
    { id: "purple", name: "Yaru Purple", value: "#8E44AD" },
    { id: "green", name: "Yaru Green", value: "#27AE60" },
    { id: "pink", name: "Yaru Pink", value: "#E91E63" },
    { id: "teal", name: "Yaru Teal", value: "#00ACC1" },
];

export const useSettingsStore = create<SettingsState>((set) => ({
    // Appearance
    theme: "dark",
    accentColor: "#E95420",

    // Background
    wallpaper: "",
    wallpapers: defaultWallpapers,

    // Desktop
    showDesktopIcons: true,
    iconSize: "large",
    desktopSort: "name",

    // Dock
    dockPosition: "bottom",
    dockAutoHide: false,
    dockIconSize: 48,

    // Window
    windowAnimations: true,
    snapEnabled: true,

    // System
    soundEffects: true,
    notifications: true,
    locked: false,

    // Actions
    lockScreen: () => set({ locked: true }),
    unlockScreen: () => set({ locked: false }),
    setTheme: (theme) => set({ theme }),
    setAccentColor: (color) => set({ accentColor: color }),
    setWallpaper: (url) => set({ wallpaper: url }),
    setShowDesktopIcons: (show) => set({ showDesktopIcons: show }),
    setIconSize: (size) => set({ iconSize: size }),
    setDesktopSort: (sort) => set({ desktopSort: sort }),
    setDockPosition: (position) => set({ dockPosition: position }),
    setDockAutoHide: (hide) => set({ dockAutoHide: hide }),
    setDockIconSize: (size) => set({ dockIconSize: size }),
    setWindowAnimations: (enabled) => set({ windowAnimations: enabled }),
    setSnapEnabled: (enabled) => set({ snapEnabled: enabled }),
    setSoundEffects: (enabled) => set({ soundEffects: enabled }),
    setNotifications: (enabled) => set({ notifications: enabled }),

    resetSettings: () => set({
        theme: "dark",
        accentColor: "#E95420",
        wallpaper: "",
        showDesktopIcons: true,
        iconSize: "large",
        desktopSort: "name",
        dockPosition: "bottom",
        dockAutoHide: false,
        dockIconSize: 48,
        windowAnimations: true,
        snapEnabled: true,
        soundEffects: true,
        notifications: true,
    }),
}));

// Export accent colors for use in components
export { accentColors };
