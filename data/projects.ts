export interface ProjectLink {
    label: string;
    href: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    role?: string;
    stack: string[];
    tags: string[];
    links: ProjectLink[];
    highlights: string[];
    year?: string;
    cover?: string;
}

export const projects: Project[] = [
    {
        id: "project-1",
        title: "uiMate — Collaborative Design Tool",
        description:
            "A real-time collaborative whiteboard and UI component library builder for design teams. Think Figma meets Storybook.",
        role: "Lead Frontend Engineer",
        stack: ["Next.js", "TypeScript", "Socket.io", "Prisma", "PostgreSQL"],
        tags: ["SaaS", "Real-time", "Design"],
        year: "2024",
        highlights: [
            "Built real-time multiplayer canvas with Socket.io — <50ms latency",
            "Component library with 30+ production-ready UI primitives",
            "Grew to 10k+ active users in 6 months post-launch",
            "Implemented pixel-perfect export to React/Tailwind code",
        ],
        links: [
            { label: "Live", href: "https://uimate.app" },
            { label: "GitHub", href: "https://github.com/yourname/uimate" },
        ],
    },
    {
        id: "project-2",
        title: "DevDeck — Developer Portfolio Platform",
        description:
            "No-code portfolio builder for developers. Connect your GitHub, write in MDX, deploy in one click.",
        role: "Solo Founder",
        stack: ["Next.js", "MDX", "Supabase", "Vercel", "Tailwind CSS"],
        tags: ["Indie Hack", "Developer Tools", "No-code"],
        year: "2023",
        highlights: [
            "500+ portfolios published in first month",
            "GitHub integration pulls repos and contribution graph automatically",
            "Custom domain support via Vercel Edge",
            "Featured on Product Hunt — #3 Product of the Day",
        ],
        links: [
            { label: "Live", href: "https://devdeck.so" },
            { label: "GitHub", href: "https://github.com/yourname/devdeck" },
        ],
    },
    {
        id: "project-3",
        title: "Snaplog — Error Monitoring SaaS",
        description:
            "Lightweight alternative to Sentry. Captures, groups, and alerts on JavaScript errors with a beautiful dashboard.",
        role: "Backend Lead",
        stack: ["Node.js", "Express", "Redis", "PostgreSQL", "React"],
        tags: ["SaaS", "DevOps", "Monitoring"],
        year: "2023",
        highlights: [
            "Ingests 1M+ error events/day with sub-100ms processing",
            "Smart deduplication reduces noise by 80%",
            "SDK weighs < 2KB gzipped",
            "Slack + PagerDuty integrations",
        ],
        links: [
            { label: "Live", href: "https://snaplog.dev" },
            { label: "GitHub", href: "https://github.com/yourname/snaplog" },
        ],
    },
    {
        id: "project-4",
        title: "Promptly — AI Prompt Manager",
        description:
            "Chrome extension + web app to save, organize, and share AI prompts across ChatGPT, Claude, and Gemini.",
        role: "Full-stack Developer",
        stack: ["TypeScript", "React", "Chrome Extension API", "Supabase"],
        tags: ["AI", "Chrome Extension", "Productivity"],
        year: "2024",
        highlights: [
            "2,000+ weekly active users on Chrome Web Store",
            "Works across ChatGPT, Claude, Gemini, and 5 other AI tools",
            "Prompt versioning and team sharing features",
            "4.9★ rating with 300+ reviews",
        ],
        links: [
            { label: "Chrome Store", href: "https://chrome.google.com/webstore" },
            { label: "GitHub", href: "https://github.com/yourname/promptly" },
        ],
    },
];

// Derived unique tags
export const projectTags: string[] = [
    "All",
    ...Array.from(new Set(projects.flatMap((p) => p.tags))),
];
