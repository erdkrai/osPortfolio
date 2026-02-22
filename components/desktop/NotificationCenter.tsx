"use client";

import { useNotificationStore } from "@/store/notifications";
import { useSettingsStore } from "@/store/settings";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationCenter() {
    const { notifications, removeNotification } = useNotificationStore();
    const { notifications: notificationsEnabled } = useSettingsStore();

    if (!notificationsEnabled || notifications.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-14 right-4 z-[10000] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="pointer-events-auto w-80 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-start gap-3 p-4">
                            {/* Icon */}
                            <div
                                className={clsx(
                                    "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                                    notification.type === "success" && "bg-emerald-500/20 text-emerald-400",
                                    notification.type === "error" && "bg-red-500/20 text-red-400",
                                    notification.type === "warning" && "bg-amber-500/20 text-amber-400",
                                    !notification.type && "bg-blue-500/20 text-blue-400"
                                )}
                            >
                                {notification.icon || (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        {notification.type === "success" && (
                                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                        )}
                                        {notification.type === "error" && (
                                            <path d="M12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
                                        )}
                                        {!notification.type && (
                                            <circle cx="12" cy="12" r="10" />
                                        )}
                                    </svg>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                                    {notification.title}
                                </h4>
                                <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                                    {notification.message}
                                </p>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="flex-shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}