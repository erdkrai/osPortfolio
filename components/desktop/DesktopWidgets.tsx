"use client";

import React, { useState, useEffect } from "react";
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

    return (
        <div className="flex flex-col items-end text-white drop-shadow-lg">
            <div className="text-6xl font-bold tracking-tight mono-font">
                {formattedTime}
                <span className="text-xl opacity-50 ml-2 uppercase tracking-widest font-medium">IST</span>
            </div>
            <div className="text-lg opacity-80 font-medium mt-1">
                {formattedDate}
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
            </div>
        </motion.div>
    );
}
