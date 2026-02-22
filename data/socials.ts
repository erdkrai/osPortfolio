export interface Social {
    label: string;
    href: string;
    icon: "github" | "linkedin" | "twitter" | "email" | "globe";
}

export const socials: Social[] = [
    {
        label: "LinkedIn",
        href: "https://linkedin.com/in/deepanshukumar",
        icon: "linkedin",
    },
    {
        label: "GitHub",
        href: "https://github.com/deepanshukumar",
        icon: "github",
    },
    {
        label: "Twitter / X",
        href: "https://twitter.com/deepanshukumar",
        icon: "twitter",
    },
    {
        label: "Email",
        href: "mailto:erdkrai04@gmail.com",
        icon: "email",
    },
];
