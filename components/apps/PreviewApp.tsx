"use client";

import { useWindowStore } from "@/store/windows";
import { clsx } from "clsx";

interface PreviewAppProps {
    windowId: string;
}

export function PreviewApp({ windowId }: PreviewAppProps) {
    const windowState = useWindowStore((s) => s.windows.find(w => w.windowId === windowId));
    const previewData = windowState?.previewData;

    if (!previewData) {
        return (
            <div className="flex items-center justify-center h-full" style={{ color: "var(--text-muted)" }}>
                No preview data available
            </div>
        );
    }

    const { type, url } = previewData;

    return (
        <div className="flex flex-col h-full selection:bg-orange-500/30" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
            {/* Toolbar (macOS Quick Look / Eye of GNOME style) */}
            <div
                className="flex items-center justify-between px-4 py-2 shrink-0"
                style={{ background: "var(--bg-primary)", borderBottom: "1px solid var(--border-color)" }}
            >
                <div className="text-xs font-medium truncate max-w-[200px]" style={{ color: "var(--text-secondary)" }}>
                    {windowState.title}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="p-1 px-2 rounded text-[10px] font-bold transition-colors uppercase tracking-tight"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                        Details
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-auto flex items-center justify-center" style={{ background: "var(--card-bg)" }}>
                {type === "image" && (
                    <img
                        src={url}
                        alt={windowState.title}
                        className="max-w-full max-h-full object-contain shadow-2xl animate-in fade-in zoom-in-95 duration-300"
                    />
                )}

                {type === "video" && (
                    <video
                        src={url}
                        controls
                        autoPlay
                        className="max-w-full max-h-full shadow-2xl"
                    />
                )}

                {type === "pdf" && (
                    <iframe
                        src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full border-none bg-white"
                        title="PDF Preview"
                    />
                )}
            </div>

            {/* Subtle Footer */}
            <div
                className="px-4 py-1.5 text-[10px] font-medium"
                style={{ background: "var(--bg-primary)", borderTop: "1px solid var(--border-color)", color: "var(--text-muted)" }}
            >
                {type.toUpperCase()} PREVIEW MODE
            </div>
        </div>
    );
}
