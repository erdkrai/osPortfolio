"use client";

import { useEffect, useState, useCallback } from "react";
import { useSettingsStore } from "@/store/settings";

/* ── Battery API types ─────────────────────────────────────────────────── */
interface BatteryManager extends EventTarget {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
}

/* ── Network Information API types ─────────────────────────────────────── */
interface NetworkInformation extends EventTarget {
    type?: string;            // "wifi" | "cellular" | "ethernet" | "bluetooth" | "none" | "other" | "unknown"
    effectiveType?: string;   // "slow-2g" | "2g" | "3g" | "4g"
    downlink?: number;        // Mbps
    rtt?: number;             // ms
    saveData?: boolean;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
}

/* ── Shared dropdown shell ─────────────────────────────────────────────── */
function TrayShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <>
            <div className="fixed inset-0 z-[9998]" onClick={onClose} />
            <div
                className="absolute top-8 right-0 z-[9999] w-[260px] rounded-xl overflow-hidden"
                style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",
                }}
            >
                {children}
            </div>
        </>
    );
}

/* ── Volume icon variants ──────────────────────────────────────────────── */
function VolumeIcon({ volume, muted, size = 20 }: { volume: number; muted: boolean; size?: number }) {
    if (muted || volume === 0) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
        );
    }
    if (volume < 33) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 9v6h4l5 5V4l-5 5H7z" />
            </svg>
        );
    }
    if (volume < 66) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
            </svg>
        );
    }
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
    );
}

/* ── Battery icon SVG ──────────────────────────────────────────────────── */
function BatteryIconSvg({ level, charging, size = 20 }: { level: number; charging: boolean; size?: number }) {
    const fillWidth = Math.round((level / 100) * 12);
    const fillColor = level <= 15 ? "#e01b24" : level <= 30 ? "#e5a50a" : "currentColor";

    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="2" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="20" y="9.5" width="2.5" height="5" rx="0.8" fill="currentColor" />
            <rect x="4" y="8" width={fillWidth} height="8" rx="1" fill={fillColor} opacity={0.85} />
            {charging && (
                <path d="M12 7l-3 5h3l-1 5 4-6h-3.5L12 7z" fill="white" stroke="currentColor" strokeWidth="0.3" />
            )}
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   Volume Tray Dropdown
   ═══════════════════════════════════════════════════════════════════════ */
export function VolumeTrayDropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { volume, setVolume, soundEffects, setSoundEffects } = useSettingsStore();

    const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const v = parseInt(e.target.value);
        setVolume(v);
        if (v > 0 && !soundEffects) setSoundEffects(true);
        if (v === 0 && soundEffects) setSoundEffects(false);
    }, [setVolume, setSoundEffects, soundEffects]);

    const toggleMute = useCallback(() => {
        if (soundEffects) {
            setSoundEffects(false);
        } else {
            setSoundEffects(true);
            if (volume === 0) setVolume(75);
        }
    }, [soundEffects, volume, setSoundEffects, setVolume]);

    if (!open) return null;

    const displayVolume = soundEffects ? volume : 0;

    return (
        <TrayShell onClose={onClose}>
            {/* Header */}
            <div className="px-4 pt-3 pb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Sound
                </span>
            </div>

            {/* Volume slider row */}
            <div className="px-4 pt-1 pb-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleMute}
                        className="p-1.5 rounded-full transition-colors shrink-0"
                        style={{ color: "var(--text-primary)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        aria-label={soundEffects ? "Mute" : "Unmute"}
                        title={soundEffects ? "Mute" : "Unmute"}
                    >
                        <VolumeIcon volume={displayVolume} muted={!soundEffects} size={18} />
                    </button>

                    <div className="flex-1">
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={displayVolume}
                            onChange={handleSliderChange}
                            className="system-tray-slider w-full"
                            aria-label="Volume"
                            style={{
                                "--slider-progress": `${displayVolume}%`,
                                "--accent": "var(--accent-color)",
                            } as React.CSSProperties}
                        />
                    </div>

                    <span
                        className="text-xs font-medium w-8 text-right tabular-nums shrink-0"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {displayVolume}%
                    </span>
                </div>
            </div>

            {/* Output device */}
            <div style={{ borderTop: "1px solid var(--border-color)" }} />
            <div className="px-4 py-2.5 flex items-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z" />
                </svg>
                <div className="flex-1 min-w-0">
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>Output Device</div>
                    <div className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>Speakers (Built-in)</div>
                </div>
            </div>
        </TrayShell>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   Battery Tray Dropdown
   ═══════════════════════════════════════════════════════════════════════ */
export function BatteryTrayDropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);

    useEffect(() => {
        let bm: BatteryManager | null = null;

        const update = () => {
            if (bm) setBattery({ level: Math.round(bm.level * 100), charging: bm.charging });
        };

        if (typeof navigator !== "undefined" && "getBattery" in navigator) {
            (navigator as any).getBattery().then((b: BatteryManager) => {
                bm = b;
                update();
                b.addEventListener("levelchange", update);
                b.addEventListener("chargingchange", update);
            }).catch(() => setBattery(null));
        }

        return () => {
            if (bm) {
                bm.removeEventListener("levelchange", update);
                bm.removeEventListener("chargingchange", update);
            }
        };
    }, []);

    if (!open) return null;

    const batteryLevel = battery?.level ?? null;
    const isCharging = battery?.charging ?? false;

    const statusText = batteryLevel === null
        ? "Battery info unavailable"
        : isCharging
            ? batteryLevel === 100 ? "Fully charged" : "Charging"
            : batteryLevel <= 15
                ? "Low battery"
                : batteryLevel <= 30
                    ? "Battery is getting low"
                    : "On battery power";

    const barColor = batteryLevel !== null && batteryLevel <= 15
        ? "#e01b24"
        : batteryLevel !== null && batteryLevel <= 30
            ? "#e5a50a"
            : "var(--accent-color)";

    return (
        <TrayShell onClose={onClose}>
            {/* Header */}
            <div className="px-4 pt-3 pb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Power
                </span>
            </div>

            {/* Battery info */}
            <div className="px-4 pt-1 pb-3">
                <div className="flex items-center gap-3">
                    <div className="shrink-0" style={{ color: "var(--text-primary)" }}>
                        <BatteryIconSvg level={batteryLevel ?? 100} charging={isCharging} size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Battery</span>
                            <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                                {batteryLevel !== null ? `${batteryLevel}%` : "N/A"}
                            </span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-1.5 h-[5px] rounded-full overflow-hidden" style={{ background: "var(--card-bg)" }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${batteryLevel ?? 100}%`, background: barColor }}
                            />
                        </div>
                        <div className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>{statusText}</div>
                    </div>
                </div>
            </div>

            {/* Estimated time */}
            <div style={{ borderTop: "1px solid var(--border-color)" }} />
            <div className="px-4 py-2.5 flex items-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
                <div className="flex-1 min-w-0">
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {isCharging ? "Time to full" : "Time remaining"}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {batteryLevel === null ? "—" : batteryLevel === 100 ? "Fully charged" : "Estimating…"}
                    </div>
                </div>
            </div>
        </TrayShell>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   Network Tray Dropdown — real device sync via Network Information API
   + fallback speed test for unsupported browsers (Safari/Firefox)
   ═══════════════════════════════════════════════════════════════════════ */

interface NetInfo {
    online: boolean;
    type: string;
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
    apiSupported: boolean;
}

function getNetInfo(): NetInfo {
    if (typeof navigator === "undefined") {
        return { online: false, type: "unknown", effectiveType: "unknown", downlink: 0, rtt: 0, saveData: false, apiSupported: false };
    }
    const conn = (navigator as any).connection as NetworkInformation | undefined;
    return {
        online: navigator.onLine,
        type: conn?.type ?? "unknown",
        effectiveType: conn?.effectiveType ?? "unknown",
        downlink: conn?.downlink ?? 0,
        rtt: conn?.rtt ?? 0,
        saveData: conn?.saveData ?? false,
        apiSupported: !!conn,
    };
}

/** Measure real RTT by pinging the current origin */
async function measureRtt(): Promise<number> {
    try {
        const start = performance.now();
        await fetch(window.location.origin, { method: "HEAD", cache: "no-store" });
        return Math.round(performance.now() - start);
    } catch {
        return 0;
    }
}

/** Estimate download speed by fetching a known resource and timing it */
async function measureSpeed(): Promise<number> {
    try {
        // Fetch a small asset (favicon or a CSS file) and measure throughput
        const urls = ["/favicon.ico", "/"];
        const url = urls[0];
        const start = performance.now();
        const res = await fetch(url, { cache: "no-store" });
        const blob = await res.blob();
        const elapsed = (performance.now() - start) / 1000; // seconds
        const bytes = blob.size;
        if (elapsed <= 0 || bytes <= 0) return 0;
        const mbps = (bytes * 8) / (elapsed * 1_000_000); // bits to Mbps
        return Math.round(mbps * 10) / 10;
    } catch {
        return 0;
    }
}

function connectionLabel(type: string, online: boolean): string {
    if (!online) return "No Connection";
    switch (type) {
        case "wifi": return "Wi-Fi";
        case "ethernet": return "Ethernet";
        case "cellular": return "Cellular";
        case "bluetooth": return "Bluetooth Tethering";
        case "none": return "No Connection";
        default: return "Wi-Fi"; // Most devices visiting a web app are on Wi-Fi
    }
}

function WifiStrengthIcon({ rtt, online, size = 20 }: { rtt: number; online: boolean; size?: number }) {
    if (!online) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" opacity="0.3" />
                <line x1="3" y1="21" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    }
    // Signal bars based on RTT: <80ms = full, <150ms = medium, else weak
    if (rtt > 0 && rtt < 80) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            </svg>
        );
    }
    if (rtt > 0 && rtt < 150) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9z" opacity="0.3" />
                <path d="M9 17l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            </svg>
        );
    }
    if (rtt > 150) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm4 4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" opacity="0.3" />
                <path d="M9 17l3 3 3-3c-1.65-1.66-4.34-1.66-6 0z" />
            </svg>
        );
    }
    // Default full when no RTT data yet
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
        </svg>
    );
}

function signalQuality(rtt: number): string {
    if (rtt <= 0) return "Measuring…";
    if (rtt < 50) return "Excellent";
    if (rtt < 100) return "Very Good";
    if (rtt < 150) return "Good";
    if (rtt < 300) return "Fair";
    return "Poor";
}

export function NetworkTrayDropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [info, setInfo] = useState<NetInfo>(getNetInfo);
    const [measuredRtt, setMeasuredRtt] = useState<number>(0);
    const [measuredSpeed, setMeasuredSpeed] = useState<number>(0);
    const [measuring, setMeasuring] = useState(false);

    // Refresh from browser APIs on online/offline/connection change
    useEffect(() => {
        const refresh = () => setInfo(getNetInfo());

        window.addEventListener("online", refresh);
        window.addEventListener("offline", refresh);

        const conn = (navigator as any).connection as NetworkInformation | undefined;
        if (conn) conn.addEventListener("change", refresh);

        return () => {
            window.removeEventListener("online", refresh);
            window.removeEventListener("offline", refresh);
            if (conn) conn.removeEventListener("change", refresh);
        };
    }, []);

    // Run a real speed/rtt measurement when tray opens
    useEffect(() => {
        if (!open || !info.online) return;
        let cancelled = false;
        setMeasuring(true);

        (async () => {
            // Always refresh base info
            setInfo(getNetInfo());

            // Measure real RTT
            const rtt = await measureRtt();
            if (!cancelled) setMeasuredRtt(rtt);

            // Measure speed (only if browser API doesn't provide it)
            if (!info.apiSupported || info.downlink === 0) {
                const speed = await measureSpeed();
                if (!cancelled) setMeasuredSpeed(speed);
            }
            if (!cancelled) setMeasuring(false);
        })();

        return () => { cancelled = true; };
    }, [open, info.online, info.apiSupported, info.downlink]);

    if (!open) return null;

    const { online, type, effectiveType, downlink, rtt, saveData, apiSupported } = info;

    // Use measured values when API values are unavailable
    const displayRtt = (apiSupported && rtt > 0) ? rtt : measuredRtt;
    const displaySpeed = (apiSupported && downlink > 0) ? downlink : measuredSpeed;
    const displayEffective = apiSupported ? effectiveType : (
        displayRtt <= 0 ? "unknown" : displayRtt < 100 ? "4g" : displayRtt < 300 ? "3g" : "2g"
    );

    return (
        <TrayShell onClose={onClose}>
            {/* Header */}
            <div className="px-4 pt-3 pb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Network
                </span>
            </div>

            {/* Connection status */}
            <div className="px-4 pt-1 pb-3">
                <div className="flex items-center gap-3">
                    <div className="shrink-0" style={{ color: online ? "var(--accent-color)" : "var(--text-muted)" }}>
                        <WifiStrengthIcon rtt={displayRtt} online={online} size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                {connectionLabel(type, online)}
                            </span>
                            <span
                                className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                                style={{
                                    background: online ? "var(--accent-subtle)" : "var(--card-bg)",
                                    color: online ? "var(--accent-color)" : "var(--text-muted)",
                                }}
                            >
                                {online ? "Connected" : "Disconnected"}
                            </span>
                        </div>
                        {online && (
                            <div className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                                Signal: {measuring && displayRtt === 0 ? "Measuring…" : signalQuality(displayRtt)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid var(--border-color)" }} />

            {/* Connection details */}
            {online && (
                <>
                    <div className="px-4 py-2.5 space-y-2">
                        {/* Speed */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-muted)" }}>
                                    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                                </svg>
                                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Speed</span>
                            </div>
                            <span className="text-xs font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>
                                {measuring && displaySpeed === 0
                                    ? "Testing…"
                                    : displaySpeed > 0
                                        ? `${displaySpeed} Mbps`
                                        : "—"}
                            </span>
                        </div>

                        {/* Latency */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-muted)" }}>
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                </svg>
                                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Latency</span>
                            </div>
                            <span className="text-xs font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>
                                {measuring && displayRtt === 0
                                    ? "Pinging…"
                                    : displayRtt > 0
                                        ? `${displayRtt} ms`
                                        : "—"}
                            </span>
                        </div>

                        {/* Connection quality */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-muted)" }}>
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                </svg>
                                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Type</span>
                            </div>
                            <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                                {displayEffective !== "unknown" ? displayEffective.toUpperCase() : "—"}
                            </span>
                        </div>

                        {/* Data saver */}
                        {saveData && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-muted)" }}>
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                    </svg>
                                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Data Saver</span>
                                </div>
                                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                                    style={{ background: "var(--accent-subtle)", color: "var(--accent-color)" }}>
                                    On
                                </span>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Footer */}
            {online && <div style={{ borderTop: "1px solid var(--border-color)" }} />}
            <div className="px-4 py-2.5 flex items-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                </svg>
                <div className="flex-1 min-w-0">
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {online ? type === "ethernet" ? "Wired Connection" : "Wi-Fi Network" : "Network Unavailable"}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {online ? "Turn off in system settings" : "Check your connection"}
                    </div>
                </div>
            </div>
        </TrayShell>
    );
}