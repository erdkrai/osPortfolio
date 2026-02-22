"use client";

import { useState } from "react";
import { projects, projectTags, Project } from "@/data/projects";
import { Badge } from "@/components/common/Badge";
import { clsx } from "clsx";
import { useWindowStore } from "@/store/windows";

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left p-4 rounded-lg transition-all duration-150 group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
            style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-orange-400 transition-colors">
                    {project.title}
                </h3>
                {project.year && (
                    <span className="text-xs shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>{project.year}</span>
                )}
            </div>
            <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                {project.description}
            </p>
            <div className="flex flex-wrap gap-1">
                {project.stack.slice(0, 4).map((tech) => (
                    <Badge key={tech} label={tech} variant="default" />
                ))}
                {project.stack.length > 4 && <Badge label={`+${project.stack.length - 4}`} variant="default" />}
            </div>
        </button>
    );
}

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
    return (
        <div className="h-full overflow-y-auto px-6 py-5 space-y-5" style={{ color: "#e0e0e0" }}>
            <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-sm transition-colors focus:outline-none"
                style={{ color: "rgba(255,255,255,0.45)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "white"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Projects
            </button>

            <div>
                <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-bold text-white">{project.title}</h2>
                    {project.year && <span className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{project.year}</span>}
                </div>
                {project.role && <p className="text-sm mt-0.5" style={{ color: "#E95420" }}>{project.role}</p>}
            </div>

            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.68)" }}>{project.description}</p>

            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Highlights</h3>
                <ul className="space-y-1.5">
                    {project.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "rgba(255,255,255,0.68)" }}>
                            <span className="shrink-0 mt-0.5" style={{ color: "#E95420" }}>→</span>
                            {h}
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Tech Stack</h3>
                <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => <Badge key={tech} label={tech} variant="accent" />)}
                </div>
            </div>

            {project.tags.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => <Badge key={tag} label={tag} variant="green" />)}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Links</h3>
                <div className="flex flex-wrap gap-2">
                    {project.links.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-sm transition-all duration-150 focus:outline-none"
                            style={{ background: "rgba(233,84,32,0.12)", color: "#E95420", border: "1px solid rgba(233,84,32,0.25)" }}
                        >
                            ↗ {link.label}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ProjectsApp() {
    const [activeTag, setActiveTag] = useState("All");
    const [selected, setSelected] = useState<Project | null>(null);

    const filtered = activeTag === "All" ? projects : projects.filter((p) => p.tags.includes(activeTag));

    if (selected) return <ProjectDetail project={selected} onBack={() => setSelected(null)} />;

    return (
        <div className="h-full flex flex-col" style={{ color: "#e0e0e0" }}>
            {/* Filter chips */}
            <div
                className="px-5 py-3 flex items-center gap-2 overflow-x-auto shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
                {projectTags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className={clsx(
                            "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 focus:outline-none"
                        )}
                        style={
                            activeTag === tag
                                ? { background: "rgba(233,84,32,0.2)", color: "#E95420", border: "1px solid rgba(233,84,32,0.35)" }
                                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid transparent" }
                        }
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Project cards */}
            <div className="flex-1 overflow-y-auto px-5 py-4 grid gap-3">
                {filtered.map((project) => (
                    <ProjectCard key={project.id} project={project} onClick={() => setSelected(project)} />
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                        No projects with tag &quot;{activeTag}&quot;
                    </div>
                )}
            </div>
        </div>
    );
}
