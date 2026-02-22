"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useSettingsStore } from "@/store/settings";

interface LockScreenProps {
    onUnlock: () => void;
}

const FALLBACK_BG: React.CSSProperties = {
    background: [
        "radial-gradient(ellipse at 50% 40%, rgba(119,33,111,0.5) 0%, transparent 55%)",
        "radial-gradient(ellipse at 55% 55%, rgba(77,17,80,0.3) 0%, transparent 50%)",
        "linear-gradient(180deg, #1a0a20 0%, #2c0b33 30%, #200e28 65%, #0d060f 100%)",
    ].join(", "),
};

const FADE_DURATION = 600;

function getWallpaperStyle(wallpaper: string): React.CSSProperties {
    if (!wallpaper) return FALLBACK_BG;
    if (wallpaper.startsWith("linear-gradient") || wallpaper.startsWith("radial-gradient")) {
        return { background: wallpaper };
    }
    return {
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
    };
}

export function LockScreen({ onUnlock }: LockScreenProps) {
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");
    const [phase, setPhase] = useState<"active" | "fading">("active");
    const { wallpaper } = useSettingsStore();

    const bgStyle = getWallpaperStyle(wallpaper);

    // Drag-up to unlock
    const dragY = useMotionValue(0);
    const screenOpacity = useTransform(dragY, [-300, 0], [0, 1]);
    const screenY = useTransform(dragY, [-300, 0], [-300, 0]);

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(
                now.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: false,
                })
            );
            setDate(
                now.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                })
            );
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);

    const handleDragEnd = useCallback(
        (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
            if (info.offset.y < -120 || info.velocity.y < -300) {
                animate(dragY, -600, { duration: 0.3, ease: [0.4, 0, 0.2, 1] });
                setPhase("fading");
            } else {
                animate(dragY, 0, { type: "spring", stiffness: 400, damping: 30 });
            }
        },
        [dragY]
    );

    // When fade completes, actually unlock
    useEffect(() => {
        if (phase === "fading") {
            const timer = setTimeout(() => onUnlock(), FADE_DURATION);
            return () => clearTimeout(timer);
        }
    }, [phase, onUnlock]);

    const handleClick = useCallback(() => {
        if (phase === "active") {
            setPhase("fading");
        }
    }, [phase]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "fading" ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: phase === "fading" ? FADE_DURATION / 1000 : 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] cursor-pointer"
            style={bgStyle}
            onClick={handleClick}
        >
            {/* Dark overlay for readability */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                }}
            />
            <motion.div
                style={{ y: screenY, opacity: screenOpacity, position: "relative", zIndex: 1 }}
                drag="y"
                dragConstraints={{ top: -600, bottom: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                className="w-full h-full flex flex-col items-center justify-center select-none"
            >
                {/* Large time */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    style={{
                        color: "white",
                        fontSize: 96,
                        fontWeight: 300,
                        letterSpacing: "-2px",
                        lineHeight: 1,
                        fontFamily: "'Ubuntu', -apple-system, sans-serif",
                        textShadow: "0 2px 40px rgba(0,0,0,0.3)",
                    }}
                >
                    {time}
                </motion.div>

                {/* Date */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 20,
                        fontWeight: 400,
                        marginTop: 8,
                        fontFamily: "'Ubuntu', -apple-system, sans-serif",
                        letterSpacing: "0.5px",
                    }}
                >
                    {date}
                </motion.div>

                {/* Swipe up hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="absolute bottom-16 flex flex-col items-center gap-3"
                >
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="rgba(255,255,255,0.5)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 15l-6-6-6 6" />
                        </svg>
                    </motion.div>
                    <span
                        style={{
                            color: "rgba(255,255,255,0.4)",
                            fontSize: 13,
                            fontWeight: 400,
                            letterSpacing: "0.5px",
                            fontFamily: "'Ubuntu', -apple-system, sans-serif",
                        }}
                    >
                        Click or swipe up to unlock
                    </span>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
