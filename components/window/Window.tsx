"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWindowStore, WindowInstance, SnapZone } from "@/store/windows";
import { useSettingsStore } from "@/store/settings";
import { WindowControls } from "./WindowControls";
import { AppRenderer } from "@/components/common/AppRenderer";
import { getSnappedGeometry } from "./SnapPreview";
import { clsx } from "clsx";
import { motion } from "framer-motion";

interface WindowProps {
    window: WindowInstance;
}

const TOP_BAR_HEIGHT = 32;
const SNAP_EDGE_THRESHOLD = 8;
const MIN_W = 300;
const MIN_H = 200;

// ---------- helpers ----------
function detectSnapZone(clientX: number, clientY: number): SnapZone | null {
    const vw = globalThis.window?.innerWidth ?? 1920;
    const vh = globalThis.window?.innerHeight ?? 1080;
    const nearLeft = clientX <= SNAP_EDGE_THRESHOLD;
    const nearRight = clientX >= vw - SNAP_EDGE_THRESHOLD;
    const nearTop = clientY <= SNAP_EDGE_THRESHOLD;
    const nearBottom = clientY >= vh - SNAP_EDGE_THRESHOLD;

    if (nearLeft && nearTop) return "top-left";
    if (nearLeft && nearBottom) return "bottom-left";
    if (nearRight && nearTop) return "top-right";
    if (nearRight && nearBottom) return "bottom-right";
    if (nearLeft) return "left";
    if (nearRight) return "right";
    // Top edge alone → maximize (handled separately on pointer up)
    return null;
}

type ResizeEdge =
    | "n" | "s" | "e" | "w"
    | "ne" | "nw" | "se" | "sw";

export function Window({ window: win }: WindowProps) {
    const {
        focusWindow, activeWindowId,
        moveWindow, resizeWindow,
        toggleMaximize, snapWindow, unsnapWindow,
        setDragSnapPreview,
    } = useWindowStore();
    const { windowAnimations } = useSettingsStore();
    const [isMobile, setIsMobile] = useState(false);
    // Track whether we are actively dragging / resizing so we can disable
    // framer-motion layout animations (which fight with direct DOM updates).
    const [interacting, setInteracting] = useState(false);

    const windowRef = useRef<HTMLDivElement>(null);

    // --- drag state ---
    const dragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const unsnapRatio = useRef<number | null>(null);
    // Track live position during drag (for commit on release)
    const livePos = useRef({ x: win.x, y: win.y });

    // --- resize state ---
    const resizing = useRef(false);
    const resizeEdge = useRef<ResizeEdge | null>(null);
    const resizeStart = useRef({ mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 });
    const liveRect = useRef({ x: win.x, y: win.y, w: win.w, h: win.h });

    // Snap preview throttle ref
    const lastSnapZone = useRef<SnapZone | null>(null);

    useEffect(() => {
        const check = () => setIsMobile(globalThis.window?.innerWidth < 768);
        check();
        globalThis.window?.addEventListener("resize", check);
        return () => globalThis.window?.removeEventListener("resize", check);
    }, []);

    // ======================= DRAG =======================
    // Use document-level listeners for move/up so cursor can leave the titlebar
    // without losing the drag. This is key for responsiveness.

    const handleDragMove = useCallback((e: PointerEvent) => {
        if (!dragging.current || !windowRef.current) return;

        const el = windowRef.current;

        // First move after pointerDown on a maximized/snapped window → unsnap
        if (win.maximized || win.snapZone) {
            const ratio = unsnapRatio.current ?? 0.5;
            const restoredW = win.snapZone ? win.savedW : win.savedW || win.w;
            const restoredH = win.snapZone ? win.savedH : win.savedH || win.h;
            const newX = e.clientX - restoredW * ratio;
            const newY = e.clientY - TOP_BAR_HEIGHT / 2;

            if (win.maximized) toggleMaximize(win.windowId);
            if (win.snapZone) unsnapWindow(win.windowId);

            resizeWindow(win.windowId, newX, newY, restoredW, restoredH);
            dragOffset.current = { x: e.clientX - newX, y: e.clientY - newY };
            livePos.current = { x: newX, y: newY };
            unsnapRatio.current = null;

            // Apply to DOM immediately
            el.style.left = `${newX}px`;
            el.style.top = `${newY}px`;
            el.style.width = `${restoredW}px`;
            el.style.height = `${restoredH}px`;
            el.style.right = "auto";
            el.style.bottom = "auto";
            return;
        }

        const newX = e.clientX - dragOffset.current.x;
        const newY = Math.max(TOP_BAR_HEIGHT, e.clientY - dragOffset.current.y);
        livePos.current = { x: newX, y: newY };

        // Direct DOM update — bypasses React completely
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;

        // Edge-snap preview (lightweight — only update store when zone changes)
        const zone = detectSnapZone(e.clientX, e.clientY);
        if (zone !== lastSnapZone.current) {
            lastSnapZone.current = zone;
            setDragSnapPreview(zone);
        }
    }, [win.windowId, win.maximized, win.snapZone, win.savedW, win.savedH, win.w, win.h,
        toggleMaximize, unsnapWindow, resizeWindow, setDragSnapPreview]);

    const handleDragUp = useCallback((e: PointerEvent) => {
        if (!dragging.current) return;
        dragging.current = false;
        unsnapRatio.current = null;
        setInteracting(false);

        // Commit final position to store
        moveWindow(win.windowId, livePos.current.x, livePos.current.y);

        // Snap if near edge
        const zone = detectSnapZone(e.clientX, e.clientY);
        if (zone) {
            snapWindow(win.windowId, zone);
        } else if (e.clientY <= SNAP_EDGE_THRESHOLD) {
            // Top edge without a corner → maximize
            toggleMaximize(win.windowId);
        }

        lastSnapZone.current = null;
        setDragSnapPreview(null);

        document.removeEventListener("pointermove", handleDragMove);
        document.removeEventListener("pointerup", handleDragUp);
    }, [win.windowId, moveWindow, toggleMaximize, snapWindow, setDragSnapPreview, handleDragMove]);

    const handleTitleBarPointerDown = useCallback((e: React.PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        focusWindow(win.windowId);

        const isMaxOrSnapped = win.maximized || !!win.snapZone;

        if (isMaxOrSnapped) {
            const snappedGeo = win.snapZone ? getSnappedGeometry(win.snapZone) : null;
            const currentW = win.maximized
                ? (globalThis.window?.innerWidth ?? 1920)
                : snappedGeo?.w ?? win.w;
            const currentX = win.maximized ? 0 : snappedGeo?.x ?? win.x;
            unsnapRatio.current = (e.clientX - currentX) / currentW;
        }

        dragging.current = true;
        setInteracting(true);
        dragOffset.current = {
            x: e.clientX - win.x,
            y: e.clientY - win.y,
        };
        livePos.current = { x: win.x, y: win.y };

        // GPU hint
        if (windowRef.current) {
            windowRef.current.style.willChange = "left, top";
        }

        // Global listeners for instant tracking even when cursor leaves the element
        document.addEventListener("pointermove", handleDragMove);
        document.addEventListener("pointerup", handleDragUp);
    }, [win.windowId, win.x, win.y, win.maximized, win.snapZone, win.w,
        focusWindow, handleDragMove, handleDragUp]);

    // Cleanup listeners on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener("pointermove", handleDragMove);
            document.removeEventListener("pointerup", handleDragUp);
        };
    }, [handleDragMove, handleDragUp]);

    // ====================== RESIZE ======================
    const handleResizeMove = useCallback((e: PointerEvent) => {
        if (!resizing.current || !resizeEdge.current || !windowRef.current) return;
        const { mx, my, x, y, w, h } = resizeStart.current;
        const dx = e.clientX - mx;
        const dy = e.clientY - my;
        const edge = resizeEdge.current;

        let newX = x, newY = y, newW = w, newH = h;

        if (edge.includes("e")) newW = Math.max(MIN_W, w + dx);
        if (edge.includes("w")) { newW = Math.max(MIN_W, w - dx); newX = x + (w - newW); }
        if (edge.includes("s")) newH = Math.max(MIN_H, h + dy);
        if (edge.includes("n")) { newH = Math.max(MIN_H, h - dy); newY = Math.max(TOP_BAR_HEIGHT, y + (h - newH)); }

        liveRect.current = { x: newX, y: newY, w: newW, h: newH };

        // Direct DOM update
        const el = windowRef.current;
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
        el.style.width = `${newW}px`;
        el.style.height = `${newH}px`;
    }, []);

    const handleResizeUp = useCallback(() => {
        if (!resizing.current) return;
        resizing.current = false;
        resizeEdge.current = null;
        setInteracting(false);

        // Commit to store
        const { x, y, w, h } = liveRect.current;
        resizeWindow(win.windowId, x, y, w, h);

        if (windowRef.current) {
            windowRef.current.style.willChange = "auto";
        }

        document.removeEventListener("pointermove", handleResizeMove);
        document.removeEventListener("pointerup", handleResizeUp);
    }, [win.windowId, resizeWindow, handleResizeMove]);

    const handleResizePointerDown = useCallback((edge: ResizeEdge, e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        focusWindow(win.windowId);

        // Current rendered geometry
        const snappedGeo = win.snapZone ? getSnappedGeometry(win.snapZone) : null;
        const cx = win.maximized ? 0 : snappedGeo ? snappedGeo.x : win.x;
        const cy = win.maximized ? TOP_BAR_HEIGHT : snappedGeo ? snappedGeo.y : win.y;
        const cw = win.maximized ? (globalThis.window?.innerWidth ?? 1920) : snappedGeo ? snappedGeo.w : win.w;
        const ch = win.maximized ? ((globalThis.window?.innerHeight ?? 1080) - TOP_BAR_HEIGHT) : snappedGeo ? snappedGeo.h : win.h;

        if (win.maximized) toggleMaximize(win.windowId);
        if (win.snapZone) unsnapWindow(win.windowId);
        resizeWindow(win.windowId, cx, cy, cw, ch);

        resizing.current = true;
        resizeEdge.current = edge;
        resizeStart.current = { mx: e.clientX, my: e.clientY, x: cx, y: cy, w: cw, h: ch };
        liveRect.current = { x: cx, y: cy, w: cw, h: ch };
        setInteracting(true);

        if (windowRef.current) {
            windowRef.current.style.willChange = "left, top, width, height";
        }

        document.addEventListener("pointermove", handleResizeMove);
        document.addEventListener("pointerup", handleResizeUp);
    }, [win.windowId, win.x, win.y, win.w, win.h, win.maximized, win.snapZone,
        focusWindow, toggleMaximize, unsnapWindow, resizeWindow, handleResizeMove, handleResizeUp]);

    // Cleanup resize listeners on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener("pointermove", handleResizeMove);
            document.removeEventListener("pointerup", handleResizeUp);
        };
    }, [handleResizeMove, handleResizeUp]);

    // ====================== RENDER ======================

    const isActive = win.windowId === activeWindowId;
    const isMaximized = win.maximized;
    const isSnapped = !!win.snapZone;

    const snappedGeo = isSnapped ? getSnappedGeometry(win.snapZone!) : null;

    let style: React.CSSProperties = { zIndex: win.z };
    if (win.minimized) {
        // Keep mounted (preserves iframes / app state) but fully hidden
        style = {
            ...style,
            left: win.x,
            top: win.y,
            width: win.w,
            height: win.h,
            visibility: "hidden" as const,
            pointerEvents: "none" as const,
            position: "fixed",
        };
    } else if (isMaximized) {
        style = { ...style, left: 0, top: TOP_BAR_HEIGHT, right: 0, bottom: 0, width: "100vw", height: `calc(100vh - ${TOP_BAR_HEIGHT}px)` };
    } else if (isSnapped && snappedGeo) {
        style = { ...style, left: snappedGeo.x, top: snappedGeo.y, width: snappedGeo.w, height: snappedGeo.h };
    } else {
        style = { ...style, left: win.x, top: win.y, width: win.w, height: win.h };
    }

    // Numeric position values for animation calculations
    const numLeft = isMaximized ? 0 : isSnapped && snappedGeo ? snappedGeo.x : win.x;
    const numTop = isMaximized ? TOP_BAR_HEIGHT : isSnapped && snappedGeo ? snappedGeo.y : win.y;
    const numW = isMaximized ? globalThis.window?.innerWidth ?? 1920 : isSnapped && snappedGeo ? snappedGeo.w : win.w;
    const numH = isMaximized ? (globalThis.window?.innerHeight ?? 1080) - TOP_BAR_HEIGHT : isSnapped && snappedGeo ? snappedGeo.h : win.h;

    const variants: any = {
        hidden: (origin: any) => ({
            opacity: 0,
            scale: origin ? 0.05 : 0.8,
            x: origin ? origin.x + origin.w / 2 - (numLeft + numW / 2) : 0,
            y: origin ? origin.y + origin.h / 2 - (numTop + numH / 2) : 0,
            filter: "blur(10px)",
            transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
        }),
        visible: {
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 26,
                stiffness: 220,
                mass: 1,
            }
        },
    };

    if (isMobile) {
        const MobileComponent = windowAnimations ? motion.div : "div";
        const mobileProps = windowAnimations ? {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 20 }
        } : {};

        return (
            <MobileComponent
                {...mobileProps}
                className="fixed inset-0 flex flex-col bg-[var(--window-body-bg)] mb-16"
                style={{ zIndex: win.z, top: TOP_BAR_HEIGHT }}
            >
                <div className="flex items-center justify-between px-4 py-3 bg-[var(--headerbar-bg-start)] border-b border-[var(--headerbar-border)]">
                    <WindowControls window={win} />
                    <span className="text-[var(--text-primary)]/80 text-sm font-medium">{win.title}</span>
                    <div className="w-16" />
                </div>
                <div className="flex-1 overflow-auto">
                    <AppRenderer appId={win.appId} windowId={win.windowId} />
                </div>
            </MobileComponent>
        );
    }

    const WindowComponent = windowAnimations ? motion.div : "div";
    // Disable layout animations while dragging/resizing — they fight with
    // the direct DOM updates and cause the springy lag.
    const animationProps = windowAnimations ? {
        layout: !interacting,
        custom: win.originRect,
        initial: "hidden",
        animate: "visible",
        exit: "hidden",
        variants
    } : {};

    // Resize handles (8 directions)
    const resizeHandles = !isMaximized && !win.disableResize ? (
        <>
            {/* Edges */}
            <div className="absolute -top-[3px] left-2 right-2 h-[6px] cursor-ns-resize z-50"
                onPointerDown={(e) => handleResizePointerDown("n", e)} />
            <div className="absolute -bottom-[3px] left-2 right-2 h-[6px] cursor-ns-resize z-50"
                onPointerDown={(e) => handleResizePointerDown("s", e)} />
            <div className="absolute -left-[3px] top-2 bottom-2 w-[6px] cursor-ew-resize z-50"
                onPointerDown={(e) => handleResizePointerDown("w", e)} />
            <div className="absolute -right-[3px] top-2 bottom-2 w-[6px] cursor-ew-resize z-50"
                onPointerDown={(e) => handleResizePointerDown("e", e)} />
            {/* Corners */}
            <div className="absolute -top-[3px] -left-[3px] w-[10px] h-[10px] cursor-nwse-resize z-50"
                onPointerDown={(e) => handleResizePointerDown("nw", e)} />
            <div className="absolute -top-[3px] -right-[3px] w-[10px] h-[10px] cursor-nesw-resize z-50"
                onPointerDown={(e) => handleResizePointerDown("ne", e)} />
            <div className="absolute -bottom-[3px] -left-[3px] w-[10px] h-[10px] cursor-nesw-resize z-50"
                onPointerDown={(e) => handleResizePointerDown("sw", e)} />
            <div className="absolute -bottom-[3px] -right-[3px] w-[10px] h-[10px] cursor-nwse-resize z-50"
                onPointerDown={(e) => handleResizePointerDown("se", e)} />
        </>
    ) : null;

    return (
        <WindowComponent
            ref={windowRef}
            {...animationProps}
            className={clsx(
                "fixed flex flex-col ubuntu-window",
                isActive && "ubuntu-window-active",
                !isActive && "shadow-none"
            )}
            style={style}
            onPointerDown={() => focusWindow(win.windowId)}
        >
            {/* Resize handles */}
            {resizeHandles}

            {/* Titlebar — draggable */}
            <div
                className={clsx("ubuntu-headerbar", !isActive && "ubuntu-headerbar-inactive")}
                onPointerDown={handleTitleBarPointerDown}
                onDoubleClick={() => { if (!win.disableResize) toggleMaximize(win.windowId); }}
                style={{ touchAction: "none", cursor: "default" }}
            >
                <WindowControls window={win} />
                <div className="flex-1 flex justify-center">
                    <span
                        className={clsx(
                            "text-sm font-medium select-none pointer-events-none transition-colors"
                        )}
                        style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}
                    >
                        {win.title}
                    </span>
                </div>
                <div className="w-10" />
            </div>

            {/* Window body */}
            <div className="ubuntu-window-body flex flex-col flex-1 overflow-hidden">
                <AppRenderer appId={win.appId} windowId={win.windowId} />
            </div>
        </WindowComponent>
    );
}