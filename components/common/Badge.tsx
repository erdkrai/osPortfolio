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
                className
            )}
            style={
                variant === "accent"
                    ? { background: "var(--accent-subtle)", color: "var(--accent-color)" }
                    : variant === "green"
                        ? { background: "rgba(39,174,96,0.12)", color: "#27ae60" }
                        : { background: "var(--card-bg)", color: "var(--text-secondary)" }
            }
        >
            {label}
        </span>
    );
}
