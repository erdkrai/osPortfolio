import { AppId, useWindowStore } from "@/store/windows";
import { AboutApp } from "@/components/apps/AboutApp";
import { ProjectsApp } from "@/components/apps/ProjectsApp";
import { TerminalApp } from "@/components/apps/TerminalApp";
import { PreviewApp } from "@/components/apps/PreviewApp";
import { SettingsApp } from "@/components/apps/SettingsApp";
import { PhotosApp } from "@/components/apps/PhotosApp";
import { GamesApp } from "@/components/apps/GamesApp";
import { SnakeApp } from "@/components/apps/SnakeApp";
import { TetrisApp } from "@/components/apps/TetrisApp";
import { MinesweeperApp } from "@/components/apps/MinesweeperApp";
import { MusicApp } from "@/components/apps/MusicApp";
import { KeyboardShortcutsApp } from "@/components/apps/KeyboardShortcutsApp";

interface AppRendererProps {
    appId: AppId;
    windowId: string;
}

export function AppRenderer({ appId, windowId }: AppRendererProps) {
    switch (appId) {
        case "about":
            return <AboutApp />;
        case "projects":
            return <ProjectsApp />;

        case "terminal":
            return <TerminalApp />;
        case "preview":
            return <PreviewApp windowId={windowId} />;
        case "settings": {
            const win = useWindowStore.getState().windows.find(w => w.windowId === windowId);
            return <SettingsApp initialTab={win?.initialData?.tab as string | undefined} />;
        }
        case "photos":
            return <PhotosApp />;
        case "games":
            return <GamesApp />;
        case "snake":
            return <SnakeApp />;
        case "tetris":
            return <TetrisApp />;
        case "minesweeper":
            return <MinesweeperApp />;
        case "music":
            return <MusicApp />;
        case "shortcuts":
            return <KeyboardShortcutsApp />;
        default:
            return (
                <div className="flex items-center justify-center h-full text-white/40">
                    Unknown app
                </div>
            );
    }
}
