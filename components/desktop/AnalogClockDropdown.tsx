"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnalogClockDropdownProps {
    open: boolean;
    onClose: () => void;
}

export function AnalogClockDropdown({ open, onClose }: AnalogClockDropdownProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeRef = useRef<HTMLDivElement>(null);
    const dateRef = useRef<HTMLDivElement>(null);

    // Single rAF loop — draws clock hands + updates digital readout every frame
    useEffect(() => {
        if (!open) return;

        let rafId: number;

        const draw = () => {
            const now = new Date();

            // ── Update digital readouts via refs (no React re-render) ──
            if (timeRef.current) {
                timeRef.current.textContent = now.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                });
            }
            if (dateRef.current && !dateRef.current.dataset.set) {
                dateRef.current.textContent = now.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                });
                dateRef.current.dataset.set = "1";
            }

            // ── Draw analog clock ──
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    const size = canvas.width;
                    const center = size / 2;
                    const radius = center - 12;

                    ctx.clearRect(0, 0, size, size);

                    // Clock face
                    ctx.beginPath();
                    ctx.arc(center, center, radius, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255,255,255,0.06)";
                    ctx.fill();
                    ctx.strokeStyle = "rgba(255,255,255,0.15)";
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    // Hour markers
                    for (let i = 0; i < 12; i++) {
                        const angle = (i * Math.PI) / 6 - Math.PI / 2;
                        const isMain = i % 3 === 0;
                        const outerR = radius - 4;
                        const innerR = isMain ? radius - 16 : radius - 10;

                        ctx.beginPath();
                        ctx.moveTo(center + outerR * Math.cos(angle), center + outerR * Math.sin(angle));
                        ctx.lineTo(center + innerR * Math.cos(angle), center + innerR * Math.sin(angle));
                        ctx.strokeStyle = isMain ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)";
                        ctx.lineWidth = isMain ? 2 : 1;
                        ctx.stroke();
                    }

                    // Minute ticks
                    for (let i = 0; i < 60; i++) {
                        if (i % 5 === 0) continue;
                        const angle = (i * Math.PI) / 30 - Math.PI / 2;
                        const outerR = radius - 4;
                        const innerR = radius - 7;

                        ctx.beginPath();
                        ctx.moveTo(center + outerR * Math.cos(angle), center + outerR * Math.sin(angle));
                        ctx.lineTo(center + innerR * Math.cos(angle), center + innerR * Math.sin(angle));
                        ctx.strokeStyle = "rgba(255,255,255,0.12)";
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }

                    // Hour numbers
                    ctx.fillStyle = "rgba(255,255,255,0.5)";
                    ctx.font = "500 11px -apple-system, 'Ubuntu', sans-serif";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    for (let i = 1; i <= 12; i++) {
                        const angle = (i * Math.PI) / 6 - Math.PI / 2;
                        const numR = radius - 26;
                        ctx.fillText(String(i), center + numR * Math.cos(angle), center + numR * Math.sin(angle));
                    }

                    const hours = now.getHours() % 12;
                    const minutes = now.getMinutes();
                    const seconds = now.getSeconds();
                    const millis = now.getMilliseconds();
                    // Sub-second precision for smooth second hand
                    const smoothSeconds = seconds + millis / 1000;

                    // Hour hand
                    const hourAngle = ((hours + minutes / 60) * Math.PI) / 6 - Math.PI / 2;
                    const hourLen = radius * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(center, center);
                    ctx.lineTo(center + hourLen * Math.cos(hourAngle), center + hourLen * Math.sin(hourAngle));
                    ctx.strokeStyle = "rgba(255,255,255,0.9)";
                    ctx.lineWidth = 3;
                    ctx.lineCap = "round";
                    ctx.stroke();

                    // Minute hand
                    const minAngle = ((minutes + smoothSeconds / 60) * Math.PI) / 30 - Math.PI / 2;
                    const minLen = radius * 0.72;
                    ctx.beginPath();
                    ctx.moveTo(center, center);
                    ctx.lineTo(center + minLen * Math.cos(minAngle), center + minLen * Math.sin(minAngle));
                    ctx.strokeStyle = "rgba(255,255,255,0.85)";
                    ctx.lineWidth = 2;
                    ctx.lineCap = "round";
                    ctx.stroke();

                    // Second hand (smooth sweep)
                    const secAngle = (smoothSeconds * Math.PI) / 30 - Math.PI / 2;
                    const secLen = radius * 0.82;
                    ctx.beginPath();
                    ctx.moveTo(center - 12 * Math.cos(secAngle), center - 12 * Math.sin(secAngle));
                    ctx.lineTo(center + secLen * Math.cos(secAngle), center + secLen * Math.sin(secAngle));
                    ctx.strokeStyle = "#E95420";
                    ctx.lineWidth = 1;
                    ctx.lineCap = "round";
                    ctx.stroke();

                    // Center dot
                    ctx.beginPath();
                    ctx.arc(center, center, 3.5, 0, Math.PI * 2);
                    ctx.fillStyle = "#E95420";
                    ctx.fill();

                    // Outer ring for center
                    ctx.beginPath();
                    ctx.arc(center, center, 5, 0, Math.PI * 2);
                    ctx.strokeStyle = "rgba(255,255,255,0.3)";
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }

            rafId = requestAnimationFrame(draw);
        };

        rafId = requestAnimationFrame(draw);
        return () => {
            cancelAnimationFrame(rafId);
            // Reset date flag so it re-computes next open
            if (dateRef.current) delete dateRef.current.dataset.set;
        };
    }, [open]);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
                            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
                            width: 240,
                        }}
                    >
                        {/* Clock Canvas */}
                        <div style={{ display: "flex", justifyContent: "center", padding: "20px 20px 8px" }}>
                            <canvas
                                ref={canvasRef}
                                width={180}
                                height={180}
                                style={{ width: 180, height: 180 }}
                            />
                        </div>

                        {/* Digital time */}
                        <div style={{ textAlign: "center", padding: "4px 20px 4px" }}>
                            <div
                                ref={timeRef}
                                style={{
                                    color: "rgba(255,255,255,0.95)",
                                    fontSize: 22,
                                    fontWeight: 600,
                                    letterSpacing: "0.5px",
                                    fontFamily: "'Ubuntu', -apple-system, sans-serif",
                                }}
                            >
                                &nbsp;
                            </div>
                        </div>

                        {/* Date & Timezone */}
                        <div
                            style={{
                                textAlign: "center",
                                padding: "2px 20px 16px",
                            }}
                        >
                            <div
                                ref={dateRef}
                                style={{
                                    color: "rgba(255,255,255,0.5)",
                                    fontSize: 11,
                                    fontWeight: 500,
                                }}
                            />
                            <div
                                style={{
                                    color: "rgba(255,255,255,0.3)",
                                    fontSize: 10,
                                    fontWeight: 400,
                                    marginTop: 2,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                }}
                            >
                                {timezone}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
