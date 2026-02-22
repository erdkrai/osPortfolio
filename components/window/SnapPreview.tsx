"use client";

import { SnapZone } from "@/store/windows";
import { motion, AnimatePresence } from "framer-motion";

export function getSnappedGeometry(zone: SnapZone) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const topBarHeight = 32;

    switch (zone) {
        case "left":
            return { x: 0, y: topBarHeight, w: vw / 2, h: vh - topBarHeight };
        case "right":
            return { x: vw / 2, y: topBarHeight, w: vw / 2, h: vh - topBarHeight };
        case "top-left":
            return { x: 0, y: topBarHeight, w: vw / 2, h: (vh - topBarHeight) / 2 };
        case "top-right":
            return { x: vw / 2, y: topBarHeight, w: vw / 2, h: (vh - topBarHeight) / 2 };
        case "bottom-left":
            return { x: 0, y: topBarHeight + (vh - topBarHeight) / 2, w: vw / 2, h: (vh - topBarHeight) / 2 };
        case "bottom-right":
            return { x: vw / 2, y: topBarHeight + (vh - topBarHeight) / 2, w: vw / 2, h: (vh - topBarHeight) / 2 };
    }
}

interface SnapPreviewProps {
    zone: SnapZone | null;
}

export function SnapPreview({ zone }: SnapPreviewProps) {
    return (
        <AnimatePresence>
            {zone && <SnapPreviewRect key={zone} zone={zone} />}
        </AnimatePresence>
    );
}

function SnapPreviewRect({ zone }: { zone: SnapZone }) {
    const geo = getSnappedGeometry(zone);
    const INSET = 6;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed rounded-xl border-2 border-[#E95420] bg-[#E95420]/12 pointer-events-none z-[9999] backdrop-blur-[2px]"
            style={{
                left: geo.x + INSET,
                top: geo.y + INSET,
                width: geo.w - INSET * 2,
                height: geo.h - INSET * 2,
            }}
        />
    );
}