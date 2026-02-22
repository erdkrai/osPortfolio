export interface PhotoItem {
    id: string;
    src: string;
    thumb?: string; // optional thumbnail — falls back to src
    title: string;
    date: string; // ISO date string
    type: "image" | "video";
    album?: string;
    favorite?: boolean;
    width?: number;
    height?: number;
}

// Sample photo collection — replace with your own images/videos
export const photos: PhotoItem[] = [
    {
        id: "1",
        src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200",
        thumb: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
        title: "Mountain Lake",
        date: "2025-12-15",
        type: "image",
        album: "Nature",
        favorite: true,
        width: 1200,
        height: 800,
    },
    {
        id: "2",
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200",
        thumb: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
        title: "Sunlit Valley",
        date: "2025-11-20",
        type: "image",
        album: "Nature",
        favorite: false,
        width: 1200,
        height: 800,
    },
    {
        id: "3",
        src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200",
        thumb: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400",
        title: "Starry Mountains",
        date: "2025-10-05",
        type: "image",
        album: "Nature",
        favorite: true,
        width: 1200,
        height: 800,
    },
    {
        id: "4",
        src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200",
        thumb: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
        title: "Coding Setup",
        date: "2025-09-12",
        type: "image",
        album: "Work",
        favorite: false,
        width: 1200,
        height: 800,
    },
    {
        id: "5",
        src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200",
        thumb: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
        title: "Code on Screen",
        date: "2025-08-25",
        type: "image",
        album: "Work",
        favorite: true,
        width: 1200,
        height: 800,
    },
    {
        id: "6",
        src: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200",
        thumb: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400",
        title: "Tech Aesthetic",
        date: "2025-07-18",
        type: "image",
        album: "Work",
        favorite: false,
        width: 1200,
        height: 800,
    },
    {
        id: "7",
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200",
        thumb: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        title: "Portrait",
        date: "2025-06-10",
        type: "image",
        album: "People",
        favorite: false,
        width: 800,
        height: 1200,
    },
    {
        id: "8",
        src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200",
        thumb: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400",
        title: "Aerial Forest",
        date: "2025-05-22",
        type: "image",
        album: "Nature",
        favorite: true,
        width: 1200,
        height: 800,
    },
    {
        id: "9",
        src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200",
        thumb: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400",
        title: "Foggy Forest",
        date: "2025-04-08",
        type: "image",
        album: "Nature",
        favorite: false,
        width: 1200,
        height: 800,
    },
    {
        id: "10",
        src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200",
        thumb: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400",
        title: "Office Space",
        date: "2025-03-14",
        type: "image",
        album: "Work",
        favorite: false,
        width: 1200,
        height: 800,
    },
    {
        id: "11",
        src: "https://images.unsplash.com/photo-1542091708228-04ea5b040640?w=1200",
        thumb: "https://images.unsplash.com/photo-1542091708228-04ea5b040640?w=400",
        title: "City Lights",
        date: "2025-02-28",
        type: "image",
        album: "Travel",
        favorite: true,
        width: 1200,
        height: 800,
    },
    {
        id: "12",
        src: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200",
        thumb: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400",
        title: "Beach Sunset",
        date: "2025-01-16",
        type: "image",
        album: "Travel",
        favorite: false,
        width: 1200,
        height: 800,
    },
];

// Derive unique albums from data
export function getAlbums(): string[] {
    const albums = new Set(photos.map((p) => p.album).filter(Boolean) as string[]);
    return Array.from(albums).sort();
}
