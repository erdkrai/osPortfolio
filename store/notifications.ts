import { create } from "zustand";
import { playSound } from "@/lib/sound";

export interface Notification {
    id: string;
    title: string;
    message: string;
    icon?: string;
    type?: "info" | "success" | "warning" | "error";
    timestamp: number;
}

interface NotificationStore {
    notifications: Notification[];
    notificationsEnabled: boolean;
    addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    setNotificationsEnabled: (enabled: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    notificationsEnabled: true,

    addNotification: (notification) => {
        const id = `notif-${Date.now()}-${Math.random()}`;
        const newNotification: Notification = {
            ...notification,
            id,
            timestamp: Date.now(),
        };

        set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 5), // Keep max 5
        }));

        // Play notification sound if enabled
        if (useSettingsStore.getState().notifications) {
            playSound("notification");
        }

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
            }));
        }, 4000);
    },

    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }));
    },

    clearAll: () => {
        set({ notifications: [] });
    },

    setNotificationsEnabled: (enabled) => {
        set({ notificationsEnabled: enabled });
    },
}));

// Import settings store to check notification setting
import { useSettingsStore } from "./settings";