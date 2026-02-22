"use client";

import { useWindowStore } from "@/store/windows";
import { AppConfig } from "./Desktop";
import { Clock } from "./Clock";
import { clsx } from "clsx";

interface TaskbarProps {
    apps: AppConfig[];
}

export function Taskbar({ apps }: TaskbarProps) {
    const { windows, focusWindow, restoreWindow, openWindow } = useWindowStore();
    const { activeWindowId } = useWindowStore();

    const handleTaskbarClick = (windowId: string, minimized: boolean) => {
        if (minimized) {
            restoreWindow(windowId);
        } else {
            focusWindow(windowId);
        }
    };

    return (
        <>
            {/* Desktop Taskbar */}
            <nav
                className="hidden md:flex fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] items-center gap-2 px-4 py-2 rounded-2xl
          bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/50"
                aria-label="Taskbar"
            >
                {/* Start button */}
                <div className="flex items-center gap-1 pr-3 border-r border-white/20 mr-1">
                    <div className="w-6 h-6 grid grid-cols-2 grid-rows-2 gap-0.5">
                        <div className="bg-blue-400 rounded-sm" />
                        <div className="bg-green-400 rounded-sm" />
                        <div className="bg-yellow-400 rounded-sm" />
                        <div className="bg-red-400 rounded-sm" />
                    </div>
                </div>

                {/* Open windows */}
                <div className="flex items-center gap-1">
                    {windows.length === 0 ? (
                        <span className="text-white/40 text-xs px-2">No open windows</span>
                    ) : (
                        windows.map((win) => {
                            const appCfg = apps.find((a) => a.appId === win.appId);
                            const isActive = win.windowId === activeWindowId && !win.minimized;
                            return (
                                <button
                                    key={win.windowId}
                                    onClick={() => handleTaskbarClick(win.windowId, win.minimized)}
                                    aria-label={`${win.minimized ? "Restore" : "Focus"} ${win.title}`}
                                    className={clsx(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150",
                                        "hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                                        isActive
                                            ? "bg-white/20 text-white"
                                            : "text-white/60 hover:text-white"
                                    )}
                                >
                                    <span>{appCfg?.title || win.title}</span>
                                    {isActive && (
                                        <span className="w-1 h-1 rounded-full bg-white inline-block" />
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Divider */}
                {windows.length > 0 && <div className="w-px h-4 bg-white/20 mx-1" />}

                {/* Clock */}
                <Clock />
            </nav>

            {/* Mobile bottom nav */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-around px-4 py-2
          bg-black/60 backdrop-blur-xl border-t border-white/10"
                aria-label="Mobile navigation"
            >
                {apps.map((app) => {
                    const isOpen = windows.some((w) => w.appId === app.appId && !w.minimized);
                    return (
                        <button
                            key={app.appId}
                            onClick={() =>
                                openWindow({ appId: app.appId, title: app.title, defaultSize: app.defaultSize })
                            }
                            aria-label={`Open ${app.title}`}
                            className={clsx(
                                "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-150",
                                isOpen ? "bg-white/20" : "hover:bg-white/10"
                            )}
                        >
                            <span className="text-lg">{app.appId === "about" ? "👤" : app.appId === "projects" ? "💼" : app.appId === "resume" ? "📄" : "✉️"}</span>
                            <span className="text-white/70 text-[10px] font-medium">{app.title}</span>
                        </button>
                    );
                })}
            </nav>
        </>
    );
}
