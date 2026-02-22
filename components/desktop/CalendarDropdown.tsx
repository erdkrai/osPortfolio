"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarDropdownProps {
    open: boolean;
    onClose: () => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarDropdown({ open, onClose }: CalendarDropdownProps) {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date());

    // Reset to current month when reopened
    useEffect(() => {
        if (open) setViewDate(new Date());
    }, [open]);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const monthName = viewDate.toLocaleDateString("en-US", { month: "long" });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    // Previous month's trailing days
    const prevMonthDays = new Date(year, month, 0).getDate();
    const trailingDays: { day: number; muted: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
        trailingDays.push({ day: prevMonthDays - i, muted: true });
    }

    // Current month days
    const currentDays: { day: number; muted: boolean }[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
        currentDays.push({ day: i, muted: false });
    }

    // Next month's leading days
    const totalSlots = trailingDays.length + currentDays.length;
    const rows = Math.ceil(totalSlots / 7);
    const remaining = rows * 7 - totalSlots;
    const leadingDays: { day: number; muted: boolean }[] = [];
    for (let i = 1; i <= remaining; i++) {
        leadingDays.push({ day: i, muted: true });
    }

    const allDays = [...trailingDays, ...currentDays, ...leadingDays];

    const navigateMonth = (delta: number) => {
        setViewDate(new Date(year, month + delta, 1));
    };

    const isToday = (day: number, muted: boolean) => {
        return (
            !muted &&
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    const isCurrentMonth =
        month === today.getMonth() && year === today.getFullYear();

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                        exit={{ opacity: 0, y: -8, scale: 0.96, x: "-50%" }}
                        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute top-full mt-2 z-[9999] rounded-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{
                            left: "50%",
                            background: "rgba(42, 42, 42, 0.92)",
                            backdropFilter: "blur(40px)",
                            WebkitBackdropFilter: "blur(40px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow:
                                "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
                            width: 280,
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "14px 16px 10px",
                            }}
                        >
                            <button
                                onClick={() => navigateMonth(-1)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "rgba(255,255,255,0.5)",
                                    cursor: "pointer",
                                    padding: 6,
                                    borderRadius: 6,
                                    display: "flex",
                                    alignItems: "center",
                                    transition: "background 0.15s",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        "rgba(255,255,255,0.08)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = "none")
                                }
                                aria-label="Previous month"
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <button
                                onClick={() => {
                                    if (!isCurrentMonth) setViewDate(new Date());
                                }}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "rgba(255,255,255,0.9)",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: isCurrentMonth ? "default" : "pointer",
                                    fontFamily: "'Ubuntu', -apple-system, sans-serif",
                                    letterSpacing: "0.3px",
                                    padding: "2px 8px",
                                    borderRadius: 6,
                                    transition: "background 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isCurrentMonth)
                                        e.currentTarget.style.background =
                                            "rgba(255,255,255,0.08)";
                                }}
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = "none")
                                }
                                aria-label="Go to current month"
                            >
                                {monthName} {year}
                            </button>

                            <button
                                onClick={() => navigateMonth(1)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "rgba(255,255,255,0.5)",
                                    cursor: "pointer",
                                    padding: 6,
                                    borderRadius: 6,
                                    display: "flex",
                                    alignItems: "center",
                                    transition: "background 0.15s",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        "rgba(255,255,255,0.08)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = "none")
                                }
                                aria-label="Next month"
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Day labels */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(7, 1fr)",
                                padding: "0 12px",
                                marginBottom: 4,
                            }}
                        >
                            {DAY_LABELS.map((label) => (
                                <div
                                    key={label}
                                    style={{
                                        textAlign: "center",
                                        fontSize: 10,
                                        fontWeight: 600,
                                        color: "rgba(255,255,255,0.35)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        padding: "4px 0",
                                    }}
                                >
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* Day grid */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(7, 1fr)",
                                gap: 1,
                                padding: "0 12px 14px",
                            }}
                        >
                            {allDays.map((d, i) => {
                                const today_ = isToday(d.day, d.muted);
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: 32,
                                            borderRadius: 8,
                                            fontSize: 12,
                                            fontWeight: today_ ? 700 : 400,
                                            color: d.muted
                                                ? "rgba(255,255,255,0.2)"
                                                : today_
                                                  ? "#fff"
                                                  : "rgba(255,255,255,0.75)",
                                            background: today_
                                                ? "#E95420"
                                                : "transparent",
                                            boxShadow: today_
                                                ? "0 2px 8px rgba(233,84,32,0.35)"
                                                : "none",
                                            cursor: d.muted ? "default" : "pointer",
                                            transition: "background 0.15s",
                                            fontFamily:
                                                "'Ubuntu', -apple-system, sans-serif",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!d.muted && !today_)
                                                e.currentTarget.style.background =
                                                    "rgba(255,255,255,0.08)";
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!d.muted && !today_)
                                                e.currentTarget.style.background =
                                                    "transparent";
                                        }}
                                    >
                                        {d.day}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
