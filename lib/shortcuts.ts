/**
 * Ubuntu-style keyboard shortcuts definition & registry.
 *
 * Each shortcut stores both macOS and Windows/Linux key labels.
 * "Super" maps to ⌘ Cmd on macOS and ⊞ Win on Windows/Linux.
 * The `useKeyboardShortcuts` hook handles the actual key events.
 */

export interface Shortcut {
    /** Human-readable label shown in the Shortcuts app */
    label: string;
    /** Category for grouping */
    category: "System" | "Navigation" | "Windows" | "Apps";
    /** Keys for macOS display, e.g. ["⌘", "A"] */
    macKeys: string[];
    /** Keys for Windows/Linux display, e.g. ["Win", "A"] */
    winKeys: string[];
    /** Internal action id — matched in the handler */
    action: string;
}

/** Detect if the user is on macOS */
export function getIsMac(): boolean {
    if (typeof navigator === "undefined") return false;
    return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Get the display keys for the current platform */
export function getPlatformKeys(shortcut: Shortcut): string[] {
    return getIsMac() ? shortcut.macKeys : shortcut.winKeys;
}

export const SHORTCUTS: Shortcut[] = [
    // ── System ──
    { label: "Activities overview",       category: "System",     macKeys: ["⌥", "1"],          winKeys: ["Alt", "1"],            action: "activities" },
    { label: "Show Applications",         category: "System",     macKeys: ["⌥", "2"],          winKeys: ["Alt", "2"],            action: "show-apps" },
    { label: "Lock Screen",               category: "System",     macKeys: ["⌘", "L"],          winKeys: ["Super", "L"],          action: "lock-screen" },
    { label: "Show Desktop (minimize all)", category: "System",   macKeys: ["⌘", "D"],          winKeys: ["Super", "D"],          action: "show-desktop" },
    { label: "Keyboard Shortcuts",        category: "System",     macKeys: ["⌘", "K"],          winKeys: ["Super", "K"],          action: "open-shortcuts" },
    { label: "Settings",                  category: "System",     macKeys: ["⌘", "I"],          winKeys: ["Super", "I"],          action: "open-settings" },

    // ── Windows ──
    { label: "Close window",              category: "Windows",    macKeys: ["⌘", "Q"],          winKeys: ["Ctrl", "Q"],           action: "close-window" },
    { label: "Maximize / Restore window", category: "Windows",    macKeys: ["⌘", "↑"],          winKeys: ["Super", "↑"],          action: "maximize-window" },
    { label: "Restore / Unmaximize",      category: "Windows",    macKeys: ["⌘", "↓"],          winKeys: ["Super", "↓"],          action: "restore-window" },
    { label: "Snap window left",          category: "Windows",    macKeys: ["⌘", "←"],          winKeys: ["Super", "←"],          action: "snap-left" },
    { label: "Snap window right",         category: "Windows",    macKeys: ["⌘", "→"],          winKeys: ["Super", "→"],          action: "snap-right" },
    { label: "Minimize window",           category: "Windows",    macKeys: ["⌘", "H"],          winKeys: ["Super", "H"],          action: "minimize-window" },

    // ── Apps ──
    { label: "Open Terminal",             category: "Apps",       macKeys: ["⌃", "⌥", "T"],    winKeys: ["Ctrl", "Alt", "T"],    action: "open-terminal" },
    { label: "About Me",                  category: "Apps",       macKeys: ["⌃", "⌥", "A"],    winKeys: ["Ctrl", "Alt", "A"],    action: "open-about" },
    { label: "Projects",                  category: "Apps",       macKeys: ["⌃", "⌥", "P"],    winKeys: ["Ctrl", "Alt", "P"],    action: "open-projects" },
    { label: "Photos",                    category: "Apps",       macKeys: ["⌃", "⌥", "E"],    winKeys: ["Ctrl", "Alt", "E"],    action: "open-photos" },
    { label: "Games",                     category: "Apps",       macKeys: ["⌃", "⌥", "G"],    winKeys: ["Ctrl", "Alt", "G"],    action: "open-games" },
    { label: "Music Player",              category: "Apps",       macKeys: ["⌃", "⌥", "M"],    winKeys: ["Ctrl", "Alt", "M"],    action: "open-music" },
    { label: "Resume",                    category: "Apps",       macKeys: ["⌃", "⌥", "R"],    winKeys: ["Ctrl", "Alt", "R"],    action: "open-resume" },

    // ── Navigation ──
    { label: "Switch to next window",     category: "Navigation", macKeys: ["⌥", "Tab"],       winKeys: ["Alt", "Tab"],          action: "switch-window" },
    { label: "Full screen (browser)",     category: "Navigation", macKeys: ["⌃", "⌘", "F"],    winKeys: ["F11"],                 action: "fullscreen" },
];

