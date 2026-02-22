"use client";

import { useState } from "react";
import { profile } from "@/data/profile";
import { Badge } from "@/components/common/Badge";
import { motion, AnimatePresence } from "framer-motion";

type Section = "about" | "experience" | "skills" | "education";

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
    {
        id: "about",
        label: "About",
        icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
        ),
    },
    {
        id: "experience",
        label: "Experience",
        icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
            </svg>
        ),
    },
    {
        id: "skills",
        label: "Skills",
        icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
            </svg>
        ),
    },
    {
        id: "education",
        label: "Education",
        icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
            </svg>
        ),
    },
];

function SocialIcon({ icon }: { icon?: string }) {
    const icons: Record<string, React.ReactNode> = {
        github: (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
        ),
        linkedin: (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
        twitter: (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
        email: (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
        ),
    };
    return <>{icons[icon || ""] || null}</>;
}

/* ── GNOME-style row components ── */
function GnomeGroup({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <div className="mb-5">
            {title && (
                <h3
                    className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1"
                    style={{ color: "var(--text-muted)" }}
                >
                    {title}
                </h3>
            )}
            <div className="rounded-xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                {children}
            </div>
        </div>
    );
}

function GnomeRow({ label, value, href, last }: { label: string; value: string; href?: string; last?: boolean }) {
    const content = (
        <div
            className="flex items-center justify-between px-4 py-3 text-sm"
            style={!last ? { borderBottom: "1px solid var(--border-color)" } : {}}
        >
            <span style={{ color: "var(--text-secondary)" }}>{label}</span>
            <span className="text-right font-medium" style={{ color: href ? "var(--accent-color)" : "var(--text-primary)" }}>
                {value}
                {href && (
                    <svg className="w-3 h-3 inline-block ml-1 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                )}
            </span>
        </div>
    );

    if (href) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors"
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--hover-bg)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
                {content}
            </a>
        );
    }
    return content;
}

/* ── Section panels ── */
function AboutSection() {
    return (
        <div>
            {/* Hero card */}
            <div className="flex flex-col items-center text-center mb-6 pt-2">
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3 shadow-lg"
                    style={{ background: `linear-gradient(135deg, var(--accent-color), #77216F)` }}
                >
                    {profile.name.charAt(0)}
                </div>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-heading)" }}>{profile.name}</h2>
                <p className="text-sm font-medium mt-0.5" style={{ color: "var(--accent-color)" }}>
                    {profile.title}
                </p>
                <div className="flex items-center gap-1 mt-1.5" style={{ color: "var(--text-muted)" }}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span className="text-xs">{profile.location}</span>
                </div>
            </div>

            {/* Summary */}
            <GnomeGroup>
                <div className="px-4 py-3">
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {profile.shortSummary}
                    </p>
                </div>
            </GnomeGroup>

            {/* Key Impact */}
            <GnomeGroup title="Key Impact">
                <div className="grid grid-cols-2">
                    {profile.keyImpact.map((item, i) => (
                        <div
                            key={i}
                            className="px-4 py-3 text-center"
                            style={{
                                borderBottom: i < 2 ? "1px solid var(--border-color)" : undefined,
                                borderRight: i % 2 === 0 ? "1px solid var(--border-color)" : undefined,
                            }}
                        >
                            <div className="text-lg font-bold" style={{ color: "var(--accent-color)" }}>{item.metric}</div>
                            <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{item.description}</div>
                        </div>
                    ))}
                </div>
            </GnomeGroup>

            {/* Details */}
            <GnomeGroup title="Details">
                <GnomeRow label="Email" value={profile.email} href={`mailto:${profile.email}`} />
                <GnomeRow label="Phone" value={profile.phone} href={`tel:${profile.phone}`} />
                <GnomeRow label="Location" value={profile.location} last />
            </GnomeGroup>

            {/* Links */}
            <GnomeGroup title="Connect">
                {profile.links.map((link, i) => (
                    <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                        style={i < profile.links.length - 1 ? { borderBottom: "1px solid var(--border-color)" } : {}}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--hover-bg)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                        <span style={{ color: "var(--accent-color)" }}>
                            <SocialIcon icon={link.icon} />
                        </span>
                        <span className="text-sm" style={{ color: "var(--text-primary)" }}>{link.label}</span>
                        <svg className="w-3 h-3 ml-auto opacity-30" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                    </a>
                ))}
            </GnomeGroup>
        </div>
    );
}

function ExperienceSection() {
    return (
        <div>
            {profile.experience.map((exp, i) => (
                <GnomeGroup key={i} title={exp.company}>
                    <div className="px-4 pt-3 pb-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold" style={{ color: "var(--text-heading)" }}>{exp.role}</span>
                        </div>
                        <span className="text-[11px] font-medium" style={{ color: "var(--accent-color)" }}>{exp.period}</span>
                    </div>
                    <div className="px-4 pb-3 pt-2">
                        <ul className="space-y-2">
                            {exp.bullets.map((bullet, j) => (
                                <li key={j} className="flex items-start gap-2 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                    <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-color)" }} />
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                    </div>
                </GnomeGroup>
            ))}
        </div>
    );
}

function SkillsSection() {
    return (
        <div>
            {profile.skills.map((group, i) => (
                <GnomeGroup key={i} title={group.category}>
                    <div className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                            {group.items.map((skill) => (
                                <Badge key={skill} label={skill} variant="accent" />
                            ))}
                        </div>
                    </div>
                </GnomeGroup>
            ))}

            {/* Highlights */}
            <GnomeGroup title="Highlights">
                {profile.highlights.map((item, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-2.5 px-4 py-2.5 text-[13px]"
                        style={{
                            color: "var(--text-secondary)",
                            borderBottom: i < profile.highlights.length - 1 ? "1px solid var(--border-color)" : undefined,
                        }}
                    >
                        <span className="shrink-0 mt-0.5" style={{ color: "var(--accent-color)" }}>▸</span>
                        {item}
                    </div>
                ))}
            </GnomeGroup>
        </div>
    );
}

function EducationSection() {
    return (
        <div>
            {profile.education.map((edu, i) => (
                <GnomeGroup key={i}>
                    <div className="px-4 py-3">
                        <div className="flex items-start gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                style={{ background: "var(--accent-subtle)" }}
                            >
                                <svg className="w-5 h-5" style={{ fill: "var(--accent-color)" }} viewBox="0 0 24 24">
                                    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: "var(--text-heading)" }}>{edu.degree}</p>
                                <p className="text-[13px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{edu.institution}</p>
                                <p className="text-[11px] mt-1 font-medium" style={{ color: "var(--accent-color)" }}>{edu.period}</p>
                            </div>
                        </div>
                    </div>
                </GnomeGroup>
            ))}

            {/* Quote from resume */}
            <div className="mt-2 px-1">
                <div
                    className="rounded-xl px-4 py-4 text-center"
                    style={{ background: "var(--accent-muted)", border: "1px solid var(--accent-subtle)" }}
                >
                    <p className="text-[13px] italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        &ldquo;We see our customers as invited guests to a party, and we are the hosts. It&rsquo;s our job every day to make every important aspect of the customer experience a little bit better.&rdquo;
                    </p>
                    <p className="text-[11px] mt-2 font-medium" style={{ color: "var(--text-muted)" }}>
                        — Jeff Bezos
                    </p>
                </div>
            </div>
        </div>
    );
}

const SECTIONS: Record<Section, () => React.ReactNode> = {
    about: AboutSection,
    experience: ExperienceSection,
    skills: SkillsSection,
    education: EducationSection,
};

export function AboutApp() {
    const [activeSection, setActiveSection] = useState<Section>("about");
    const ActivePanel = SECTIONS[activeSection];

    return (
        <div className="flex h-full" style={{ color: "var(--text-primary)" }}>
            {/* Sidebar */}
            <div
                className="w-48 shrink-0 flex flex-col py-3 px-2 gap-0.5 overflow-y-auto"
                style={{ borderRight: "1px solid var(--border-color)", background: "var(--sidebar-bg)" }}
            >
                {NAV_ITEMS.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-left transition-colors w-full"
                            style={{
                                background: isActive ? "var(--accent-subtle)" : "transparent",
                                color: isActive ? "var(--accent-color)" : "var(--text-secondary)",
                            }}
                        >
                            <span style={{ color: isActive ? "var(--accent-color)" : "var(--text-muted)" }}>
                                {item.icon}
                            </span>
                            {item.label}
                        </button>
                    );
                })}

                {/* System info at bottom */}
                <div className="mt-auto pt-4 px-2">
                    <div className="text-[10px] space-y-1" style={{ color: "var(--text-muted)" }}>
                        <p>Ubuntu 24.04 LTS</p>
                        <p>GNOME 46</p>
                        <p>Portfolio v1.0.0</p>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                        <ActivePanel />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
