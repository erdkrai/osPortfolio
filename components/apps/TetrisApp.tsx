"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

// ── Tetris constants ──
const COLS = 10;
const ROWS = 20;
const CELL = 24;
const TICK_BASE = 800; // ms per drop at level 1
const TICK_MIN = 80;
const LINES_PER_LEVEL = 10;

const COLORS = {
    bg: "#1e1e2e",
    grid: "#252536",
    ghost: "rgba(255,255,255,0.08)",
    text: "#cdd6f4",
    dim: "#6c7086",
    accent: "#89b4fa",
    gameover: "#f38ba8",
};

// Tetromino shapes (SRS)
const SHAPES: Record<string, { shape: number[][]; color: string }> = {
    I: { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: "#89dceb" },
    O: { shape: [[1,1],[1,1]], color: "#f9e2af" },
    T: { shape: [[0,1,0],[1,1,1],[0,0,0]], color: "#cba6f7" },
    S: { shape: [[0,1,1],[1,1,0],[0,0,0]], color: "#a6e3a1" },
    Z: { shape: [[1,1,0],[0,1,1],[0,0,0]], color: "#f38ba8" },
    J: { shape: [[1,0,0],[1,1,1],[0,0,0]], color: "#89b4fa" },
    L: { shape: [[0,0,1],[1,1,1],[0,0,0]], color: "#fab387" },
};

const PIECE_KEYS = Object.keys(SHAPES);

type Board = (string | null)[][];

function createBoard(): Board {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function rotate(matrix: number[][]): number[][] {
    const N = matrix.length;
    const r: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
    for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++)
            r[x][N - 1 - y] = matrix[y][x];
    return r;
}

function collides(board: Board, shape: number[][], px: number, py: number): boolean {
    for (let y = 0; y < shape.length; y++)
        for (let x = 0; x < shape[y].length; x++)
            if (shape[y][x]) {
                const bx = px + x;
                const by = py + y;
                if (bx < 0 || bx >= COLS || by >= ROWS) return true;
                if (by >= 0 && board[by][bx]) return true;
            }
    return false;
}

function merge(board: Board, shape: number[][], px: number, py: number, color: string): Board {
    const b = board.map((r) => [...r]);
    for (let y = 0; y < shape.length; y++)
        for (let x = 0; x < shape[y].length; x++)
            if (shape[y][x]) {
                const by = py + y;
                const bx = px + x;
                if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
                    b[by][bx] = color;
                }
            }
    return b;
}

function clearLines(board: Board): { board: Board; cleared: number } {
    const remaining = board.filter((row) => row.some((c) => !c));
    const cleared = ROWS - remaining.length;
    while (remaining.length < ROWS) remaining.unshift(Array(COLS).fill(null));
    return { board: remaining, cleared };
}

function getGhostY(board: Board, shape: number[][], px: number, py: number): number {
    let gy = py;
    while (!collides(board, shape, px, gy + 1)) gy++;
    return gy;
}

function randomBag(): string[] {
    const bag = [...PIECE_KEYS];
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
}

export function TetrisApp() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const [lines, setLines] = useState(0);
    const [level, setLevel] = useState(1);
    const [state, setState] = useState<"idle" | "playing" | "paused" | "gameover">("idle");
    const [highScore, setHighScore] = useState(() => {
        if (typeof window !== "undefined") return parseInt(localStorage.getItem("tetris-high") || "0", 10);
        return 0;
    });

    const gameRef = useRef({
        board: createBoard(),
        piece: null as null | { key: string; shape: number[][]; color: string; x: number; y: number },
        bag: [] as string[],
        nextKey: "" as string,
        heldKey: null as string | null,
        canHold: true,
        score: 0,
        lines: 0,
        level: 1,
    });

    const spawnPiece = useCallback((key?: string) => {
        const g = gameRef.current;
        if (g.bag.length === 0) g.bag = randomBag();
        const k = key || g.bag.pop()!;
        if (g.bag.length === 0) g.bag = randomBag();
        g.nextKey = g.bag[g.bag.length - 1];
        const def = SHAPES[k];
        const px = Math.floor((COLS - def.shape[0].length) / 2);
        g.piece = { key: k, shape: def.shape, color: def.color, x: px, y: -1 };
        g.canHold = true;
        if (collides(g.board, def.shape, px, 0)) {
            setState("gameover");
        }
    }, []);

    const lockPiece = useCallback(() => {
        const g = gameRef.current;
        if (!g.piece) return;
        g.board = merge(g.board, g.piece.shape, g.piece.x, g.piece.y, g.piece.color);
        const { board, cleared } = clearLines(g.board);
        g.board = board;
        const pts = [0, 100, 300, 500, 800][cleared] || 0;
        g.score += pts * g.level;
        g.lines += cleared;
        g.level = Math.floor(g.lines / LINES_PER_LEVEL) + 1;
        setScore(g.score);
        setLines(g.lines);
        setLevel(g.level);
        if (g.score > highScore) {
            setHighScore(g.score);
            localStorage.setItem("tetris-high", String(g.score));
        }
        spawnPiece();
    }, [spawnPiece, highScore]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const g = gameRef.current;
        const W = COLS * CELL;
        const H = ROWS * CELL;
        canvas.width = W;
        canvas.height = H;

        // BG
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= COLS; x++) {
            ctx.beginPath();
            ctx.moveTo(x * CELL, 0);
            ctx.lineTo(x * CELL, H);
            ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * CELL);
            ctx.lineTo(W, y * CELL);
            ctx.stroke();
        }

        // Locked blocks
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (g.board[y][x]) {
                    ctx.fillStyle = g.board[y][x]!;
                    ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
                    ctx.fillStyle = "rgba(255,255,255,0.15)";
                    ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, 3);
                }
            }
        }

        // Ghost + active piece
        if (g.piece) {
            const gy = getGhostY(g.board, g.piece.shape, g.piece.x, g.piece.y);
            // Ghost
            for (let y = 0; y < g.piece.shape.length; y++)
                for (let x = 0; x < g.piece.shape[y].length; x++)
                    if (g.piece.shape[y][x]) {
                        const bx = g.piece.x + x;
                        const by = gy + y;
                        if (by >= 0) {
                            ctx.fillStyle = COLORS.ghost;
                            ctx.fillRect(bx * CELL + 1, by * CELL + 1, CELL - 2, CELL - 2);
                        }
                    }
            // Active
            for (let y = 0; y < g.piece.shape.length; y++)
                for (let x = 0; x < g.piece.shape[y].length; x++)
                    if (g.piece.shape[y][x]) {
                        const bx = g.piece.x + x;
                        const by = g.piece.y + y;
                        if (by >= 0) {
                            ctx.fillStyle = g.piece.color;
                            ctx.fillRect(bx * CELL + 1, by * CELL + 1, CELL - 2, CELL - 2);
                            ctx.fillStyle = "rgba(255,255,255,0.2)";
                            ctx.fillRect(bx * CELL + 1, by * CELL + 1, CELL - 2, 3);
                        }
                    }
        }
    }, []);

    const moveX = useCallback((dx: number) => {
        const g = gameRef.current;
        if (!g.piece) return;
        if (!collides(g.board, g.piece.shape, g.piece.x + dx, g.piece.y)) {
            g.piece.x += dx;
            draw();
        }
    }, [draw]);

    const rotatePiece = useCallback(() => {
        const g = gameRef.current;
        if (!g.piece || g.piece.key === "O") return;
        const rotated = rotate(g.piece.shape);
        // Wall kicks: try 0, -1, +1, -2, +2
        for (const kick of [0, -1, 1, -2, 2]) {
            if (!collides(g.board, rotated, g.piece.x + kick, g.piece.y)) {
                g.piece.shape = rotated;
                g.piece.x += kick;
                draw();
                return;
            }
        }
    }, [draw]);

    const hardDrop = useCallback(() => {
        const g = gameRef.current;
        if (!g.piece) return;
        const gy = getGhostY(g.board, g.piece.shape, g.piece.x, g.piece.y);
        g.score += (gy - g.piece.y) * 2;
        g.piece.y = gy;
        setScore(g.score);
        draw();
        lockPiece();
    }, [draw, lockPiece]);

    const holdPiece = useCallback(() => {
        const g = gameRef.current;
        if (!g.piece || !g.canHold) return;
        g.canHold = false;
        const curKey = g.piece.key;
        if (g.heldKey) {
            spawnPiece(g.heldKey);
        } else {
            spawnPiece();
        }
        g.heldKey = curKey;
        draw();
    }, [draw, spawnPiece]);

    const reset = useCallback(() => {
        const g = gameRef.current;
        g.board = createBoard();
        g.piece = null;
        g.bag = randomBag();
        g.nextKey = g.bag[g.bag.length - 1];
        g.heldKey = null;
        g.canHold = true;
        g.score = 0;
        g.lines = 0;
        g.level = 1;
        setScore(0);
        setLines(0);
        setLevel(1);
    }, []);

    const startGame = useCallback(() => {
        reset();
        spawnPiece();
        setState("playing");
    }, [reset, spawnPiece]);

    // Game loop — gravity
    useEffect(() => {
        if (state !== "playing") return;
        const g = gameRef.current;
        const tickMs = Math.max(TICK_MIN, TICK_BASE - (g.level - 1) * 60);

        const interval = setInterval(() => {
            if (!g.piece) return;
            if (!collides(g.board, g.piece.shape, g.piece.x, g.piece.y + 1)) {
                g.piece.y++;
            } else {
                lockPiece();
            }
            draw();
        }, tickMs);

        draw();
        return () => clearInterval(interval);
    }, [state, level, draw, lockPiece]);

    // Keyboard
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (state === "idle" || state === "gameover") {
                if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    startGame();
                }
                return;
            }

            if (state === "playing" || state === "paused") {
                if (e.key === "p" || e.key === "P" || e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    setState(state === "paused" ? "playing" : "paused");
                    return;
                }
            }

            if (state !== "playing") return;
            e.preventDefault();

            switch (e.key) {
                case "ArrowLeft": case "a": case "A": moveX(-1); break;
                case "ArrowRight": case "d": case "D": moveX(1); break;
                case "ArrowDown": case "s": case "S": {
                    const g = gameRef.current;
                    if (g.piece && !collides(g.board, g.piece.shape, g.piece.x, g.piece.y + 1)) {
                        g.piece.y++;
                        g.score += 1;
                        setScore(g.score);
                        draw();
                    }
                    break;
                }
                case "ArrowUp": case "w": case "W": rotatePiece(); break;
                case " ": hardDrop(); break;
                case "c": case "C": holdPiece(); break;
            }
        };

        const el = containerRef.current;
        if (el) {
            el.addEventListener("keydown", handleKey);
            el.focus();
        }
        return () => {
            if (el) el.removeEventListener("keydown", handleKey);
        };
    }, [state, startGame, moveX, rotatePiece, hardDrop, holdPiece, draw]);

    useEffect(() => { draw(); }, [draw]);

    // Mini-piece preview renderer
    const renderMiniPiece = (key: string | null, size: number = 12) => {
        if (!key) return null;
        const def = SHAPES[key];
        if (!def) return null;
        return (
            <div className="flex flex-col items-center">
                {def.shape.map((row, y) => (
                    <div key={y} className="flex">
                        {row.map((cell, x) => (
                            <div
                                key={x}
                                style={{
                                    width: size,
                                    height: size,
                                    background: cell ? def.color : "transparent",
                                    borderRadius: cell ? 2 : 0,
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div
            ref={containerRef}
            tabIndex={0}
            className="flex flex-col h-full outline-none"
            style={{ background: COLORS.bg }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-2 shrink-0"
                style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
                <span style={{ color: COLORS.accent, fontWeight: 700, fontSize: 15 }}>🧱 Tetris</span>
                <span style={{ color: COLORS.dim, fontSize: 12 }}>HIGH: {highScore}</span>
            </div>

            {/* Game area */}
            <div className="flex-1 flex items-start justify-center gap-4 py-3 px-2 overflow-hidden">
                {/* Side panel: Hold */}
                <div className="flex flex-col items-center gap-3 pt-1" style={{ minWidth: 54 }}>
                    <div style={{ color: COLORS.dim, fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>HOLD</div>
                    <div
                        className="w-[54px] h-[54px] flex items-center justify-center rounded-lg"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                        {renderMiniPiece(gameRef.current.heldKey)}
                    </div>
                    <div className="mt-4 flex flex-col items-center gap-1">
                        <div style={{ color: COLORS.dim, fontSize: 10, fontWeight: 600 }}>SCORE</div>
                        <div style={{ color: COLORS.text, fontSize: 14, fontWeight: 700 }}>{score}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div style={{ color: COLORS.dim, fontSize: 10, fontWeight: 600 }}>LINES</div>
                        <div style={{ color: COLORS.text, fontSize: 14, fontWeight: 700 }}>{lines}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div style={{ color: COLORS.dim, fontSize: 10, fontWeight: 600 }}>LEVEL</div>
                        <div style={{ color: COLORS.accent, fontSize: 14, fontWeight: 700 }}>{level}</div>
                    </div>
                </div>

                {/* Board */}
                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        style={{
                            width: COLS * CELL,
                            height: ROWS * CELL,
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 4,
                        }}
                    />

                    {state === "idle" && (
                        <div
                            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                            style={{ background: "rgba(30,30,46,0.88)", borderRadius: 4 }}
                        >
                            <div style={{ fontSize: 48 }}>🧱</div>
                            <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 700 }}>Tetris</div>
                            <button
                                onClick={startGame}
                                className="px-6 py-2 rounded-lg font-semibold text-sm transition-all hover:brightness-110"
                                style={{ background: COLORS.accent, color: "#1e1e2e" }}
                            >
                                New Game
                            </button>
                            <div style={{ color: COLORS.dim, fontSize: 10, textAlign: "center", lineHeight: 1.5 }}>
                                ← → Move • ↑ Rotate • ↓ Soft drop<br />
                                Space Hard drop • C Hold • P Pause
                            </div>
                        </div>
                    )}

                    {state === "paused" && (
                        <div
                            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                            style={{ background: "rgba(30,30,46,0.8)", borderRadius: 4 }}
                        >
                            <div style={{ color: COLORS.accent, fontSize: 24, fontWeight: 700 }}>PAUSED</div>
                            <div style={{ color: COLORS.dim, fontSize: 12 }}>Press P or Esc to resume</div>
                        </div>
                    )}

                    {state === "gameover" && (
                        <div
                            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                            style={{ background: "rgba(30,30,46,0.88)", borderRadius: 4 }}
                        >
                            <div style={{ color: COLORS.gameover, fontSize: 24, fontWeight: 700 }}>GAME OVER</div>
                            <div style={{ color: COLORS.text, fontSize: 16 }}>Score: {score}</div>
                            <div style={{ color: COLORS.dim, fontSize: 13 }}>Level {level} • {lines} lines</div>
                            {score >= highScore && score > 0 && (
                                <div style={{ color: COLORS.accent, fontSize: 13, fontWeight: 600 }}>🎉 New High Score!</div>
                            )}
                            <button
                                onClick={startGame}
                                className="px-6 py-2 rounded-lg font-semibold text-sm transition-all hover:brightness-110 mt-1"
                                style={{ background: COLORS.accent, color: "#1e1e2e" }}
                            >
                                Play Again
                            </button>
                        </div>
                    )}
                </div>

                {/* Side panel: Next */}
                <div className="flex flex-col items-center gap-3 pt-1" style={{ minWidth: 54 }}>
                    <div style={{ color: COLORS.dim, fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>NEXT</div>
                    <div
                        className="w-[54px] h-[54px] flex items-center justify-center rounded-lg"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                        {renderMiniPiece(gameRef.current.nextKey)}
                    </div>
                </div>
            </div>
        </div>
    );
}
