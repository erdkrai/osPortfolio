"use client";

import { useEffect } from "react";
import { useWindowStore, AppId } from "@/store/windows";
import { useSettingsStore } from "@/store/settings";
import { DesktopIcon } from "./DesktopIcon";
import { TopBar } from "./TopBar";
import { Dock } from "./Dock";
import { Window } from "@/components/window/Window";
import { SnapPreview } from "@/components/window/SnapPreview";
import { DesktopWidgets } from "./DesktopWidgets";
import { NotificationCenter } from "./NotificationCenter";
import { DesktopContextMenu } from "./DesktopContextMenu";
import { AnimatePresence } from "framer-motion";

export type AppConfig = {
    appId: AppId;
    title: string;
    icon: string;
    defaultSize: { w: number; h: number };
};

export const APPS: AppConfig[] = [
    { appId: "about", title: "About Me", icon: "about", defaultSize: { w: 560, h: 500 } },
    { appId: "projects", title: "Projects", icon: "projects", defaultSize: { w: 900, h: 620 } },
    { appId: "resume", title: "Resume", icon: "resume", defaultSize: { w: 800, h: 640 } },
    { appId: "contact", title: "Contact", icon: "contact", defaultSize: { w: 540, h: 580 } },
    { appId: "terminal", title: "Terminal", icon: "terminal", defaultSize: { w: 720, h: 480 } },
    { appId: "settings", title: "Settings", icon: "settings", defaultSize: { w: 900, h: 600 } },
    { appId: "photos", title: "Photos", icon: "photos", defaultSize: { w: 900, h: 640 } },
    { appId: "snake", title: "Snake", icon: "snake", defaultSize: { w: 480, h: 560 } },
    { appId: "tetris", title: "Tetris", icon: "tetris", defaultSize: { w: 420, h: 620 } },
    { appId: "minesweeper", title: "Mines", icon: "minesweeper", defaultSize: { w: 480, h: 560 } },
    { appId: "music", title: "Music", icon: "music", defaultSize: { w: 580, h: 640 } },
];

export function Desktop() {
    const { windows, closeActiveWindow, dragSnapPreview } = useWindowStore();
    const { wallpaper, showDesktopIcons, desktopSort } = useSettingsStore();

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeActiveWindow();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [closeActiveWindow]);

    const sortedWindows = [...windows].sort((a, b) => a.z - b.z);

    const wallpaperStyle = wallpaper
        ? wallpaper.startsWith("linear-gradient") || wallpaper.startsWith("radial-gradient")
            ? { background: wallpaper }
            : { backgroundImage: `url(${wallpaper})`, backgroundSize: "cover", backgroundPosition: "center" }
        : {};

    return (
        <div className="relative w-screen h-screen overflow-hidden select-none">
            {/* Ubuntu-style animated wallpaper */}
            <div
                className="absolute inset-0 wallpaper"
                aria-hidden="true"
                style={wallpaperStyle}
            />

            {/* Top panel */}
            <TopBar />

            {/* Desktop Widgets */}
            <DesktopWidgets />

            {/* Desktop icons — top-left, wraps into columns */}
            {showDesktopIcons && (
                <div
                    data-desktop-area
                    className="absolute top-10 bottom-14 left-4 flex flex-col flex-wrap content-start gap-0.5 z-10 overflow-hidden"
                    role="list"
                    aria-label="Desktop icons"
                >
                    {[...APPS]
                        .sort((a, b) => {
                            switch (desktopSort) {
                                case "name":
                                    return a.title.localeCompare(b.title);
                                case "type":
                                    return a.icon.localeCompare(b.icon);
                                case "size":
                                    return (b.defaultSize.w * b.defaultSize.h) - (a.defaultSize.w * a.defaultSize.h);
                                case "modified":
                                default:
                                    return 0; // original order
                            }
                        })
                        .map((app) => (
                            <DesktopIcon key={app.appId} app={app} />
                        ))}
                </div>
            )}

            {/* Open windows */}
            <AnimatePresence>
                {sortedWindows.map((win) => (
                    <Window key={win.windowId} window={win} />
                ))}
            </AnimatePresence>

            {/* Snap preview overlay (shown during drag near edges) */}
            <SnapPreview zone={dragSnapPreview} />

            {/* Notification Center */}
            <NotificationCenter />

            {/* Bottom dock */}
            <Dock apps={APPS} />

            {/* Desktop right-click context menu */}
            <DesktopContextMenu />
        </div>
    );
}
