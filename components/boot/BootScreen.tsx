"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { profile } from "@/data/profile";
import { initAudioContext, playLoginSound } from "@/lib/sound";

interface BootScreenProps {
    onBootComplete: () => void;
}

const BOOT_DURATION = 3200;
const FADE_DURATION = 800;

const BOOT_BG: React.CSSProperties = {
    background: [
        "radial-gradient(ellipse at 50% 45%, rgba(119,33,111,0.4) 0%, transparent 60%)",
        "radial-gradient(ellipse at 55% 55%, rgba(77,17,80,0.25) 0%, transparent 50%)",
        "linear-gradient(180deg, #1a0a20 0%, #2c0b33 30%, #200e28 65%, #0d060f 100%)",
    ].join(", "),
};

export function BootScreen({ onBootComplete }: BootScreenProps) {
    const [phase, setPhase] = useState<"booting" | "ready" | "fading">("booting");

    // Pre-warm AudioContext during boot
    useEffect(() => {
        initAudioContext();
    }, []);

    // Boot animation → ready phase
    useEffect(() => {
        const bootTimer = setTimeout(() => setPhase("ready"), BOOT_DURATION);
        return () => clearTimeout(bootTimer);
    }, []);

    // Fading → complete
    useEffect(() => {
        if (phase === "fading") {
            const fadeTimer = setTimeout(() => {
                onBootComplete();
            }, FADE_DURATION);
            return () => clearTimeout(fadeTimer);
        }
    }, [phase, onBootComplete]);

    // Click handler: plays login sound (user gesture unlocks AudioContext) and starts fade
    const handleEnter = useCallback(() => {
        if (phase !== "ready") return;
        playLoginSound();
        setPhase("fading");
    }, [phase]);

    return (
        <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === "fading" ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_DURATION / 1000, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
            style={BOOT_BG}
        >
            <AnimatePresence mode="wait">
                {/* ---- Phase 1: Boot animation (logo + dots) ---- */}
                {phase === "booting" && (
                    <motion.div
                        key="boot-anim"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="flex flex-col items-center"
                    >
                        {/* Ubuntu Logo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
                            className="mb-10"
                        >
                            <UbuntuLogo />
                        </motion.div>

                        {/* Loading dots */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                            className="flex gap-[10px]"
                        >
                            {[0, 1, 2, 3, 4].map((i) => (
                                <BootDot key={i} index={i} />
                            ))}
                        </motion.div>
                    </motion.div>
                )}

                {/* ---- Phase 2: Ubuntu login screen ---- */}
                {phase === "ready" && (
                    <motion.div
                        key="login-screen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col items-center select-none"
                    >
                        {/* Date & time at top */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            style={{
                                position: "fixed",
                                top: 32,
                                left: 0,
                                right: 0,
                                textAlign: "center",
                                zIndex: 1,
                            }}
                        >
                            <TimeDisplay />
                        </motion.div>

                        {/* User avatar — clickable */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.15, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                            onClick={handleEnter}
                            style={{
                                width: 96,
                                height: 96,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #E95420 0%, #c44117 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 16,
                                boxShadow: "0 4px 24px rgba(0,0,0,0.3), 0 0 0 3px rgba(255,255,255,0.1)",
                                border: "none",
                                cursor: "pointer",
                                transition: "box-shadow 0.2s, transform 0.15s",
                            }}
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 32px rgba(233,84,32,0.4), 0 0 0 3px rgba(255,255,255,0.2)" }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="rgba(255,255,255,0.9)"
                            >
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </motion.button>

                        {/* User name */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.35 }}
                            style={{
                                color: "white",
                                fontSize: 20,
                                fontWeight: 500,
                                marginBottom: 8,
                                fontFamily: "'Ubuntu', -apple-system, sans-serif",
                                letterSpacing: "0.3px",
                            }}
                        >
                            {profile.name}
                        </motion.div>

                        {/* Title / role */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.35 }}
                            style={{
                                color: "rgba(255,255,255,0.45)",
                                fontSize: 13,
                                fontWeight: 400,
                                marginBottom: 28,
                                fontFamily: "'Ubuntu', -apple-system, sans-serif",
                                letterSpacing: "0.3px",
                            }}
                        >
                            {profile.title}
                        </motion.div>

                        {/* Hint text */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            style={{
                                color: "rgba(255,255,255,0.35)",
                                fontSize: 12,
                                fontFamily: "'Ubuntu', -apple-system, sans-serif",
                                letterSpacing: "0.3px",
                            }}
                        >
                            Click avatar to log in
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Personal branding — visible during boot phase */}
            {phase === "booting" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="absolute bottom-12 flex flex-col items-center gap-1 select-none"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                >
                    <span className="text-sm font-light tracking-[0.2em]">{profile.name}</span>
                    <span className="text-[11px] font-light tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {profile.title}
                    </span>
                </motion.div>
            )}
        </motion.div>
    );
}

// ---- Ubuntu "Circle of Friends" SVG ----
function UbuntuLogo() {
    return (
        <svg
            width="80"
            height="80"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: "drop-shadow(0 0 40px rgba(233,84,32,0.3))" }}
        >
            <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="4" strokeOpacity="0.9" />

            {/* Top friend */}
            <g transform="translate(100, 20)">
                <circle cx="0" cy="0" r="14" fill="white" fillOpacity="0.9" />
            </g>
            <path
                d="M 72 28 A 80 80 0 0 0 30 75"
                stroke="white" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.9" fill="none"
            />

            {/* Bottom-left friend */}
            <g transform="translate(30.7, 140)">
                <circle cx="0" cy="0" r="14" fill="white" fillOpacity="0.9" />
            </g>
            <path
                d="M 38 165 A 80 80 0 0 0 100 185"
                stroke="white" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.9" fill="none"
            />

            {/* Bottom-right friend */}
            <g transform="translate(169.3, 140)">
                <circle cx="0" cy="0" r="14" fill="white" fillOpacity="0.9" />
            </g>
            <path
                d="M 175 118 A 80 80 0 0 0 135 30"
                stroke="white" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.9" fill="none"
            />
        </svg>
    );
}

// ---- Animated boot dot ----
function BootDot({ index }: { index: number }) {
    return (
        <motion.span
            style={{
                display: "block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.18)",
            }}
            animate={{
                backgroundColor: [
                    "rgba(255,255,255,0.18)",
                    "rgba(255,255,255,0.85)",
                    "rgba(255,255,255,0.18)",
                ],
                scale: [1, 1.2, 1],
            }}
            transition={{
                duration: 1.2,
                ease: "easeInOut",
                repeat: Infinity,
                delay: index * 0.16,
            }}
        />
    );
}

// ---- Live time/date for login screen ----
function TimeDisplay() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false });
    const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    return (
        <div
            style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "'Ubuntu', -apple-system, sans-serif",
            }}
        >
            {date} · {time}
        </div>
    );
}
