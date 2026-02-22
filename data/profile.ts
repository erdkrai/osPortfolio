export interface Skill {
    category: string;
    items: string[];
}

export interface ProfileLink {
    label: string;
    href: string;
    icon?: string;
}

export interface Experience {
    role: string;
    company: string;
    period: string;
    bullets: string[];
}

export interface Education {
    degree: string;
    institution: string;
    period: string;
}

export interface KeyImpact {
    metric: string;
    description: string;
}

export interface Profile {
    name: string;
    title: string;
    shortSummary: string;
    location: string;
    email: string;
    phone: string;
    highlights: string[];
    experience: Experience[];
    education: Education[];
    keyImpact: KeyImpact[];
    skills: Skill[];
    links: ProfileLink[];
}

export const profile: Profile = {
    name: "Deepanshu Kumar",
    title: "Associate Product Manager",
    shortSummary:
        "Design-led Product Manager with 6+ years of experience building AI-driven enterprise SaaS and platform products. Strong in product discovery, system thinking, and cross-functional leadership. Delivered measurable improvements in customer experience and operational efficiency through AI assistants, workflow automation, and platform standardisation.",
    location: "Bengaluru, India",
    email: "erdkrai04@gmail.com",
    phone: "+91-8360112474",
    highlights: [
        "6+ years building AI-driven SaaS & platform products",
        "Shipped AI-powered RCA assistant on on-prem infrastructure",
        "Led 0→1 AI productivity platform saving ₹3 Cr annually",
        "Drove largest dashboard migration to unified design system",
        "Published open-source design system (Blend UI)",
        "B.Tech CSE (Hons.) · Juspay",
    ],
    experience: [
        {
            role: "Associate Product Manager",
            company: "Juspay",
            period: "Jan 2025 – Present",
            bullets: [
                "Redesigned merchant RCA experience improving search relevance and diagnostic workflows — 50% faster resolution, 40% higher satisfaction, 30% fewer support tickets.",
                "Built and launched AI assistant (Juspay Genius) enabling natural-language RCA over live payment and business datasets with on-prem LLM deployment.",
                "Led 0→1 design & development of Xyne Spaces, an AI-enabled collaboration platform replacing Slack internally — achieved ₹3 Cr annual savings.",
                "Drove rollout of unified design system (Blend UI) across products, published to open-source community.",
                "Supported enterprise onboarding and roadmap alignment for Barclays.",
            ],
        },
        {
            role: "Product Design Leadership",
            company: "Juspay",
            period: "Nov 2019 – Dec 2024",
            bullets: [
                "Shipped SaaS dashboards and merchant payment experiences across analytics, operations, and credit workflows.",
                "Built SaaS and Payments design systems, developer documentation, and growth initiatives.",
                "Delivered product UX for payment flows, SDK UI systems, offers/retry modules, and multi-stakeholder platforms.",
            ],
        },
    ],
    education: [
        {
            degree: "B.Tech in CSE (Hons.)",
            institution: "Lovely Professional University",
            period: "2016 – 2020",
        },
        {
            degree: "Higher Secondary (PCM)",
            institution: "DPS Nigahi",
            period: "2014 – 2016",
        },
    ],
    keyImpact: [
        { metric: "50%", description: "Faster merchant RCA resolution" },
        { metric: "40%", description: "Higher merchant satisfaction" },
        { metric: "₹3 Cr", description: "Annual savings via Xyne Spaces" },
        { metric: "30%", description: "Fewer support tickets" },
    ],
    skills: [
        {
            category: "Product Management",
            items: ["Product Strategy", "Roadmaps", "PRDs", "Prioritization", "OKRs/KPIs", "Stakeholder Management", "Product Launch"],
        },
        {
            category: "AI & Data Products",
            items: ["AI Products", "LLM Integration", "On-Prem AI", "Natural Language UX", "Search Optimization"],
        },
        {
            category: "Platform & SaaS",
            items: ["Enterprise SaaS", "Platform Products", "Workflow Automation", "Design Systems", "Adoption & Migration"],
        },
        {
            category: "Tools",
            items: ["Jira", "Mixpanel", "Notion", "Excel", "Google Workspace", "Cursor", "Claude"],
        },
    ],
    links: [
        { label: "LinkedIn", href: "https://linkedin.com/in/deepanshukumar", icon: "linkedin" },
        { label: "Email", href: "mailto:erdkrai04@gmail.com", icon: "email" },
        { label: "GitHub", href: "https://github.com/deepanshukumar", icon: "github" },
        { label: "Twitter", href: "https://twitter.com/deepanshukumar", icon: "twitter" },
    ],
};
