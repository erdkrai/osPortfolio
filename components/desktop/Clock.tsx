"use client";

import { useEffect, useState } from "react";

export function Clock() {
    const [time, setTime] = useState<string>("");

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(
                now.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })
            );
        };
        update();
        const id = setInterval(update, 30_000);
        return () => clearInterval(id);
    }, []);

    return (
        <time
            className="text-white/80 text-xs font-medium tabular-nums pl-1 select-none"
            aria-label="Current time"
        >
            {time}
        </time>
    );
}
