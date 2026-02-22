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
            <div className="flex items-center justify-center h-full text-white/40">
                No preview data available
            </div>
        );
    }

    const { type, url } = previewData;

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] text-white selection:bg-orange-500/30">
            {/* Toolbar (macOS Quick Look / Eye of GNOME style) */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-black/20 shrink-0">
                <div className="text-xs font-medium text-white/60 truncate max-w-[200px]">
                    {windowState.title}
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1 px-2 hover:bg-white/10 rounded text-[10px] font-bold text-white/80 transition-colors uppercase tracking-tight">
                        Details
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-auto flex items-center justify-center bg-black/20">
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
            <div className="px-4 py-1.5 bg-[#2d2d2d] border-t border-black/10 text-[10px] text-white/30 font-medium">
                {type.toUpperCase()} PREVIEW MODE
            </div>
        </div>
    );
}
