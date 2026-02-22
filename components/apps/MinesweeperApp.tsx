"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";

// ── Minesweeper constants ──
type Difficulty = "easy" | "medium" | "hard";
type CellState = "hidden" | "revealed" | "flagged";
type GameState = "idle" | "playing" | "won" | "lost";

interface Cell {
    mine: boolean;
    adjacent: number;
    state: CellState;
}

const DIFFICULTIES: Record<Difficulty, { rows: number; cols: number; mines: number; label: string }> = {
    easy: { rows: 9, cols: 9, mines: 10, label: "Easy" },
    medium: { rows: 16, cols: 16, mines: 40, label: "Medium" },
    hard: { rows: 16, cols: 30, mines: 99, label: "Hard" },
};

const COLORS = {
    bg: "#1e1e2e",
    headerBg: "rgba(0,0,0,0.3)",
    cellHidden: "#3b3b52",
    cellHiddenHover: "#45455e",
    cellRevealed: "#2a2a3c",
    cellMine: "#f38ba8",
    cellFlag: "#f9e2af",
    border: "rgba(255,255,255,0.06)",
    text: "#cdd6f4",
    dim: "#6c7086",
    accent: "#89b4fa",
    numbers: ["", "#89b4fa", "#a6e3a1", "#f38ba8", "#cba6f7", "#fab387", "#89dceb", "#f5c2e7", "#6c7086"],
};

function createBoard(rows: number, cols: number, mines: number, safeR: number, safeC: number): Cell[][] {
    const board: Cell[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({ mine: false, adjacent: 0, state: "hidden" as CellState }))
    );

    // Place mines avoiding the safe cell and its neighbors
    let placed = 0;
    while (placed < mines) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if (board[r][c].mine) continue;
        if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
        board[r][c].mine = true;
        placed++;
    }

    // Count adjacents
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c].mine) continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++)
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) count++;
                }
            board[r][c].adjacent = count;
        }
    }

    return board;
}

export function MinesweeperApp() {
    const containerRef = useRef<HTMLDivElement>(null);
    const boardAreaRef = useRef<HTMLDivElement>(null);
    const [difficulty, setDifficulty] = useState<Difficulty>("medium");
    const [board, setBoard] = useState<Cell[][] | null>(null);
    const [gameState, setGameState] = useState<GameState>("idle");
    const [flagCount, setFlagCount] = useState(0);
    const [timer, setTimer] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [cellSize, setCellSize] = useState<number | null>(null);

    const config = DIFFICULTIES[difficulty];

    const startNew = useCallback(() => {
        setBoard(null);
        setGameState("idle");
        setFlagCount(0);
        setTimer(0);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    // Timer
    useEffect(() => {
        if (gameState === "playing") {
            timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameState]);

    const reveal = useCallback((board: Cell[][], r: number, c: number, rows: number, cols: number): Cell[][] => {
        const b = board.map((row) => row.map((cell) => ({ ...cell })));
        const queue: [number, number][] = [[r, c]];

        while (queue.length > 0) {
            const [cr, cc] = queue.shift()!;
            if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
            if (b[cr][cc].state !== "hidden") continue;
            b[cr][cc].state = "revealed";
            if (b[cr][cc].adjacent === 0 && !b[cr][cc].mine) {
                for (let dr = -1; dr <= 1; dr++)
                    for (let dc = -1; dc <= 1; dc++)
                        queue.push([cr + dr, cc + dc]);
            }
        }

        return b;
    }, []);

    const checkWin = useCallback((b: Cell[][], rows: number, cols: number): boolean => {
        for (let r = 0; r < rows; r++)
            for (let c = 0; c < cols; c++)
                if (!b[r][c].mine && b[r][c].state !== "revealed") return false;
        return true;
    }, []);

    const handleClick = useCallback((r: number, c: number) => {
        if (gameState === "won" || gameState === "lost") return;

        // First click — generate board
        if (!board || gameState === "idle") {
            const b = createBoard(config.rows, config.cols, config.mines, r, c);
            const revealed = reveal(b, r, c, config.rows, config.cols);
            setBoard(revealed);
            setGameState("playing");
            if (checkWin(revealed, config.rows, config.cols)) {
                setGameState("won");
            }
            return;
        }

        const cell = board[r][c];
        if (cell.state !== "hidden") return;

        if (cell.mine) {
            // Reveal all mines
            const b = board.map((row) => row.map((ce) => ({
                ...ce,
                state: ce.mine ? "revealed" as CellState : ce.state,
            })));
            b[r][c] = { ...b[r][c], state: "revealed" };
            setBoard(b);
            setGameState("lost");
            return;
        }

        const revealed = reveal(board, r, c, config.rows, config.cols);
        setBoard(revealed);
        if (checkWin(revealed, config.rows, config.cols)) {
            setGameState("won");
        }
    }, [board, gameState, config, reveal, checkWin]);

    const handleRightClick = useCallback((e: React.MouseEvent, r: number, c: number) => {
        e.preventDefault();
        if (gameState !== "playing" && gameState !== "idle") return;
        if (!board) return;

        const cell = board[r][c];
        if (cell.state === "revealed") return;

        const b = board.map((row) => row.map((ce) => ({ ...ce })));
        if (cell.state === "hidden") {
            b[r][c].state = "flagged";
            setFlagCount((f) => f + 1);
        } else {
            b[r][c].state = "hidden";
            setFlagCount((f) => f - 1);
        }
        setBoard(b);
    }, [board, gameState]);

    // Chord click — if revealed number cell has right # of flags around it, reveal remaining
    const handleDoubleClick = useCallback((r: number, c: number) => {
        if (!board || gameState !== "playing") return;
        const cell = board[r][c];
        if (cell.state !== "revealed" || cell.adjacent === 0) return;

        let flagsAround = 0;
        for (let dr = -1; dr <= 1; dr++)
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols && board[nr][nc].state === "flagged")
                    flagsAround++;
            }

        if (flagsAround !== cell.adjacent) return;

        let b = board.map((row) => row.map((ce) => ({ ...ce })));
        let hitMine = false;
        for (let dr = -1; dr <= 1; dr++)
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols && b[nr][nc].state === "hidden") {
                    if (b[nr][nc].mine) {
                        hitMine = true;
                        b = b.map((row) => row.map((ce) => ({
                            ...ce,
                            state: ce.mine ? "revealed" as CellState : ce.state,
                        })));
                    } else {
                        b = reveal(b, nr, nc, config.rows, config.cols);
                    }
                }
            }

        setBoard(b);
        if (hitMine) {
            setGameState("lost");
        } else if (checkWin(b, config.rows, config.cols)) {
            setGameState("won");
        }
    }, [board, gameState, config, reveal, checkWin]);

    // Responsive cell sizing
    useEffect(() => {
        const el = boardAreaRef.current;
        if (!el) return;
        const measure = () => {
            // Use offsetWidth/offsetHeight — unaffected by CSS transforms
            // (getBoundingClientRect reports scaled-down size during window open animation)
            const width = el.offsetWidth;
            const height = el.offsetHeight;
            if (width === 0 || height === 0) return;
            const pad = 24;
            const maxW = Math.floor((width - pad) / config.cols);
            const maxH = Math.floor((height - pad) / config.rows);
            const maxSize = difficulty === "hard" ? 28 : difficulty === "medium" ? 32 : 36;
            setCellSize(Math.max(14, Math.min(maxSize, maxW, maxH)));
        };
        const raf = requestAnimationFrame(measure);
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    }, [config.cols, config.rows, difficulty]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        return `${m}:${String(s % 60).padStart(2, "0")}`;
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-full outline-none"
            style={{ background: COLORS.bg }}
            tabIndex={0}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-2 shrink-0"
                style={{ background: COLORS.headerBg, borderBottom: `1px solid ${COLORS.border}` }}
            >
                <span style={{ color: COLORS.accent, fontWeight: 700, fontSize: 15 }}>💣 Mines</span>
                <div className="flex items-center gap-3">
                    {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                        <button
                            key={d}
                            onClick={() => { setDifficulty(d); startNew(); }}
                            className="px-2 py-0.5 rounded text-xs font-medium transition-colors"
                            style={{
                                background: difficulty === d ? "rgba(137,180,250,0.2)" : "transparent",
                                color: difficulty === d ? COLORS.accent : COLORS.dim,
                                border: difficulty === d ? `1px solid rgba(137,180,250,0.3)` : "1px solid transparent",
                            }}
                        >
                            {DIFFICULTIES[d].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats bar */}
            <div
                className="flex items-center justify-between px-4 py-1.5 shrink-0"
                style={{ background: "rgba(0,0,0,0.15)", borderBottom: `1px solid ${COLORS.border}` }}
            >
                <div className="flex items-center gap-1">
                    <span style={{ fontSize: 14 }}>🚩</span>
                    <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                        {config.mines - flagCount}
                    </span>
                </div>
                <button
                    onClick={startNew}
                    className="text-lg cursor-pointer hover:scale-110 transition-transform"
                    title="New game"
                >
                    {gameState === "won" ? "😎" : gameState === "lost" ? "😵" : "🙂"}
                </button>
                <div className="flex items-center gap-1">
                    <span style={{ fontSize: 14 }}>⏱</span>
                    <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                        {formatTime(timer)}
                    </span>
                </div>
            </div>

            {/* Board */}
            <div ref={boardAreaRef} className="flex-1 flex items-center justify-center overflow-auto p-2">
                {cellSize !== null && (
                <div
                    className="inline-grid gap-[1px] rounded-lg p-1"
                    style={{
                        gridTemplateColumns: `repeat(${config.cols}, ${cellSize}px)`,
                        background: "rgba(255,255,255,0.03)",
                    }}
                >
                    {Array.from({ length: config.rows }, (_, r) =>
                        Array.from({ length: config.cols }, (_, c) => {
                            const cell = board?.[r]?.[c];
                            const isRevealed = cell?.state === "revealed";
                            const isFlagged = cell?.state === "flagged";
                            const isMine = cell?.mine;

                            let bg = COLORS.cellHidden;
                            let content: React.ReactNode = null;
                            let textColor = "";

                            if (isRevealed) {
                                bg = isMine ? COLORS.cellMine : COLORS.cellRevealed;
                                if (isMine) {
                                    content = "💣";
                                } else if (cell!.adjacent > 0) {
                                    content = cell!.adjacent;
                                    textColor = COLORS.numbers[cell!.adjacent] || COLORS.text;
                                }
                            } else if (isFlagged) {
                                content = "🚩";
                            }

                            return (
                                <button
                                    key={`${r}-${c}`}
                                    onClick={() => handleClick(r, c)}
                                    onDoubleClick={() => handleDoubleClick(r, c)}
                                    onContextMenu={(e) => handleRightClick(e, r, c)}
                                    className="flex items-center justify-center font-bold transition-colors cursor-default select-none"
                                    style={{
                                        width: cellSize,
                                        height: cellSize,
                                        background: bg,
                                        borderRadius: 3,
                                        fontSize: cellSize * 0.45,
                                        color: textColor || COLORS.text,
                                        border: isRevealed ? "none" : "1px solid rgba(255,255,255,0.05)",
                                    }}
                                    onMouseOver={(e) => {
                                        if (!isRevealed && !isFlagged && gameState !== "won" && gameState !== "lost") {
                                            e.currentTarget.style.background = COLORS.cellHiddenHover;
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (!isRevealed) {
                                            e.currentTarget.style.background = COLORS.cellHidden;
                                        }
                                    }}
                                >
                                    {content}
                                </button>
                            );
                        })
                    )}
                </div>
                )}
            </div>

            {/* Overlays */}
            {(gameState === "won" || gameState === "lost") && (
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
                    style={{ background: "rgba(30,30,46,0.7)", pointerEvents: "none" }}
                >
                    <div style={{
                        color: gameState === "won" ? COLORS.accent : COLORS.cellMine,
                        fontSize: 28,
                        fontWeight: 700,
                        pointerEvents: "auto",
                    }}>
                        {gameState === "won" ? "🎉 You Win!" : "💥 Game Over"}
                    </div>
                    <div style={{ color: COLORS.dim, fontSize: 14, pointerEvents: "auto" }}>
                        Time: {formatTime(timer)}
                    </div>
                    <button
                        onClick={startNew}
                        className="px-6 py-2 rounded-lg font-semibold text-sm transition-all hover:brightness-110"
                        style={{ background: COLORS.accent, color: "#1e1e2e", pointerEvents: "auto" }}
                    >
                        New Game
                    </button>
                </div>
            )}
        </div>
    );
}
