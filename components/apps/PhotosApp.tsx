"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { photos, getAlbums, PhotoItem } from "@/data/photos";

type View = "photos" | "favorites" | "albums" | "album-detail";

export function PhotosApp() {
    const [view, setView] = useState<View>("photos");
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
    const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [zoomLevel, setZoomLevel] = useState(1);
    const lightboxRef = useRef<HTMLDivElement>(null);

    const albums = useMemo(() => getAlbums(), []);

    // Filtered photos based on current view
    const currentPhotos = useMemo(() => {
        let list = photos;
        if (view === "favorites") list = photos.filter((p) => p.favorite);
        if (view === "album-detail" && selectedAlbum) list = photos.filter((p) => p.album === selectedAlbum);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    (p.album && p.album.toLowerCase().includes(q))
            );
        }
        return list;
    }, [view, selectedAlbum, searchQuery]);

    // Album cover: first photo of each album
    const albumCovers = useMemo(() => {
        const map: Record<string, PhotoItem> = {};
        for (const a of albums) {
            const cover = photos.find((p) => p.album === a);
            if (cover) map[a] = cover;
        }
        return map;
    }, [albums]);

    // Album counts
    const albumCounts = useMemo(() => {
        const map: Record<string, number> = {};
        for (const a of albums) {
            map[a] = photos.filter((p) => p.album === a).length;
        }
        return map;
    }, [albums]);

    const openLightbox = useCallback(
        (photo: PhotoItem) => {
            const idx = currentPhotos.findIndex((p) => p.id === photo.id);
            setLightboxPhoto(photo);
            setLightboxIndex(idx >= 0 ? idx : 0);
            setZoomLevel(1);
        },
        [currentPhotos]
    );

    const closeLightbox = useCallback(() => {
        setLightboxPhoto(null);
        setZoomLevel(1);
    }, []);

    const goNext = useCallback(() => {
        if (currentPhotos.length === 0) return;
        const next = (lightboxIndex + 1) % currentPhotos.length;
        setLightboxIndex(next);
        setLightboxPhoto(currentPhotos[next]);
        setZoomLevel(1);
    }, [lightboxIndex, currentPhotos]);

    const goPrev = useCallback(() => {
        if (currentPhotos.length === 0) return;
        const prev = (lightboxIndex - 1 + currentPhotos.length) % currentPhotos.length;
        setLightboxIndex(prev);
        setLightboxPhoto(currentPhotos[prev]);
        setZoomLevel(1);
    }, [lightboxIndex, currentPhotos]);

    // Keyboard nav in lightbox
    useEffect(() => {
        if (!lightboxPhoto) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "+" || e.key === "=") setZoomLevel((z) => Math.min(z + 0.25, 3));
            if (e.key === "-") setZoomLevel((z) => Math.max(z - 0.25, 0.5));
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [lightboxPhoto, closeLightbox, goNext, goPrev]);

    const openAlbum = useCallback((album: string) => {
        setSelectedAlbum(album);
        setView("album-detail");
    }, []);

    const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
        {
            id: "photos",
            label: "Photos",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                </svg>
            ),
        },
        {
            id: "favorites",
            label: "Favorites",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
            ),
        },
        {
            id: "albums",
            label: "Albums",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                </svg>
            ),
        },
    ];

    return (
        <div
            style={{
                display: "flex",
                height: "100%",
                background: "var(--window-bg)",
                color: "var(--text-primary)",
                fontFamily: "'Ubuntu', -apple-system, sans-serif",
                overflow: "hidden",
                borderRadius: "0 0 10px 10px",
            }}
        >
            {/* ---- Sidebar ---- */}
            <div
                style={{
                    width: 200,
                    minWidth: 200,
                    borderRight: "1px solid var(--border-color)",
                    display: "flex",
                    flexDirection: "column",
                    background: "var(--sidebar-bg, var(--window-bg))",
                    padding: "12px 0",
                }}
            >
                {/* Search */}
                <div style={{ padding: "0 12px 12px" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            background: "var(--border-color)",
                            borderRadius: 8,
                            padding: "6px 10px",
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search photos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                background: "transparent",
                                border: "none",
                                outline: "none",
                                color: "var(--text-primary)",
                                fontSize: 12,
                                width: "100%",
                                fontFamily: "inherit",
                            }}
                        />
                    </div>
                </div>

                {/* Nav items */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 8px" }}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setView(item.id);
                                setSelectedAlbum(null);
                            }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: view === item.id || (view === "album-detail" && item.id === "albums") ? 600 : 400,
                                color:
                                    view === item.id || (view === "album-detail" && item.id === "albums")
                                        ? "var(--text-primary)"
                                        : "var(--text-secondary)",
                                background:
                                    view === item.id || (view === "album-detail" && item.id === "albums")
                                        ? "var(--border-color)"
                                        : "transparent",
                                transition: "all 0.15s",
                                fontFamily: "inherit",
                                textAlign: "left",
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Albums list in sidebar */}
                {(view === "albums" || view === "album-detail") && (
                    <div style={{ marginTop: 16, padding: "0 8px" }}>
                        <div
                            style={{
                                fontSize: 10,
                                fontWeight: 600,
                                textTransform: "uppercase",
                                color: "var(--text-secondary)",
                                padding: "0 12px 6px",
                                letterSpacing: "0.8px",
                            }}
                        >
                            Albums
                        </div>
                        {albums.map((album) => (
                            <button
                                key={album}
                                onClick={() => openAlbum(album)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: selectedAlbum === album ? 600 : 400,
                                    color: selectedAlbum === album ? "var(--text-primary)" : "var(--text-secondary)",
                                    background: selectedAlbum === album ? "var(--border-color)" : "transparent",
                                    transition: "all 0.15s",
                                    fontFamily: "inherit",
                                    textAlign: "left",
                                }}
                            >
                                <span>{album}</span>
                                <span style={{ opacity: 0.5, fontSize: 11 }}>{albumCounts[album]}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Photo count */}
                <div
                    style={{
                        marginTop: "auto",
                        padding: "12px 20px",
                        fontSize: 11,
                        color: "var(--text-secondary)",
                        opacity: 0.7,
                    }}
                >
                    {photos.length} photos · {photos.filter((p) => p.type === "video").length} videos
                </div>
            </div>

            {/* ---- Main content ---- */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Header bar */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 16px",
                        borderBottom: "1px solid var(--border-color)",
                        minHeight: 44,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {view === "album-detail" && (
                            <button
                                onClick={() => {
                                    setView("albums");
                                    setSelectedAlbum(null);
                                }}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "var(--text-secondary)",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "4px 0",
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <h2
                            style={{
                                fontSize: 15,
                                fontWeight: 600,
                                margin: 0,
                            }}
                        >
                            {view === "album-detail" ? selectedAlbum : view === "favorites" ? "Favorites" : view === "albums" ? "Albums" : "All Photos"}
                        </h2>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)", marginLeft: 4 }}>
                            {view !== "albums" && `${currentPhotos.length} items`}
                        </span>
                    </div>
                </div>

                {/* Content area */}
                <div
                    style={{
                        flex: 1,
                        overflow: "auto",
                        padding: 16,
                    }}
                >
                    {view === "albums" && !selectedAlbum ? (
                        <AlbumsGrid albums={albums} albumCovers={albumCovers} albumCounts={albumCounts} onOpenAlbum={openAlbum} />
                    ) : (
                        <PhotoGrid photos={currentPhotos} onPhotoClick={openLightbox} />
                    )}

                    {currentPhotos.length === 0 && view !== "albums" && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                color: "var(--text-secondary)",
                                gap: 12,
                            }}
                        >
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="M21 15l-5-5L5 21" />
                            </svg>
                            <span style={{ fontSize: 14, opacity: 0.5 }}>No photos found</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ---- Lightbox ---- */}
            <AnimatePresence>
                {lightboxPhoto && (
                    <Lightbox
                        ref={lightboxRef}
                        photo={lightboxPhoto}
                        index={lightboxIndex}
                        total={currentPhotos.length}
                        zoom={zoomLevel}
                        onClose={closeLightbox}
                        onNext={goNext}
                        onPrev={goPrev}
                        onZoomIn={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                        onZoomOut={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                        onZoomReset={() => setZoomLevel(1)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ---- Photo grid ----
function PhotoGrid({ photos, onPhotoClick }: { photos: PhotoItem[]; onPhotoClick: (p: PhotoItem) => void }) {
    // Group photos by month
    const grouped = useMemo(() => {
        const map = new Map<string, PhotoItem[]>();
        const sorted = [...photos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        for (const p of sorted) {
            const d = new Date(p.date);
            const key = `${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()}`;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(p);
        }
        return map;
    }, [photos]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {Array.from(grouped.entries()).map(([month, items]) => (
                <div key={month}>
                    <h3
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--text-secondary)",
                            margin: "0 0 10px",
                            fontFamily: "'Ubuntu', -apple-system, sans-serif",
                        }}
                    >
                        {month}
                    </h3>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                            gap: 6,
                        }}
                    >
                        {items.map((photo) => (
                            <PhotoThumbnail key={photo.id} photo={photo} onClick={() => onPhotoClick(photo)} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ---- Single thumbnail ----
function PhotoThumbnail({ photo, onClick }: { photo: PhotoItem; onClick: () => void }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: 6,
                overflow: "hidden",
                border: "none",
                cursor: "pointer",
                background: "var(--border-color)",
                padding: 0,
            }}
        >
            <img
                src={photo.thumb || photo.src}
                alt={photo.title}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: loaded ? 1 : 0,
                    transition: "opacity 0.3s",
                }}
            />
            {/* Video indicator */}
            {photo.type === "video" && (
                <div
                    style={{
                        position: "absolute",
                        bottom: 6,
                        right: 6,
                        background: "rgba(0,0,0,0.6)",
                        borderRadius: 4,
                        padding: "2px 6px",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                    }}
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            )}
            {/* Favorite indicator */}
            {photo.favorite && (
                <div
                    style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#E95420" stroke="none">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                </div>
            )}
        </motion.button>
    );
}

// ---- Albums grid ----
function AlbumsGrid({
    albums,
    albumCovers,
    albumCounts,
    onOpenAlbum,
}: {
    albums: string[];
    albumCovers: Record<string, PhotoItem>;
    albumCounts: Record<string, number>;
    onOpenAlbum: (album: string) => void;
}) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 16,
            }}
        >
            {albums.map((album) => (
                <motion.button
                    key={album}
                    onClick={() => onOpenAlbum(album)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        textAlign: "left",
                    }}
                >
                    <div
                        style={{
                            aspectRatio: "4/3",
                            borderRadius: 10,
                            overflow: "hidden",
                            background: "var(--border-color)",
                        }}
                    >
                        {albumCovers[album] && (
                            <img
                                src={albumCovers[album].thumb || albumCovers[album].src}
                                alt={album}
                                loading="lazy"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        )}
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--text-primary)",
                                fontFamily: "'Ubuntu', -apple-system, sans-serif",
                            }}
                        >
                            {album}
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "var(--text-secondary)",
                                fontFamily: "'Ubuntu', -apple-system, sans-serif",
                            }}
                        >
                            {albumCounts[album]} photos
                        </div>
                    </div>
                </motion.button>
            ))}
        </div>
    );
}

// ---- Lightbox ----
import { forwardRef } from "react";

interface LightboxProps {
    photo: PhotoItem;
    index: number;
    total: number;
    zoom: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
}

const Lightbox = forwardRef<HTMLDivElement, LightboxProps>(function Lightbox(
    { photo, index, total, zoom, onClose, onNext, onPrev, onZoomIn, onZoomOut, onZoomReset },
    ref
) {
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.92)",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                borderRadius: "0 0 10px 10px",
                overflow: "hidden",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Top bar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    minHeight: 44,
                    flexShrink: 0,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            color: "white",
                            padding: "6px 8px",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span style={{ color: "white", fontSize: 13, fontWeight: 500 }}>{photo.title}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                        {index + 1} / {total}
                    </span>
                </div>

                {/* Zoom controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <LightboxButton onClick={onZoomOut} title="Zoom out">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35M8 11h6" />
                        </svg>
                    </LightboxButton>
                    <button
                        onClick={onZoomReset}
                        style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "none",
                            borderRadius: 4,
                            color: "rgba(255,255,255,0.6)",
                            fontSize: 11,
                            padding: "4px 8px",
                            cursor: "pointer",
                            minWidth: 42,
                            fontFamily: "'Ubuntu', monospace",
                        }}
                    >
                        {Math.round(zoom * 100)}%
                    </button>
                    <LightboxButton onClick={onZoomIn} title="Zoom in">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
                        </svg>
                    </LightboxButton>
                </div>
            </div>

            {/* Image area */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    padding: "0 48px",
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                {/* Prev button */}
                {total > 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPrev();
                        }}
                        style={{
                            position: "absolute",
                            left: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "rgba(255,255,255,0.1)",
                            border: "none",
                            borderRadius: "50%",
                            width: 36,
                            height: 36,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            zIndex: 2,
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {photo.type === "video" ? (
                            <video
                                src={photo.src}
                                controls
                                autoPlay
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "calc(100vh - 200px)",
                                    borderRadius: 4,
                                    transform: `scale(${zoom})`,
                                    transition: "transform 0.2s",
                                }}
                            />
                        ) : (
                            <img
                                src={photo.src}
                                alt={photo.title}
                                draggable={false}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "calc(100vh - 200px)",
                                    borderRadius: 4,
                                    transform: `scale(${zoom})`,
                                    transition: "transform 0.2s",
                                    objectFit: "contain",
                                    userSelect: "none",
                                }}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Next button */}
                {total > 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onNext();
                        }}
                        style={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "rgba(255,255,255,0.1)",
                            border: "none",
                            borderRadius: "50%",
                            width: 36,
                            height: 36,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            zIndex: 2,
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Bottom info bar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px 16px",
                    gap: 16,
                    flexShrink: 0,
                }}
            >
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                    {new Date(photo.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </span>
                {photo.album && (
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
                        {photo.album}
                    </span>
                )}
            </div>
        </motion.div>
    );
});

// ---- Lightbox helper button ----
function LightboxButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
    return (
        <button
            onClick={onClick}
            title={title}
            style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                color: "white",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
        >
            {children}
        </button>
    );
}
