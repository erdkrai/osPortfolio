"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { useWindowStore } from "@/store/windows";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";

// ─── Types ────────────────────────────────────────────────────────────────────
type OutputLine = {
    text: string;
    type: "output" | "error" | "success" | "info" | "prompt" | "ascii";
    html?: boolean;
};

// ─── Virtual Filesystem ────────────────────────────────────────────────────────
type FSNode =
    | { kind: "dir"; children: string[] }
    | { kind: "file"; content: string };

const buildFS = (): Record<string, FSNode> => ({
    "/": { kind: "dir", children: ["home", "etc", "usr", "bin"] },
    "/home": { kind: "dir", children: ["user"] },
    "/home/user": {
        kind: "dir",
        children: [
            "about.txt",
            "skills.txt",
            "projects",
            "resume.pdf",
            ".bashrc",
            "README.md",
        ],
    },
    "/home/user/about.txt": {
        kind: "file",
        content: [
            `Name    : ${profile.name}`,
            `Title   : ${profile.title}`,
            `Location: ${profile.location}`,
            `Email   : ${profile.email}`,
            "",
            profile.shortSummary,
        ].join("\n"),
    },
    "/home/user/skills.txt": {
        kind: "file",
        content: profile.skills
            .map((g) => `[${g.category}]\n  ${g.items.join(", ")}`)
            .join("\n\n"),
    },
    "/home/user/projects": {
        kind: "dir",
        children: projects.map((p) => p.id + ".md"),
    },
    ...Object.fromEntries(
        projects.map((p) => [
            `/home/user/projects/${p.id}.md`,
            {
                kind: "file" as const,
                content: [
                    `# ${p.title}  [${p.year ?? ""}]`,
                    `Role : ${p.role ?? "Developer"}`,
                    `Stack: ${p.stack.join(", ")}`,
                    "",
                    p.description,
                    "",
                    "Highlights:",
                    ...p.highlights.map((h) => `  • ${h}`),
                    "",
                    "Links:",
                    ...p.links.map((l) => `  ${l.label}: ${l.href}`),
                ].join("\n"),
            },
        ])
    ),
    "/home/user/resume.pdf": {
        kind: "file",
        content: "[binary: PDF file — open with xdg-open resume.pdf or download from browser]",
    },
    "/home/user/.bashrc": {
        kind: "file",
        content: [
            "# ~/.bashrc — portfolio shell config",
            "export PS1='\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]$ '",
            "alias ll='ls -la'",
            "alias projects='ls ~/projects'",
            "alias open='xdg-open'",
        ].join("\n"),
    },
    "/home/user/README.md": {
        kind: "file",
        content: [
            "# Portfolio Terminal",
            "",
            "Welcome! Type `help` to see all available commands.",
            "",
            "Quick start:",
            "  about       — Who am I",
            "  projects    — My work",
            "  skills      — Tech stack",
            "  open about  — Open the About Me window",
        ].join("\n"),
    },
    "/etc": { kind: "dir", children: ["hostname", "os-release"] },
    "/etc/hostname": { kind: "file", content: "portfolio" },
    "/etc/os-release": {
        kind: "file",
        content: [
            'NAME="Ubuntu"',
            'VERSION="22.04.3 LTS (Jammy Jellyfish)"',
            'ID=ubuntu',
            'VERSION_ID="22.04"',
            'PRETTY_NAME="Ubuntu 22.04.3 LTS"',
            'HOME_URL="https://www.ubuntu.com/"',
        ].join("\n"),
    },
    "/usr": { kind: "dir", children: ["bin", "share"] },
    "/usr/bin": { kind: "dir", children: ["node", "npm", "git", "python3"] },
    "/bin": { kind: "dir", children: ["bash", "ls", "cat", "echo", "pwd", "cd", "clear"] },
});

// ─── Neofetch ASCII art ────────────────────────────────────────────────────────
const UBUNTU_ASCII = [
    "            .-/+oossssoo+/-.",
    "        `:+ssssssssssssssssss+:`",
    "      -+ssssssssssssssssssyyssss+-",
    "    .osssssssssssssssssssdMMMNysssso.",
    "   /ssssssssssshdmmNNmmyNMMMMhssssss/",
    "  +ssssssssshmydMMMMMMMNddddyssssssss+",
    " /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/",
    ".ssssssssdMMMNhsssssssssshNMMMdssssssss.",
    "+sssshhhyNMMNyssssssssssssyNMMMysssssss+",
    "ossyNMMMNyMMhsssssssssssssshmmmhssssssso",
    "ossyNMMMNyMMhsssssssssssssshmmmhssssssso",
    "+sssshhhyNMMNyssssssssssssyNMMMysssssss+",
    ".ssssssssdMMMNhsssssssssshNMMMdssssssss.",
    " /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/",
    "  +ssssssssshmydMMMMMMMNddddyssssssss+",
    "   /ssssssssssshdmmNNmmyNMMMMhssssss/",
    "    .osssssssssssssssssssdMMMNysssso.",
    "      -+ssssssssssssssssssyyssss+-",
    "        `:+ssssssssssssssssss+:`",
    "            .-/+oossssoo+/-.",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function resolvePath(cwd: string, input: string): string {
    if (input.startsWith("~")) input = "/home/user" + input.slice(1);
    if (!input) return cwd;
    if (input.startsWith("/")) return normalizePath(input);
    return normalizePath(cwd + "/" + input);
}

function normalizePath(p: string): string {
    const parts = p.split("/").filter(Boolean);
    const stack: string[] = [];
    for (const part of parts) {
        if (part === "..") stack.pop();
        else if (part !== ".") stack.push(part);
    }
    return "/" + stack.join("/");
}

function displayPath(p: string): string {
    return p.replace("/home/user", "~");
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function TerminalApp() {
    const { openWindow } = useWindowStore();
    const [cwd, setCwd] = useState("/home/user");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState<OutputLine[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIdx, setHistoryIdx] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const fs = useRef<Record<string, FSNode>>(buildFS());

    // Welcome message
    useEffect(() => {
        setOutput([
            { type: "ascii", text: "" },
            { type: "success", text: `Ubuntu 22.04.3 LTS — Portfolio Terminal` },
            { type: "info", text: `${profile.name} | ${profile.title}` },
            { type: "output", text: "" },
            { type: "output", text: `Type \`help\` to see available commands.` },
            { type: "output", text: "─".repeat(52) },
            { type: "output", text: "" },
        ]);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [output]);

    // Focus input on click
    const focusInput = () => inputRef.current?.focus();

    const appendOutput = (lines: OutputLine[]) => {
        setOutput((prev) => [...prev, ...lines]);
    };

    const OPEN_APP_MAP: Record<string, { appId: "about" | "projects" | "resume"; title: string; defaultSize: { w: number; h: number } }> = {
        about: { appId: "about", title: "About Me", defaultSize: { w: 560, h: 500 } },
        projects: { appId: "projects", title: "Projects", defaultSize: { w: 900, h: 620 } },
        resume: { appId: "resume", title: "Resume", defaultSize: { w: 800, h: 640 } },
    };

    const processCommand = useCallback(
        (raw: string) => {
            const trimmed = raw.trim();
            if (!trimmed) {
                appendOutput([{ type: "prompt", text: "" }]);
                return;
            }

            // Echo the prompt line
            appendOutput([
                {
                    type: "prompt",
                    text: `user@portfolio:${displayPath(cwd)}$ ${trimmed}`,
                },
            ]);

            // Add to history
            setHistory((h) => [trimmed, ...h.filter((x) => x !== trimmed)]);
            setHistoryIdx(-1);

            const [cmd, ...args] = trimmed.split(/\s+/);
            const arg1 = args[0] ?? "";

            switch (cmd.toLowerCase()) {
                // ── Navigation ───────────────────────────────────────────────────────
                case "help": {
                    appendOutput([
                        { type: "success", text: "╔══════════════════════════════════════════════╗" },
                        { type: "success", text: "║        Portfolio Terminal — Commands          ║" },
                        { type: "success", text: "╚══════════════════════════════════════════════╝" },
                        { type: "output", text: "" },
                        { type: "info", text: "── Portfolio Info ───────────────────────────────" },
                        { type: "output", text: "  about          Show who I am" },
                        { type: "output", text: "  projects        List all projects" },
                        { type: "output", text: "  skills          List tech skills" },
                        { type: "output", text: "  contact         Show contact info" },
                        { type: "output", text: "  open <app>      Open GUI window: about, projects, resume" },
                        { type: "output", text: "" },
                        { type: "info", text: "── Filesystem ───────────────────────────────────" },
                        { type: "output", text: "  ls [-la]        List directory contents" },
                        { type: "output", text: "  cd <dir>        Change directory" },
                        { type: "output", text: "  pwd             Print working directory" },
                        { type: "output", text: "  cat <file>      Print file content" },
                        { type: "output", text: "  tree            Show directory tree" },
                        { type: "output", text: "" },
                        { type: "info", text: "── System ────────────────────────────────────────" },
                        { type: "output", text: "  neofetch        System info with Ubuntu logo" },
                        { type: "output", text: "  uname [-a]      Print OS info" },
                        { type: "output", text: "  whoami          Print current user" },
                        { type: "output", text: "  date            Print current date/time" },
                        { type: "output", text: "  history         Command history" },
                        { type: "output", text: "  echo <text>     Print text" },
                        { type: "output", text: "  clear           Clear the terminal" },
                        { type: "output", text: "" },
                        { type: "info", text: "── Shortcuts ─────────────────────────────────────" },
                        { type: "output", text: "  ↑ / ↓          Navigate command history" },
                        { type: "output", text: "  Tab             Autocomplete (basic)" },
                        { type: "output", text: "  Ctrl+L          Clear screen" },
                        { type: "output", text: "" },
                    ]);
                    break;
                }

                case "clear":
                    setOutput([]);
                    break;

                // ── Portfolio ─────────────────────────────────────────────────────────
                case "about": {
                    appendOutput([
                        { type: "success", text: `╔ ${profile.name} ` + "─".repeat(Math.max(0, 44 - profile.name.length)) + "╗" },
                        { type: "success", text: `  ${profile.title}` },
                        { type: "success", text: `  📍 ${profile.location}` },
                        { type: "success", text: `  ✉  ${profile.email}` },
                        { type: "output", text: "" },
                        { type: "output", text: profile.shortSummary },
                        { type: "output", text: "" },
                        { type: "info", text: "Highlights:" },
                        ...profile.highlights.map((h) => ({ type: "output" as const, text: `  ▸ ${h}` })),
                        { type: "output", text: "" },
                        { type: "info", text: "Tip: run `open about` to view the full GUI profile window." },
                        { type: "output", text: "" },
                    ]);
                    break;
                }

                case "projects": {
                    appendOutput([
                        { type: "info", text: `Found ${projects.length} projects:\n` },
                        ...projects.map((p, i) => ({
                            type: "output" as const,
                            text: `  ${String(i + 1).padStart(2, " ")}. ${p.title.padEnd(28)} [${p.year ?? "----"}]  ${p.stack.slice(0, 3).join(", ")}`,
                        })),
                        { type: "output", text: "" },
                        { type: "info", text: `Use \`cat ~/projects/<name>.md\` for details, or \`open projects\` for GUI.` },
                        { type: "output", text: "" },
                    ]);
                    break;
                }

                case "skills": {
                    appendOutput([
                        { type: "info", text: "Tech Skills\n" },
                        ...profile.skills.flatMap((g) => [
                            { type: "success" as const, text: `  [${g.category}]` },
                            { type: "output" as const, text: `    ${g.items.join("  ·  ")}` },
                            { type: "output" as const, text: "" },
                        ]),
                    ]);
                    break;
                }

                case "contact": {
                    appendOutput([
                        { type: "info", text: "Contact Info\n" },
                        { type: "output", text: `  Email   : ${profile.email}` },
                        ...profile.links.map((l) => ({
                            type: "output" as const,
                            text: `  ${l.label.padEnd(8)}: ${l.href}`,
                        })),
                        { type: "output", text: "" },
                        { type: "output", text: "" },
                    ]);
                    break;
                }

                // ── GUI opener ────────────────────────────────────────────────────────
                case "open":
                case "xdg-open": {
                    const appKey = arg1.toLowerCase();
                    const appCfg = OPEN_APP_MAP[appKey];
                    if (!appCfg) {
                        appendOutput([
                            {
                                type: "error",
                                text: `open: unknown application '${arg1}'. Available: ${Object.keys(OPEN_APP_MAP).join(", ")}`,
                            },
                        ]);
                    } else {
                        openWindow(appCfg);
                        appendOutput([
                            { type: "success", text: `Opening ${appCfg.title}...` },
                            { type: "output", text: "" },
                        ]);
                    }
                    break;
                }

                // ── Filesystem ────────────────────────────────────────────────────────
                case "pwd":
                    appendOutput([{ type: "output", text: cwd }, { type: "output", text: "" }]);
                    break;

                case "cd": {
                    const target = arg1 || "/home/user";
                    const resolved = resolvePath(cwd, target);
                    const node = fs.current[resolved];
                    if (!node) {
                        appendOutput([{ type: "error", text: `cd: ${target}: No such file or directory` }, { type: "output", text: "" }]);
                    } else if (node.kind !== "dir") {
                        appendOutput([{ type: "error", text: `cd: ${target}: Not a directory` }, { type: "output", text: "" }]);
                    } else {
                        setCwd(resolved);
                        appendOutput([{ type: "output", text: "" }]);
                    }
                    break;
                }

                case "ls": {
                    const showAll = args.includes("-a") || args.includes("-la") || args.includes("-al");
                    const showLong = args.includes("-l") || args.includes("-la") || args.includes("-al");
                    const targetArg = args.find((a) => !a.startsWith("-")) || "";
                    const targetPath = targetArg ? resolvePath(cwd, targetArg) : cwd;
                    const node = fs.current[targetPath];

                    if (!node) {
                        appendOutput([{ type: "error", text: `ls: cannot access '${targetArg}': No such file or directory` }]);
                    } else if (node.kind === "file") {
                        appendOutput([{ type: "output", text: targetArg || targetPath.split("/").pop()! }]);
                    } else {
                        const children = showAll
                            ? [".", "..", ...node.children]
                            : node.children.filter((c) => !c.startsWith("."));

                        if (showLong) {
                            appendOutput([
                                { type: "output", text: `total ${children.length}` },
                                ...children.map((name) => {
                                    const childPath = targetPath + "/" + name;
                                    const child = fs.current[childPath];
                                    const isDir = name === "." || name === ".." || child?.kind === "dir";
                                    const color = isDir ? "dir" : "file";
                                    return {
                                        type: (color === "dir" ? "info" : "output") as OutputLine["type"],
                                        text: `${isDir ? "drwxr-xr-x" : "-rw-r--r--"}  user user  ${String(Math.floor(Math.random() * 4096 + 512)).padStart(6)}  Feb 22 08:12  ${name}${isDir ? "/" : ""}`,
                                    };
                                }),
                                { type: "output", text: "" },
                            ]);
                        } else {
                            appendOutput([
                                {
                                    type: "output",
                                    text: children
                                        .map((name) => {
                                            const childPath = targetPath + "/" + name;
                                            const child = fs.current[childPath];
                                            const isDir = name === "." || name === ".." || child?.kind === "dir";
                                            return isDir ? name + "/" : name;
                                        })
                                        .join("    "),
                                },
                                { type: "output", text: "" },
                            ]);
                        }
                    }
                    break;
                }

                case "cat": {
                    if (!arg1) {
                        appendOutput([{ type: "error", text: "cat: missing operand" }, { type: "output", text: "" }]);
                        break;
                    }
                    const filePath = resolvePath(cwd, arg1);
                    const node = fs.current[filePath];
                    if (!node) {
                        appendOutput([{ type: "error", text: `cat: ${arg1}: No such file or directory` }, { type: "output", text: "" }]);
                    } else if (node.kind === "dir") {
                        appendOutput([{ type: "error", text: `cat: ${arg1}: Is a directory` }, { type: "output", text: "" }]);
                    } else {
                        appendOutput([
                            ...node.content.split("\n").map((line) => ({ type: "output" as const, text: line })),
                            { type: "output", text: "" },
                        ]);
                    }
                    break;
                }

                case "tree": {
                    const buildTree = (path: string, prefix: string): OutputLine[] => {
                        const node = fs.current[path];
                        if (!node || node.kind !== "dir") return [];
                        return node.children.flatMap((name, i) => {
                            const childPath = path + "/" + name;
                            const child = fs.current[childPath];
                            const isLast = i === node.children.length - 1;
                            const connector = isLast ? "└── " : "├── ";
                            const label = child?.kind === "dir" ? name + "/" : name;
                            const lines: OutputLine[] = [{ type: child?.kind === "dir" ? "info" : "output", text: prefix + connector + label }];
                            if (child?.kind === "dir") {
                                const childPrefix = prefix + (isLast ? "    " : "│   ");
                                lines.push(...buildTree(childPath, childPrefix));
                            }
                            return lines;
                        });
                    };
                    appendOutput([
                        { type: "info", text: displayPath(cwd) },
                        ...buildTree(cwd, ""),
                        { type: "output", text: "" },
                    ]);
                    break;
                }

                // ── System ────────────────────────────────────────────────────────────
                case "whoami":
                    appendOutput([{ type: "output", text: "user" }, { type: "output", text: "" }]);
                    break;

                case "date":
                    appendOutput([
                        {
                            type: "output",
                            text: new Date().toLocaleString("en-US", {
                                weekday: "short", month: "short", day: "numeric",
                                year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
                                timeZoneName: "short",
                            }),
                        },
                        { type: "output", text: "" },
                    ]);
                    break;

                case "uname": {
                    const isAll = args.includes("-a");
                    appendOutput([
                        {
                            type: "output",
                            text: isAll
                                ? "Linux portfolio 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux"
                                : "Linux",
                        },
                        { type: "output", text: "" },
                    ]);
                    break;
                }

                case "neofetch": {
                    const now = new Date();
                    const info = [
                        `\x1b[1;32muser\x1b[0m@\x1b[1;32mportfolio\x1b[0m`,
                        `\x1b[33m──────────────────\x1b[0m`,
                        `\x1b[33mOS     :\x1b[0m Ubuntu 22.04.3 LTS`,
                        `\x1b[33mKernel :\x1b[0m 5.15.0-91-generic`,
                        `\x1b[33mShell  :\x1b[0m bash 5.1.16`,
                        `\x1b[33mName   :\x1b[0m ${profile.name}`,
                        `\x1b[33mRole   :\x1b[0m ${profile.title}`,
                        `\x1b[33mLocale :\x1b[0m ${profile.location}`,
                        `\x1b[33mUptime :\x1b[0m ${Math.floor(Math.random() * 12 + 1)}h ${Math.floor(Math.random() * 60)}m`,
                        `\x1b[33mTime   :\x1b[0m ${now.toLocaleTimeString()}`,
                        `\x1b[33mTheme  :\x1b[0m Yaru-dark`,
                    ];
                    const asciiLines = UBUNTU_ASCII;
                    const maxLen = Math.max(asciiLines.length, info.length);
                    const lines: OutputLine[] = [];
                    for (let i = 0; i < maxLen; i++) {
                        const ascii = asciiLines[i] ?? " ".repeat(44);
                        const inf = info[i] ?? "";
                        lines.push({ type: "ascii", text: ascii.padEnd(44) + "  " + inf });
                    }
                    appendOutput([...lines, { type: "output", text: "" }]);
                    break;
                }

                case "history": {
                    appendOutput([
                        ...history.map((cmd, i) => ({
                            type: "output" as const,
                            text: `  ${String(history.length - i).padStart(4)}  ${cmd}`,
                        })),
                        { type: "output", text: "" },
                    ]);
                    break;
                }

                case "echo":
                    appendOutput([
                        { type: "output", text: args.join(" ") },
                        { type: "output", text: "" },
                    ]);
                    break;

                case "sudo": {
                    appendOutput([
                        { type: "error", text: `sudo: this incident will be reported. 😅` },
                        { type: "output", text: "" },
                    ]);
                    break;
                }

                case "alias":
                    appendOutput([
                        { type: "output", text: "alias ll='ls -la'" },
                        { type: "output", text: "alias projects='ls ~/projects'" },
                        { type: "output", text: "alias open='xdg-open'" },
                        { type: "output", text: "" },
                    ]);
                    break;

                case "man": {
                    appendOutput([
                        { type: "info", text: `No manual entry for ${arg1 || "unknown"}. Try \`help\` instead.` },
                        { type: "output", text: "" },
                    ]);
                    break;
                }

                case "exit":
                case "logout":
                    appendOutput([
                        { type: "success", text: "Type `close` in the window controls to exit." },
                        { type: "output", text: "" },
                    ]);
                    break;

                default:
                    appendOutput([
                        {
                            type: "error",
                            text: `${cmd}: command not found. Type \`help\` for available commands.`,
                        },
                        { type: "output", text: "" },
                    ]);
            }
        },
        [cwd, history, openWindow, OPEN_APP_MAP]
    );

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            processCommand(input);
            setInput("");
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const nextIdx = Math.min(historyIdx + 1, history.length - 1);
            setHistoryIdx(nextIdx);
            setInput(history[nextIdx] ?? "");
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            const nextIdx = Math.max(historyIdx - 1, -1);
            setHistoryIdx(nextIdx);
            setInput(nextIdx === -1 ? "" : (history[nextIdx] ?? ""));
        } else if (e.key === "l" && e.ctrlKey) {
            e.preventDefault();
            setOutput([]);
        } else if (e.key === "Tab") {
            e.preventDefault();
            // Basic autocomplete for commands
            const CMDS = ["help", "about", "projects", "skills", "contact", "open", "ls", "cd", "pwd", "cat", "tree", "clear", "whoami", "date", "uname", "neofetch", "history", "echo", "sudo", "alias", "man"];
            const match = CMDS.find((c) => c.startsWith(input));
            if (match) setInput(match + " ");
        }
    };

    // Style helpers for each line type
    const lineStyle = (type: OutputLine["type"]) => {
        switch (type) {
            case "error": return { color: "#ff6b6b" };
            case "success": return { color: "#50fa7b" };
            case "info": return { color: "#8be9fd" };
            case "prompt": return {};
            case "ascii": return { color: "#E95420", fontWeight: "bold" };
            default: return { color: "#f8f8f2" };
        }
    };

    const renderPromptLine = (text: string) => {
        // user@portfolio:~$ → colour user@portfolio green, :~$ blue
        const match = text.match(/^(user@portfolio)(:[^\s]+\$)\s(.*)$/);
        if (!match) return <span style={{ color: "#f8f8f2" }}>{text}</span>;
        return (
            <>
                <span style={{ color: "#50fa7b", fontWeight: "bold" }}>{match[1]}</span>
                <span style={{ color: "#8be9fd" }}>{match[2]}</span>
                <span style={{ color: "#f8f8f2" }}> {match[3]}</span>
            </>
        );
    };

    return (
        <div
            className="h-full flex flex-col font-mono text-sm cursor-text select-text"
            style={{ background: "#2d0922", color: "#f8f8f2" }}
            onClick={focusInput}
        >
            {/* Terminal output */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0">
                {output.map((line, i) => (
                    <div
                        key={i}
                        style={{
                            ...lineStyle(line.type),
                            lineHeight: "1.6",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                            minHeight: "1.6em",
                        }}
                    >
                        {line.type === "prompt"
                            ? renderPromptLine(line.text)
                            : line.text || "\u00A0"}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input row */}
            <div
                className="flex items-center gap-0 px-4 py-2 shrink-0"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
                {/* Prompt */}
                <span style={{ color: "#50fa7b", fontWeight: "bold", userSelect: "none" }}>
                    user@portfolio
                </span>
                <span style={{ color: "#8be9fd", userSelect: "none" }}>
                    :{displayPath(cwd)}$&nbsp;
                </span>
                {/* Actual input */}
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className="flex-1 bg-transparent outline-none caret-orange-400"
                    style={{ color: "#f8f8f2", fontFamily: "inherit", fontSize: "inherit" }}
                    aria-label="Terminal input"
                />
            </div>
        </div>
    );
}
