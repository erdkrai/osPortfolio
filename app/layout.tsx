import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/desktop/ThemeProvider";

export const metadata: Metadata = {
  title: "Deepanshu's Portfolio",
  description:
    "Interactive Ubuntu Linux-style OS portfolio. Explore my projects, skills, and experience in a full desktop environment.",
  keywords: ["portfolio", "developer", "Next.js", "TypeScript", "full-stack"],
  authors: [{ name: "Deepanshu Kumar" }],
  openGraph: {
    title: "Deepanshu's Portfolio",
    description: "Interactive Ubuntu-style portfolio. Explore projects, skills, and experience.",
    type: "website",
    url: "https://yourname.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Name — Developer Portfolio",
    description: "Interactive Ubuntu-style portfolio.",
    creator: "@yourname",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden" suppressHydrationWarning>
      <body className="h-full overflow-hidden antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
