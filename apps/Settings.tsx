"use client";

import React, { useState } from "react";
import { useSettingsStore, Theme } from "@/store/settings";
import { clsx } from "clsx";

type SidebarItem = "appearance" | "about" | "background";

export function Settings() {
    const [activeTab, setActiveTab] = useState<SidebarItem>("background");
    const { theme, setTheme, wallpaper, wallpapers, setWallpaper } = useSettingsStore();

    const tabs: { id: SidebarItem; label: string; icon: string }[] = [
        { id: "background", label: "Background", icon: "🖼️" },
        { id: "appearance", label: "Appearance", icon: "🎨" },
        { id: "about", label: "About", icon: "ℹ️" },
    ];

    return (
        <div className="flex h-full w-full bg-[#1e1e1e] text-white overflow-hidden rounded-b-lg">
            {/* Sidebar */}
            <div className="w-52 bg-[#2d2d2d] border-r border-white/5 flex flex-col p-2 gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                            activeTab === tab.id ? "bg-white/10 font-medium" : "hover:bg-white/5 text-white/70 hover:text-white"
                        )}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {activeTab === "background" && (
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold mb-6">Background</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {wallpapers.map((wp) => (
                                <button
                                    key={wp.id}
                                    onClick={() => setWallpaper(wp.url)}
                                    className={clsx(
                                        "group relative aspect-video rounded-xl overflow-hidden border-2 transition-all",
                                        wallpaper === wp.url ? "border-[#E95420]" : "border-transparent hover:border-white/20"
                                    )}
                                >
                                    {wp.url ? (
                                        <img src={wp.thumbnail} alt={wp.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#4f194c] to-[#2c001e] flex items-center justify-center">
                                            <span className="text-xs opacity-40">Default Ubuntu</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform">
                                        <p className="text-xs font-medium truncate">{wp.name}</p>
                                    </div>
                                    {wallpaper === wp.url && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-[#E95420] rounded-full flex items-center justify-center shadow-lg">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "appearance" && (
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold mb-6">Appearance</h2>
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-sm font-semibold opacity-50 uppercase tracking-widest mb-4">Style</h3>
                                <div className="flex gap-6">
                                    <button
                                        onClick={() => setTheme("light")}
                                        className={clsx(
                                            "flex flex-col gap-3 group items-center",
                                            theme === "light" ? "opacity-100" : "opacity-50 hover:opacity-80"
                                        )}
                                    >
                                        <div className="w-32 aspect-video bg-white rounded-lg border-2 border-transparent group-hover:border-orange-500/50 transition-all overflow-hidden p-2">
                                            <div className="w-full h-2 bg-gray-200 rounded-full mb-1" />
                                            <div className="w-2/3 h-2 bg-gray-100 rounded-full" />
                                        </div>
                                        <span className="text-sm font-medium">Light</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme("dark")}
                                        className={clsx(
                                            "flex flex-col gap-3 group items-center",
                                            theme === "dark" ? "opacity-100" : "opacity-50 hover:opacity-80"
                                        )}
                                    >
                                        <div className="w-32 aspect-video bg-[#2d2d2d] rounded-lg border-2 border-transparent group-hover:border-orange-500/50 transition-all overflow-hidden p-2">
                                            <div className="w-full h-2 bg-white/10 rounded-full mb-1" />
                                            <div className="w-2/3 h-2 bg-white/5 rounded-full" />
                                        </div>
                                        <span className="text-sm font-medium">Dark</span>
                                    </button>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-semibold opacity-50 uppercase tracking-widest mb-4">Desktop Icons</h3>
                                <div className="p-4 bg-white/5 rounded-xl flex items-center justify-between">
                                    <span className="text-sm">Show Desktop Icons</span>
                                    <div className="w-10 h-5 bg-orange-500 rounded-full relative">
                                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {activeTab === "about" && (
                    <div className="max-w-3xl flex flex-col items-center py-10">
                        <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-[#E95420] to-[#772953] flex items-center justify-center p-5 shadow-2xl">
                            <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="3" />
                                <line x1="12" y1="2" x2="12" y2="5" />
                                <line x1="12" y1="19" x2="12" y2="22" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold mb-1">Ubuntu UI Portfolio</h2>
                        <p className="text-white/40 text-sm mb-10">Version 2026.02.22 (LTS Compatible)</p>

                        <div className="w-full grid grid-cols-1 gap-2">
                            {[
                                { k: "Device Name", v: "antigravity-portfolio" },
                                { k: "Memory", v: "16.0 GB" },
                                { k: "Processor", v: "Claude 3.5 Sonnet @ 4.0GHz" },
                                { k: "OS Type", v: "64-bit Web Native" },
                            ].map(row => (
                                <div key={row.k} className="flex items-center justify-between p-3 bg-white/5 rounded-lg text-sm">
                                    <span className="opacity-50">{row.k}</span>
                                    <span className="font-medium">{row.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
