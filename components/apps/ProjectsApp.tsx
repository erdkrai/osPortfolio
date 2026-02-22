"use client";

import { useState, useRef, useEffect } from "react";
import { projects, Project, CaseStudyBlock } from "@/data/projects";
import { Badge } from "@/components/common/Badge";

/* ── Case Study Block Renderer ────────────────────────────────── */

function CaseStudyRenderer({ blocks }: { blocks: CaseStudyBlock[] }) {
    return (
        <div className="space-y-4">
            {blocks.map((block, i) => {
                switch (block.type) {
                    case "heading":
                        return (
                            <h3
                                key={i}
                                className="text-base font-bold pt-2 first:pt-0"
                                style={{ color: "var(--text-heading)", borderBottom: "1px solid var(--border-color)", paddingBottom: 6 }}
                            >
                                {block.text}
                            </h3>
                        );
                    case "text":
                        return (
                            <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                {block.text}
                            </p>
                        );
                    case "image":
                        return (
                            <figure key={i} className="space-y-1.5">
                                <img
                                    src={block.src}
                                    alt={block.alt || ""}
                                    className="w-full rounded-lg object-cover"
                                    style={{ maxHeight: 320, border: "1px solid var(--border-color)" }}
                                />
                                {block.caption && (
                                    <figcaption className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                                        {block.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );
                    case "video":
                        return (
                            <figure key={i} className="space-y-1.5">
                                <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: "56.25%", background: "#000" }}>
                                    <iframe
                                        src={block.src}
                                        className="absolute inset-0 w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                                {block.caption && (
                                    <figcaption className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                                        {block.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );
                    case "list":
                        return (
                            <ul key={i} className="space-y-1.5 pl-1">
                                {block.items.map((item, j) => (
                                    <li key={j} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                                        <span className="shrink-0 mt-0.5" style={{ color: "var(--accent-color)" }}>•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        );
                    case "quote":
                        return (
                            <blockquote
                                key={i}
                                className="pl-4 py-2 text-sm italic"
                                style={{
                                    borderLeft: "3px solid var(--accent-color)",
                                    color: "var(--text-secondary)",
                                    background: "var(--accent-muted)",
                                    borderRadius: "0 8px 8px 0",
                                }}
                            >
                                &ldquo;{block.text}&rdquo;
                                {block.author && (
                                    <span className="block mt-1 text-xs not-italic" style={{ color: "var(--text-muted)" }}>
                                        — {block.author}
                                    </span>
                                )}
                            </blockquote>
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
}

/* ── Sidebar Item ─────────────────────────────────────────────── */

function SidebarItem({
    project,
    active,
    onClick,
}: {
    project: Project;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 focus:outline-none"
            style={{
                background: active ? "var(--accent-subtle)" : "transparent",
                borderLeft: active ? "3px solid var(--accent-color)" : "3px solid transparent",
            }}
            onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "var(--hover-bg)";
            }}
            onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
        >
            <div className="flex items-center justify-between gap-2">
                <span
                    className="text-sm font-medium truncate"
                    style={{ color: active ? "var(--accent-color)" : "var(--text-primary)" }}
                >
                    {project.title.split("—")[0].trim()}
                </span>
                {project.year && (
                    <span className="text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>
                        {project.year}
                    </span>
                )}
            </div>
            <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                {project.role || project.tags.join(" · ")}
            </p>
        </button>
    );
}

/* ── Main Content Panel ───────────────────────────────────────── */

function ProjectContent({ project }: { project: Project }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, 0);
    }, [project.id]);

    return (
        <div ref={scrollRef} className="h-full overflow-y-auto px-6 py-5 space-y-5" style={{ color: "var(--text-primary)" }}>
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold leading-tight" style={{ color: "var(--text-heading)" }}>{project.title}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                    {project.role && (
                        <span className="text-sm" style={{ color: "var(--accent-color)" }}>{project.role}</span>
                    )}
                    {project.year && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{project.year}</span>
                    )}
                </div>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {project.description}
                </p>
            </div>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                    <Badge key={tech} label={tech} variant="accent" />
                ))}
            </div>

            {/* Case Study */}
            {project.caseStudy && project.caseStudy.length > 0 && (
                <div
                    className="pt-4"
                    style={{ borderTop: "1px solid var(--border-color)" }}
                >
                    <CaseStudyRenderer blocks={project.caseStudy} />
                </div>
            )}

            {/* Highlights (fallback if no case study) */}
            {(!project.caseStudy || project.caseStudy.length === 0) && project.highlights.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                        Highlights
                    </h3>
                    <ul className="space-y-1.5">
                        {project.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                                <span className="shrink-0 mt-0.5" style={{ color: "var(--accent-color)" }}>→</span>
                                {h}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Tags */}
            {project.tags.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                        Tags
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => <Badge key={tag} label={tag} variant="green" />)}
                    </div>
                </div>
            )}

            {/* Links */}
            {project.links.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                        Links
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {project.links.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg text-sm transition-all duration-150 focus:outline-none"
                                style={{
                                    background: "var(--accent-muted)",
                                    color: "var(--accent-color)",
                                    border: "1px solid var(--accent-subtle)",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = "var(--accent-subtle)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = "var(--accent-muted)";
                                }}
                            >
                                ↗ {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Projects App (GNOME Sidebar Layout) ──────────────────────── */

export function ProjectsApp() {
    const [selected, setSelected] = useState<Project>(projects[0]);

    return (
        <div className="h-full flex" style={{ color: "var(--text-primary)" }}>
            {/* Sidebar */}
            <div
                className="shrink-0 h-full overflow-y-auto flex flex-col gap-0.5 py-3 px-2"
                style={{
                    width: 220,
                    background: "var(--sidebar-bg)",
                    borderRight: "1px solid var(--border-color)",
                }}
            >
                <div
                    className="px-3 pb-2 mb-1 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}
                >
                    Projects
                </div>
                {projects.map((project) => (
                    <SidebarItem
                        key={project.id}
                        project={project}
                        active={selected.id === project.id}
                        onClick={() => setSelected(project)}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <ProjectContent project={selected} />
            </div>
        </div>
    );
}
