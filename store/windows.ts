import { create } from "zustand";
import { playSound } from "@/lib/sound";
import { useSettingsStore } from "./settings";

export type AppId = "about" | "projects" | "resume" | "contact" | "terminal" | "preview" | "settings" | "photos" | "snake" | "tetris" | "minesweeper" | "music";

export type SnapZone =
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface PreviewData {
  type: "image" | "video" | "pdf";
  url: string;
}

export interface WindowInstance {
  windowId: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  snapZone: SnapZone | null;
  previewData?: PreviewData; // For media preview app
  initialData?: Record<string, unknown>; // Extra data passed to the app
  // saved position/size before snapping, for restore
  savedX: number;
  savedY: number;
  savedW: number;
  savedH: number;
  originRect?: { x: number; y: number; w: number; h: number };
  dockRect?: { x: number; y: number; w: number; h: number }; // Target for minimize/restore animations
  disableMinimize?: boolean;
  disableResize?: boolean;
}

interface WindowStore {
  windows: WindowInstance[];
  activeWindowId: string | null;
  zCounter: number;
  dragSnapPreview: SnapZone | null;

  openWindow: (params: {
    appId: AppId;
    title: string;
    defaultSize: { w: number; h: number };
    previewData?: PreviewData;
    initialData?: Record<string, unknown>;
    originRect?: { x: number; y: number; w: number; h: number };
    dockRect?: { x: number; y: number; w: number; h: number };
  }) => void;
  openMediaPreview: (data: PreviewData & { title: string; originRect?: { x: number; y: number; w: number; h: number } }) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string, dockRect?: { x: number; y: number; w: number; h: number }) => void;
  focusWindow: (windowId: string, originRect?: { x: number; y: number; w: number; h: number }) => void;
  moveWindow: (windowId: string, x: number, y: number) => void;
  resizeWindow: (windowId: string, x: number, y: number, w: number, h: number) => void;
  toggleMaximize: (windowId: string) => void;
  snapWindow: (windowId: string, zone: SnapZone) => void;
  unsnapWindow: (windowId: string) => void;
  setDragSnapPreview: (zone: SnapZone | null) => void;
  closeActiveWindow: () => void;
}

let openCount = 0;

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  zCounter: 10,
  dragSnapPreview: null,

  openWindow: (params) => {
    const { appId, title, defaultSize, previewData, initialData, originRect, dockRect } = params;
    const { windows, zCounter, openMediaPreview } = get();

    // Play sound on new window open
    const soundEffects = useSettingsStore.getState().soundEffects;

    // Redirection Logic: Always open resume in direct preview mode
    if (appId === "resume") {
      openMediaPreview({
        title: "Resume.pdf",
        url: "/resume.pdf",
        type: "pdf",
        originRect: originRect || dockRect
      });
      return;
    }

    // If window of this appId already open (and not preview), just focus it
    if (appId !== "preview") {
      const existing = windows.find((w) => w.appId === appId);
      if (existing) {
        set((s) => ({
          windows: s.windows.map((w) =>
            w.windowId === existing.windowId
              ? {
                ...w,
                minimized: false,
                z: s.zCounter + 1,
                originRect: originRect || w.originRect,
                dockRect: dockRect || w.dockRect,
                ...(initialData ? { initialData } : {}),
              }
              : w
          ),
          activeWindowId: existing.windowId,
          zCounter: s.zCounter + 1,
        }));
        return;
      }
    }

    openCount += 1;
    const offset = (openCount % 6) * 30;
    const viewW = typeof window !== "undefined" ? window.innerWidth : 1280;
    const viewH = typeof window !== "undefined" ? window.innerHeight : 800;

    const x = Math.max(
      0,
      Math.min(
        Math.round((viewW - defaultSize.w) / 2) + offset,
        viewW - defaultSize.w - 20
      )
    );
    const y = Math.max(
      0,
      Math.min(
        Math.round((viewH - defaultSize.h) / 2) - 40 + offset,
        viewH - defaultSize.h - 80
      )
    );

    const newWindow: WindowInstance = {
      windowId: `${appId}-${Date.now()}`,
      appId,
      title,
      x,
      y,
      w: defaultSize.w,
      h: defaultSize.h,
      z: zCounter + 1,
      minimized: false,
      maximized: false,
      snapZone: null,
      previewData,
      initialData,
      savedX: x,
      savedY: y,
      savedW: defaultSize.w,
      savedH: defaultSize.h,
      originRect,
      dockRect,
      disableMinimize: appId === "snake" || appId === "tetris" || appId === "minesweeper",
      disableResize: appId === "snake" || appId === "tetris" || appId === "minesweeper",
    };

    set((s) => ({
      windows: [...s.windows, newWindow],
      activeWindowId: newWindow.windowId,
      zCounter: s.zCounter + 1,
    }));

    // Play open sound
    if (soundEffects) playSound("open");
  },

  openMediaPreview: ({ title, url, type, originRect }) => {
    const { openWindow } = get();
    // Open specialized preview window
    openWindow({
      appId: "preview",
      title,
      defaultSize: type === "pdf" ? { w: 900, h: 700 } : { w: 800, h: 500 },
      previewData: { url, type },
      originRect,
    });
  },

  closeWindow: (windowId) => {
    const soundEffects = useSettingsStore.getState().soundEffects;
    set((s) => {
      const remaining = s.windows.filter((w) => w.windowId !== windowId);
      const topWindow =
        remaining.length > 0
          ? remaining.reduce((a, b) => (a.z > b.z ? a : b))
          : null;
      return {
        windows: remaining,
        activeWindowId: topWindow ? topWindow.windowId : null,
      };
    });
    if (soundEffects) playSound("close");
  },

  minimizeWindow: (windowId) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.windowId === windowId ? { ...w, minimized: true } : w
      ),
      activeWindowId:
        s.activeWindowId === windowId ? null : s.activeWindowId,
    }));
  },

  restoreWindow: (windowId, dockRect) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.windowId === windowId
          ? {
            ...w,
            minimized: false,
            z: s.zCounter + 1,
            dockRect: dockRect || w.dockRect,
            originRect: dockRect || w.originRect // If restored from dock, update origin so it closes back to dock
          }
          : w
      ),
      activeWindowId: windowId,
      zCounter: s.zCounter + 1,
    }));
  },

  focusWindow: (windowId, originRect) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.windowId === windowId
          ? { ...w, z: s.zCounter + 1, originRect: originRect || w.originRect }
          : w
      ),
      activeWindowId: windowId,
      zCounter: s.zCounter + 1,
    }));
  },

  moveWindow: (windowId, x, y) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.windowId === windowId ? { ...w, x, y } : w
      ),
    }));
  },

  resizeWindow: (windowId, x, y, w, h) => {
    set((s) => ({
      windows: s.windows.map((win) =>
        win.windowId === windowId ? { ...win, x, y, w, h } : win
      ),
    }));
  },

  toggleMaximize: (windowId) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.windowId === windowId
          ? {
            ...w,
            maximized: !w.maximized,
            minimized: false,
            snapZone: null, // clear snap when maximizing
            z: s.zCounter + 1,
          }
          : w
      ),
      activeWindowId: windowId,
      zCounter: s.zCounter + 1,
    }));
  },

  snapWindow: (windowId, zone) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.windowId === windowId
          ? {
            ...w,
            snapZone: zone,
            maximized: false,
            minimized: false,
            z: s.zCounter + 1,
            // save current floating position for restore
            savedX: w.snapZone ? w.savedX : w.x,
            savedY: w.snapZone ? w.savedY : w.y,
            savedW: w.snapZone ? w.savedW : w.w,
            savedH: w.snapZone ? w.savedH : w.h,
          }
          : w
      ),
      activeWindowId: windowId,
      zCounter: s.zCounter + 1,
    }));
  },

  unsnapWindow: (windowId) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.windowId === windowId
          ? {
            ...w,
            snapZone: null,
            x: w.savedX,
            y: w.savedY,
            w: w.savedW,
            h: w.savedH,
            z: s.zCounter + 1,
          }
          : w
      ),
      activeWindowId: windowId,
      zCounter: s.zCounter + 1,
    }));
  },

  setDragSnapPreview: (zone) => {
    set({ dragSnapPreview: zone });
  },

  closeActiveWindow: () => {
    const { activeWindowId, closeWindow } = get();
    if (activeWindowId) closeWindow(activeWindowId);
  },
}));
