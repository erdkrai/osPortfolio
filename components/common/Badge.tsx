import { clsx } from "clsx";

interface BadgeProps {
    label: string;
    variant?: "default" | "accent" | "green";
    className?: string;
}

export function Badge({ label, variant = "default", className }: BadgeProps) {
    return (
        <span
            className={clsx(
                "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                variant === "default" && "bg-white/10 text-white/70",
                variant === "accent" && "bg-indigo-500/20 text-indigo-300",
                variant === "green" && "bg-emerald-500/20 text-emerald-300",
                className
            )}
        >
            {label}
        </span>
    );
}
