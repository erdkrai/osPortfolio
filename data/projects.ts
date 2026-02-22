export interface ProjectLink {
    label: string;
    href: string;
}

export type CaseStudyBlock =
    | { type: "heading"; text: string }
    | { type: "text"; text: string }
    | { type: "image"; src: string; alt?: string; caption?: string }
    | { type: "video"; src: string; caption?: string }
    | { type: "list"; items: string[] }
    | { type: "quote"; text: string; author?: string };

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
    caseStudy?: CaseStudyBlock[];
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
        caseStudy: [
            { type: "heading", text: "Overview" },
            { type: "text", text: "uiMate was born from the frustration of switching between design tools and component libraries. Teams needed a single workspace to design, build, and export production-ready UI components collaboratively in real time." },
            { type: "heading", text: "The Problem" },
            { type: "text", text: "Design-to-code handoffs are notoriously broken. Designers use Figma, developers re-implement everything in React, and the result rarely matches the original design. Meanwhile, component libraries like Storybook exist in isolation, disconnected from the design process." },
            { type: "quote", text: "We spent 40% of our sprint cycles just translating designs to code. There had to be a better way.", author: "Early beta user" },
            { type: "heading", text: "Technical Architecture" },
            { type: "text", text: "The core of uiMate is a WebSocket-driven collaborative canvas. Every stroke, component placement, and property change is broadcast to all connected clients using Socket.io rooms, with conflict resolution handled via operational transforms." },
            { type: "list", items: [
                "Canvas rendering via HTML5 Canvas with a React reconciler layer",
                "Operational Transform (OT) for conflict-free concurrent editing",
                "Prisma ORM with PostgreSQL for persistent storage",
                "Edge-cached component library served via Vercel Edge Functions",
                "Pixel-perfect code export targeting React + Tailwind CSS",
            ] },
            { type: "heading", text: "Key Challenges" },
            { type: "text", text: "Achieving sub-50ms latency for real-time collaboration was the hardest engineering challenge. We implemented a custom binary protocol over WebSockets, batching micro-operations into frames and using delta compression to minimize payload sizes." },
            { type: "text", text: "The code export pipeline required building a custom AST generator that could introspect canvas elements and produce idiomatic React/Tailwind code — not just dumped HTML." },
            { type: "heading", text: "Results & Impact" },
            { type: "list", items: [
                "10,000+ active users within 6 months of launch",
                "Average session duration of 23 minutes",
                "Component library used in 500+ production applications",
                "Featured on Hacker News front page for 8 hours",
            ] },
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
        caseStudy: [
            { type: "heading", text: "Motivation" },
            { type: "text", text: "Most developer portfolios are either over-engineered personal projects that take months to build, or generic templates that all look the same. DevDeck bridges this gap — giving developers a beautiful, customizable portfolio with zero code required." },
            { type: "heading", text: "How It Works" },
            { type: "list", items: [
                "Connect your GitHub account via OAuth",
                "DevDeck auto-imports your repos, contribution graph, and README",
                "Write case studies in MDX with live preview",
                "Choose from 12 professionally designed themes",
                "Deploy to a custom domain with one click via Vercel Edge",
            ] },
            { type: "heading", text: "Technical Deep Dive" },
            { type: "text", text: "The GitHub integration uses the GraphQL API to fetch repository metadata, languages, and the contribution calendar. Profile data is normalized and cached in Supabase with a 1-hour TTL to avoid rate limits." },
            { type: "text", text: "MDX content is compiled on the edge using next-mdx-remote, allowing developers to embed React components directly in their case studies. This means interactive demos, charts, and code playgrounds work out of the box." },
            { type: "quote", text: "I went from zero to a deployed portfolio with 6 case studies in under 2 hours. This is the tool I've been waiting for.", author: "Product Hunt reviewer" },
            { type: "heading", text: "Growth" },
            { type: "text", text: "DevDeck launched on Product Hunt and reached #3 Product of the Day. Within the first month, 500+ developers published their portfolios. The platform now serves over 2,000 active portfolios with a 92% month-over-month retention rate." },
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
        caseStudy: [
            { type: "heading", text: "Why Another Error Monitor?" },
            { type: "text", text: "Sentry is powerful but heavyweight — complex pricing, massive SDK, and overwhelming UIs. Snaplog was built for small-to-medium teams that want error monitoring without the enterprise complexity." },
            { type: "heading", text: "Architecture" },
            { type: "text", text: "Snaplog uses a multi-tier ingestion pipeline. Errors hit an Express API gateway, get fingerprinted and deduplicated via Redis, then batched into PostgreSQL. The dashboard is a React SPA with real-time updates via Server-Sent Events." },
            { type: "list", items: [
                "Express API gateway with rate limiting and auth middleware",
                "Redis-based fingerprinting for smart error deduplication",
                "PostgreSQL with TimescaleDB extension for time-series error data",
                "React dashboard with SSE-powered real-time updates",
                "Client SDK: vanilla JS, 1.8KB gzipped, zero dependencies",
            ] },
            { type: "heading", text: "Smart Deduplication" },
            { type: "text", text: "The hardest problem in error monitoring is grouping related errors. Snaplog generates a fingerprint from the error message, stack trace, and request context. Similar errors are grouped using Jaccard similarity on tokenized stack frames, reducing alert noise by 80%." },
            { type: "heading", text: "Performance at Scale" },
            { type: "text", text: "At peak, Snaplog processes over 1 million error events per day with p99 ingestion latency under 100ms. The secret is the Redis write-behind cache — errors are acknowledged immediately and persisted asynchronously." },
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
        caseStudy: [
            { type: "heading", text: "The Idea" },
            { type: "text", text: "As AI tools became part of daily workflows, I noticed everyone was copy-pasting prompts from notes apps, bookmarks, and Slack threads. There was no dedicated tool for managing prompts across multiple AI platforms." },
            { type: "heading", text: "How It Works" },
            { type: "text", text: "Promptly is a Chrome extension that injects a floating sidebar into ChatGPT, Claude, Gemini, and other AI interfaces. Users can save, tag, and insert prompts with one click. The web app provides a full management dashboard with folders, search, and team sharing." },
            { type: "list", items: [
                "Chrome Extension Manifest V3 with content scripts for each AI platform",
                "Floating sidebar UI built with React, injected via Shadow DOM for style isolation",
                "Supabase backend for auth, prompt storage, and team collaboration",
                "Prompt versioning with diff view to track iteration history",
                "One-click sharing via unique URLs with optional password protection",
            ] },
            { type: "heading", text: "Cross-Platform Challenge" },
            { type: "text", text: "Each AI platform has a completely different DOM structure and update cycle. ChatGPT uses a React fiber tree, Claude uses a custom framework, and Gemini is built on Lit. Promptly uses a unified adapter pattern — each platform has a thin adapter that handles DOM queries, input injection, and mutation observation." },
            { type: "quote", text: "This is the Raycast of AI prompts. Can't believe it took this long for someone to build it.", author: "Chrome Web Store review" },
            { type: "heading", text: "Traction" },
            { type: "text", text: "Promptly reached 2,000 weekly active users within 3 months of launch, with a 4.9-star rating and 300+ reviews on the Chrome Web Store. The team sharing feature drives organic growth — every shared prompt becomes a discovery vector for new users." },
        ],
    },
];

// Derived unique tags
export const projectTags: string[] = [
    "All",
    ...Array.from(new Set(projects.flatMap((p) => p.tags))),
];
