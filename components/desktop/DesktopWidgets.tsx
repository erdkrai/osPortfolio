"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

// --- Clock Widget -----------------------------------------------------------
function ClockWidget() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = time.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });

    const formattedDate = time.toLocaleDateString("en-US", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        month: "long",
        day: "numeric"
    });

    const [client, setClient] = useState(false);
    useEffect(() => setClient(true), []);
    return (
        <div className="flex flex-col items-end text-white drop-shadow-lg">
            <div className="text-6xl font-bold tracking-tight mono-font">
                {client ? formattedTime : ""}
                <span className="text-xl opacity-50 ml-2 uppercase tracking-widest font-medium">IST</span>
            </div>
            <div className="text-lg opacity-80 font-medium mt-1">
                {client ? formattedDate : ""}
            </div>
        </div>
    );
}

// --- Calendar Widget --------------------------------------------------------
function CalendarWidget() {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date());

    const monthName = viewDate.toLocaleDateString("en-US", { month: "long" });
    const year = viewDate.getFullYear();

    const daysInMonth = new Date(year, viewDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(year, viewDate.getMonth(), 1).getDay();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
        <div className="p-5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-white w-64 shadow-xl">
            <div className="flex items-center justify-between mb-4 px-1">
                <span className="font-semibold text-sm tracking-wide uppercase opacity-90">{monthName} {year}</span>
                <div className="flex gap-2">
                    <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="hover:opacity-100 opacity-60 transition-opacity">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="hover:opacity-100 opacity-60 transition-opacity">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold opacity-40 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    const isToday = day === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
                    return (
                        <div
                            key={i}
                            className={clsx(
                                "h-7 flex items-center justify-center text-xs rounded-lg transition-all",
                                !day && "opacity-0",
                                isToday ? "bg-[#E95420] text-white font-bold shadow-lg shadow-orange-500/20" : "hover:bg-white/10"
                            )}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// --- Weather Widget ---------------------------------------------------------
function WeatherWidget() {
    const [weather, setWeather] = useState<any>(null);
    const [locationName, setLocationName] = useState("Bengaluru, India");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async (lat: number = 12.9716, lon: number = 77.5946, name: string = "Bengaluru, India") => {
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                const data = await res.json();
                setWeather(data.current_weather);
                setLocationName(name);
                setLoading(false);
            } catch (e) {
                console.error("Weather fetch failed", e);
                setLoading(false);
            }
        };

        const detectLocation = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                            // Reverse geocoding to get city name
                            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                            const geoData = await geoRes.json();
                            const city = geoData.address.city || geoData.address.town || geoData.address.village || "Detected Location";
                            fetchWeather(latitude, longitude, `${city}, ${geoData.address.country}`);
                        } catch {
                            fetchWeather(latitude, longitude, "Detected Location");
                        }
                    },
                    () => {
                        // Fallback to Bengaluru
                        fetchWeather();
                    }
                );
            } else {
                fetchWeather();
            }
        };

        detectLocation();
        const id = setInterval(detectLocation, 600000); // Update every 10 mins
        return () => clearInterval(id);
    }, []);

    const getWeatherIcon = (code: number) => {
        if (code <= 3) return "☀️"; // Clear/Cloudy
        if (code <= 48) return "🌫️"; // Fog
        if (code <= 67) return "🌧️"; // Rain
        if (code <= 77) return "❄️"; // Snow
        return "⚡"; // Storm
    };

    if (loading) return <div className="p-4 rounded-2xl bg-black/20 backdrop-blur-md border border-white/5 animate-pulse w-48 h-24" />;

    return (
        <div className="p-4 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center gap-4 shadow-xl">
            <div className="text-4xl filter drop-shadow-md">
                {getWeatherIcon(weather?.weathercode || 0)}
            </div>
            <div>
                <div className="text-2xl font-bold">{Math.round(weather?.temperature || 0)}°C</div>
                <div className="text-[10px] uppercase tracking-widest opacity-60 font-medium">{locationName}</div>
            </div>
        </div>
    );
}

// --- System Monitor Widget ---------------------------------------------------

function drift(prev: number, min: number, max: number, speed = 0.08, jitter = 1.5): number {
    const target = min + Math.random() * (max - min);
    const next = prev + (target - prev) * speed + (Math.random() - 0.5) * jitter;
    return Math.max(min, Math.min(max, next));
}

const SPARK_LEN = 30;

function drawSparkline(
    canvas: HTMLCanvasElement,
    data: number[],
    color: string,
    fill: string,
    max = 100,
) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (data.length < 2) return;
    const step = w / (data.length - 1);

    // Fill area
    ctx.beginPath();
    ctx.moveTo(0, h);
    data.forEach((v, i) => ctx.lineTo(i * step, h - (v / max) * h));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    // Stroke
    ctx.beginPath();
    data.forEach((v, i) => {
        const x = i * step;
        const y = h - (v / max) * h;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

function SystemMonitorWidget() {
    const cores = typeof navigator !== "undefined" && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4;
    // @ts-expect-error — deviceMemory is Chromium-only
    const totalMemGB = typeof navigator !== "undefined" && navigator.deviceMemory ? navigator.deviceMemory : 8;

    const cpuRef = useRef(30);
    const memRef = useRef(42);
    const netRef = useRef(80);

    const [cpuHistory, setCpuHistory] = useState<number[]>(() => Array(SPARK_LEN).fill(30));
    const [memHistory, setMemHistory] = useState<number[]>(() => Array(SPARK_LEN).fill(42));
    const [netHistory, setNetHistory] = useState<number[]>(() => Array(SPARK_LEN).fill(80));

    const [cpu, setCpu] = useState(30);
    const [mem, setMem] = useState(42);
    const [net, setNet] = useState(80);

    const cpuCanvas = useRef<HTMLCanvasElement>(null);
    const memCanvas = useRef<HTMLCanvasElement>(null);
    const netCanvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const id = setInterval(() => {
            cpuRef.current = drift(cpuRef.current, 6, 78, 0.12, 2.5);
            memRef.current = drift(memRef.current, 28, 68, 0.04, 0.5);
            netRef.current = drift(netRef.current, 10, 600, 0.15, 25);

            setCpu(cpuRef.current);
            setMem(memRef.current);
            setNet(netRef.current);

            setCpuHistory((p) => [...p.slice(1), cpuRef.current]);
            setMemHistory((p) => [...p.slice(1), memRef.current]);
            setNetHistory((p) => [...p.slice(1), netRef.current]);
        }, 1000);
        return () => clearInterval(id);
    }, []);

    // Draw sparklines
    useEffect(() => {
        if (cpuCanvas.current) drawSparkline(cpuCanvas.current, cpuHistory, "#3584e4", "rgba(53,132,228,0.18)");
        if (memCanvas.current) drawSparkline(memCanvas.current, memHistory, "#33d17a", "rgba(51,209,122,0.15)");
        if (netCanvas.current) drawSparkline(netCanvas.current, netHistory, "#e5a50a", "rgba(229,165,10,0.15)", 700);
    }, [cpuHistory, memHistory, netHistory]);

    const usedGB = ((mem / 100) * totalMemGB).toFixed(1);
    const netLabel = net >= 1024 ? `${(net / 1024).toFixed(1)} MB/s` : `${net.toFixed(0)} KB/s`;

    const rows: { label: string; value: string; color: string; canvas: React.RefObject<HTMLCanvasElement | null>; sub: string }[] = [
        { label: "CPU", value: `${cpu.toFixed(1)}%`, color: "#3584e4", canvas: cpuCanvas, sub: `${cores} cores` },
        { label: "Memory", value: `${usedGB} GB`, color: "#33d17a", canvas: memCanvas, sub: `${mem.toFixed(0)}% of ${totalMemGB} GB` },
        { label: "Network", value: netLabel, color: "#e5a50a", canvas: netCanvas, sub: "↓ receiving" },
    ];

    return (
        <div className="p-4 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-white w-64 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
                <svg viewBox="0 0 20 20" className="w-4 h-4 opacity-60" fill="none">
                    <rect x="1" y="3" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <polyline points="4,12 7,9 10,11 13,6 16,8" stroke="#33d17a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <span className="text-[11px] font-semibold uppercase tracking-widest opacity-60">System Monitor</span>
            </div>
            <div className="flex flex-col gap-3">
                {rows.map((r) => (
                    <div key={r.label}>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-sm" style={{ background: r.color }} />
                                <span className="text-[11px] font-medium opacity-80">{r.label}</span>
                            </div>
                            <span className="text-[13px] font-bold tabular-nums" style={{ color: r.color }}>{r.value}</span>
                        </div>
                        <div className="w-full h-8 rounded-md overflow-hidden bg-white/5 border border-white/5">
                            <canvas ref={r.canvas} className="w-full h-full" />
                        </div>
                        <div className="text-[9px] opacity-35 mt-0.5">{r.sub}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Main Container ---------------------------------------------------------
export function DesktopWidgets() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-20 right-8 flex flex-col items-end gap-10 pointer-events-auto z-0 select-none"
        >
            <ClockWidget />
            <div className="flex flex-col gap-6">
                <WeatherWidget />
                <CalendarWidget />
                <SystemMonitorWidget />
            </div>
        </motion.div>
    );
}
