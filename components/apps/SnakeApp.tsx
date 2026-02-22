"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Pos = { x: number; y: number };

const CELL = 18;
const MIN_COLS = 10;
const MIN_ROWS = 10;
const TICK_MS = 150;

const COLORS = {
    bg: "#1e1e2e",
    grid: "#2a2a3c",
    snakeHead: "#a6e3a1",
    snakeBody: "#74c7a0",
    food: "#f38ba8",
    foodGlow: "rgba(243,139,168,0.35)",
    text: "#cdd6f4",
    dim: "#6c7086",
    accent: "#89b4fa",
    gameover: "#f38ba8",
};

function randomFood(snake: Pos[], cols: number, rows: number): Pos {
    let pos: Pos;
    do {
        pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
}

interface GameData {
    snake: Pos[];
    dir: Direction;
    nextDir: Direction;
    food: Pos;
    score: number;
    tick: number;
    cols: number;
    rows: number;
}

function createGameState(cols: number, rows: number): GameData {
    const dirs: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];
    const d = dirs[Math.floor(Math.random() * dirs.length)];
    const sx = Math.floor(Math.random() * (cols - 4)) + 2;
    const sy = Math.floor(Math.random() * (rows - 4)) + 2;
    const snake = [{ x: sx, y: sy }];
    return { snake, dir: d, nextDir: d, food: randomFood(snake, cols, rows), score: 0, tick: 0, cols, rows };
}

export function SnakeApp() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        if (typeof window !== "undefined") {
            return parseInt(localStorage.getItem("snake-high") || "0", 10);
        }
        return 0;
    });
    const [state, setState] = useState<"idle" | "playing" | "paused" | "gameover">("idle");

    const gameRef = useRef<GameData>(createGameState(MIN_COLS, MIN_ROWS));

    // Measure container and update grid dimensions
    const measureGrid = useCallback(() => {
        const el = boardRef.current;
        if (!el) return;
        const { width, height } = el.getBoundingClientRect();
        const cols = Math.max(MIN_COLS, Math.floor(width / CELL));
        const rows = Math.max(MIN_ROWS, Math.floor(height / CELL));
        const g = gameRef.current;
        g.cols = cols;
        g.rows = rows;
        // Clamp snake positions within new bounds
        g.snake.forEach((s) => {
            if (s.x >= cols) s.x = cols - 1;
            if (s.y >= rows) s.y = rows - 1;
        });
        // Re-place food if out of bounds
        if (g.food.x >= cols || g.food.y >= rows) {
            g.food = randomFood(g.snake, cols, rows);
        }
    }, []);

    // Responsive sizing via ResizeObserver
    useEffect(() => {
        const el = boardRef.current;
        if (!el) return;
        measureGrid();
        const ro = new ResizeObserver(() => measureGrid());
        ro.observe(el);
        return () => ro.disconnect();
    }, [measureGrid]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const g = gameRef.current;
        const W = g.cols * CELL;
        const H = g.rows * CELL;
        canvas.width = W;
        canvas.height = H;

        // BG
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, W, H);

        // Grid dots
        ctx.fillStyle = COLORS.grid;
        for (let x = 0; x < g.cols; x++) {
            for (let y = 0; y < g.rows; y++) {
                ctx.fillRect(x * CELL + CELL / 2, y * CELL + CELL / 2, 1, 1);
            }
        }

        // Food glow
        const fx = g.food.x * CELL + CELL / 2;
        const fy = g.food.y * CELL + CELL / 2;
        const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, CELL * 1.5);
        glow.addColorStop(0, COLORS.foodGlow);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(fx - CELL * 2, fy - CELL * 2, CELL * 4, CELL * 4);

        // Food
        ctx.fillStyle = COLORS.food;
        ctx.beginPath();
        ctx.arc(fx, fy, CELL / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // Snake
        g.snake.forEach((seg, i) => {
            const isHead = i === 0;
            const r = isHead ? CELL / 2 - 1 : CELL / 2 - 2;
            ctx.fillStyle = isHead ? COLORS.snakeHead : COLORS.snakeBody;
            ctx.globalAlpha = isHead ? 1 : 0.7 + 0.3 * (1 - i / g.snake.length);
            ctx.beginPath();
            ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, r);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }, []);

    const reset = useCallback(() => {
        measureGrid();
        const g = gameRef.current;
        const dirs: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];
        const d = dirs[Math.floor(Math.random() * dirs.length)];
        const sx = Math.floor(Math.random() * (g.cols - 4)) + 2;
        const sy = Math.floor(Math.random() * (g.rows - 4)) + 2;
        g.snake = [{ x: sx, y: sy }];
        g.dir = d;
        g.nextDir = d;
        g.food = randomFood(g.snake, g.cols, g.rows);
        g.score = 0;
        g.tick = 0;
        setScore(0);
    }, [measureGrid]);

    const startGame = useCallback(() => {
        reset();
        setState("playing");
    }, [reset]);

    // Game loop
    useEffect(() => {
        if (state !== "playing") return;
        const g = gameRef.current;

        const interval = setInterval(() => {
            g.dir = g.nextDir;
            const head = { ...g.snake[0] };

            switch (g.dir) {
                case "UP": head.y--; break;
                case "DOWN": head.y++; break;
                case "LEFT": head.x--; break;
                case "RIGHT": head.x++; break;
            }

            // Wrap through window edges
            if (head.x < 0) head.x = g.cols - 1;
            else if (head.x >= g.cols) head.x = 0;
            if (head.y < 0) head.y = g.rows - 1;
            else if (head.y >= g.rows) head.y = 0;

            // Self collision
            if (g.snake.some((s) => s.x === head.x && s.y === head.y)) {
                setState("gameover");
                return;
            }

            g.snake.unshift(head);

            // Eat food
            if (head.x === g.food.x && head.y === g.food.y) {
                g.score += 10;
                setScore(g.score);
                if (g.score > highScore) {
                    setHighScore(g.score);
                    localStorage.setItem("snake-high", String(g.score));
                }
                g.food = randomFood(g.snake, g.cols, g.rows);
            } else {
                g.snake.pop();
            }

            g.tick++;
            draw();
        }, TICK_MS);

        draw();
        return () => clearInterval(interval);
    }, [state, draw, highScore]);

    // Keyboard controls
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const g = gameRef.current;

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

            const keyMap: Record<string, Direction> = {
                ArrowUp: "UP", w: "UP", W: "UP",
                ArrowDown: "DOWN", s: "DOWN", S: "DOWN",
                ArrowLeft: "LEFT", a: "LEFT", A: "LEFT",
                ArrowRight: "RIGHT", d: "RIGHT", D: "RIGHT",
            };

            const newDir = keyMap[e.key];
            if (!newDir) return;
            e.preventDefault();

            // Prevent 180° turn
            const opposites: Record<Direction, Direction> = {
                UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT",
            };
            if (opposites[newDir] !== g.dir) {
                g.nextDir = newDir;
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
    }, [state, startGame]);

    // Initial draw
    useEffect(() => { draw(); }, [draw]);

    // Touch controls
    const touchRef = useRef<{ x: number; y: number } | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchRef.current || state !== "playing") return;
        const dx = e.changedTouches[0].clientX - touchRef.current.x;
        const dy = e.changedTouches[0].clientY - touchRef.current.y;
        const g = gameRef.current;
        const opposites: Record<Direction, Direction> = {
            UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT",
        };

        if (Math.abs(dx) > Math.abs(dy)) {
            const d = dx > 0 ? "RIGHT" : "LEFT";
            if (opposites[d] !== g.dir) g.nextDir = d;
        } else {
            const d = dy > 0 ? "DOWN" : "UP";
            if (opposites[d] !== g.dir) g.nextDir = d;
        }
        touchRef.current = null;
    };

    return (
        <div
            ref={containerRef}
            tabIndex={0}
            className="flex flex-col h-full outline-none"
            style={{ background: COLORS.bg }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Header bar */}
            <div
                className="flex items-center justify-between px-4 py-2 shrink-0"
                style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
                <div className="flex items-center gap-3">
                    <span style={{ color: COLORS.snakeHead, fontWeight: 700, fontSize: 15 }}>🐍 Snake</span>
                </div>
                <div className="flex items-center gap-4">
                    <span style={{ color: COLORS.dim, fontSize: 12 }}>HIGH: {highScore}</span>
                    <span style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>SCORE: {score}</span>
                </div>
            </div>

            {/* Game canvas — fills entire remaining space */}
            <div ref={boardRef} className="flex-1 relative overflow-hidden">
                <canvas
                    ref={canvasRef}
                    style={{ position: "absolute", top: 0, left: 0, imageRendering: "pixelated" }}
                />

                {/* Overlays */}
                {state === "idle" && (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                        style={{ background: "rgba(30,30,46,0.85)" }}
                    >
                        <div style={{ fontSize: 48 }}>🐍</div>
                        <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 700 }}>Snake</div>
                        <button
                            onClick={startGame}
                            className="px-6 py-2 rounded-lg font-semibold text-sm transition-all hover:brightness-110"
                            style={{ background: COLORS.accent, color: "#1e1e2e" }}
                        >
                            New Game
                        </button>
                        <div style={{ color: COLORS.dim, fontSize: 11, marginTop: 8 }}>
                            Arrow keys or WASD to move • P to pause
                        </div>
                    </div>
                )}

                {state === "paused" && (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                        style={{ background: "rgba(30,30,46,0.8)" }}
                    >
                        <div style={{ color: COLORS.accent, fontSize: 24, fontWeight: 700 }}>PAUSED</div>
                        <div style={{ color: COLORS.dim, fontSize: 12 }}>Press P or Esc to resume</div>
                    </div>
                )}

                {state === "gameover" && (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                        style={{ background: "rgba(30,30,46,0.88)" }}
                    >
                        <div style={{ color: COLORS.gameover, fontSize: 24, fontWeight: 700 }}>GAME OVER</div>
                        <div style={{ color: COLORS.text, fontSize: 16 }}>Score: {score}</div>
                        {score >= highScore && score > 0 && (
                            <div style={{ color: COLORS.accent, fontSize: 13, fontWeight: 600 }}>🎉 New High Score!</div>
                        )}
                        <button
                            onClick={startGame}
                            className="px-6 py-2 rounded-lg font-semibold text-sm transition-all hover:brightness-110 mt-2"
                            style={{ background: COLORS.accent, color: "#1e1e2e" }}
                        >
                            Play Again
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile d-pad */}
            <div
                className="flex justify-center gap-1 py-3 shrink-0 sm:hidden"
                style={{ background: "rgba(0,0,0,0.2)" }}
            >
                {(["UP", "LEFT", "DOWN", "RIGHT"] as Direction[]).map((d) => (
                    <button
                        key={d}
                        onClick={() => {
                            if (state !== "playing") return;
                            const g = gameRef.current;
                            const opposites: Record<Direction, Direction> = {
                                UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT",
                            };
                            if (opposites[d] !== g.dir) g.nextDir = d;
                        }}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ background: "rgba(255,255,255,0.08)", color: COLORS.text }}
                    >
                        {{ UP: "↑", DOWN: "↓", LEFT: "←", RIGHT: "→" }[d]}
                    </button>
                ))}
            </div>
        </div>
    );
}
