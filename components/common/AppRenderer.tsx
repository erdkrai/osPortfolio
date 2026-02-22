import { AppId, useWindowStore } from "@/store/windows";
import { AboutApp } from "@/components/apps/AboutApp";
import { ProjectsApp } from "@/components/apps/ProjectsApp";
import { ContactApp } from "@/components/apps/ContactApp";
import { TerminalApp } from "@/components/apps/TerminalApp";
import { PreviewApp } from "@/components/apps/PreviewApp";
import { SettingsApp } from "@/components/apps/SettingsApp";
import { PhotosApp } from "@/components/apps/PhotosApp";
import { SnakeApp } from "@/components/apps/SnakeApp";
import { TetrisApp } from "@/components/apps/TetrisApp";
import { MinesweeperApp } from "@/components/apps/MinesweeperApp";
import { MusicApp } from "@/components/apps/MusicApp";

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
        case "contact":
            return <ContactApp />;
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
        case "snake":
            return <SnakeApp />;
        case "tetris":
            return <TetrisApp />;
        case "minesweeper":
            return <MinesweeperApp />;
        case "music":
            return <MusicApp />;
        default:
            return (
                <div className="flex items-center justify-center h-full text-white/40">
                    Unknown app
                </div>
            );
    }
}
