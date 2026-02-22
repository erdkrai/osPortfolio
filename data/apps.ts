import { AppId } from "@/store/windows";

export type AppConfig = {
    appId: AppId;
    title: string;
    icon: string;
    defaultSize: { w: number; h: number };
};

export const APPS: AppConfig[] = [
    { appId: "about", title: "About Me", icon: "about", defaultSize: { w: 560, h: 500 } },
    { appId: "projects", title: "Projects", icon: "projects", defaultSize: { w: 900, h: 620 } },
    { appId: "resume", title: "Resume", icon: "resume", defaultSize: { w: 800, h: 640 } },
    { appId: "terminal", title: "Terminal", icon: "terminal", defaultSize: { w: 720, h: 480 } },
    { appId: "settings", title: "Settings", icon: "settings", defaultSize: { w: 900, h: 600 } },
    { appId: "photos", title: "Photos", icon: "photos", defaultSize: { w: 900, h: 640 } },
    { appId: "games", title: "Games", icon: "games", defaultSize: { w: 740, h: 520 } },
    { appId: "music", title: "Music", icon: "music", defaultSize: { w: 580, h: 640 } },
    { appId: "shortcuts", title: "Keyboard Shortcuts", icon: "shortcuts", defaultSize: { w: 680, h: 560 } },
];
