// Simple audio utility for system sounds
let audioContext: AudioContext | null = null;
let audioReady = false;

function getContext(): AudioContext {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
}

/**
 * Pre-warm AudioContext by creating it and adding one-time interaction
 * listeners that resume it. Call early (e.g. during boot screen) so that
 * by the time we need to play audio, the context is already running.
 */
export function initAudioContext(): void {
    if (typeof window === "undefined" || audioReady) return;

    const ctx = getContext();

    const resume = () => {
        if (ctx.state === "suspended") {
            ctx.resume();
        }
        audioReady = true;
        // Clean up all listeners after first interaction
        for (const evt of events) {
            document.removeEventListener(evt, resume, true);
        }
    };

    // These events cover mouse, keyboard, and touch — one of them will
    // almost certainly fire during the 3+ second boot animation.
    const events = ["mousedown", "mousemove", "keydown", "touchstart", "click", "pointerdown"] as const;
    for (const evt of events) {
        document.addEventListener(evt, resume, { capture: true, once: false });
    }

    // Also try resuming immediately (works if autoplay policy allows it)
    if (ctx.state === "suspended") {
        ctx.resume().then(() => { audioReady = true; }).catch(() => {});
    } else {
        audioReady = true;
    }
}

export function playSound(type: "open" | "close" | "click" | "notification"): void {
    if (typeof window === "undefined") return;

    const ctx = getContext();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Different sounds for different events
    switch (type) {
        case "open":
            oscillator.frequency.setValueAtTime(440, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.15);
            break;
        case "close":
            oscillator.frequency.setValueAtTime(880, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.15);
            break;
        case "click":
            oscillator.frequency.setValueAtTime(600, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.05);
            break;
        case "notification":
            oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
            break;
    }
}

// ---- Helper: play a warm tone (soft sine with envelope) ----
function playTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    volume: number,
    type: OscillatorType = "sine"
) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0, startTime);
    // Soft attack
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.04);
    // Sustain then release
    gain.gain.setValueAtTime(volume, startTime + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
}

/**
 * Ubuntu-style login sound — warm bongo/marimba-like chord progression.
 * A rising 4-note melodic motif (E4 → G4 → B4 → E5) with octave shimmer
 * and a warm E3 body pad. ~1.1s duration.
 */
export function playLoginSound(): void {
    if (typeof window === "undefined") return;
    try {
        const ctx = getContext();
        if (ctx.state === "suspended") ctx.resume();
        const t = ctx.currentTime;
        const vol = 0.12;

        // Note 1: E4 — warm opening
        playTone(ctx, 329.63, t, 0.35, vol);
        playTone(ctx, 659.25, t, 0.35, vol * 0.4); // octave shimmer

        // Note 2: G4 — rise
        playTone(ctx, 392.0, t + 0.18, 0.3, vol);
        playTone(ctx, 783.99, t + 0.18, 0.3, vol * 0.3);

        // Note 3: B4 — peak
        playTone(ctx, 493.88, t + 0.36, 0.35, vol * 0.9);
        playTone(ctx, 987.77, t + 0.36, 0.35, vol * 0.25);

        // Note 4: E5 — resolve
        playTone(ctx, 659.25, t + 0.55, 0.55, vol * 0.7);
        playTone(ctx, 1318.51, t + 0.55, 0.55, vol * 0.15);

        // Subtle low body tone
        playTone(ctx, 164.81, t, 1.0, vol * 0.25); // E3 pad
    } catch {
        // Audio not available — fail silently
    }
}

/**
 * Ubuntu-style screen unlock sound — a quick bright two-note chime.
 * G4 → D5 rising interval. ~0.55s duration.
 */
export function playUnlockSound(): void {
    if (typeof window === "undefined") return;
    try {
        const ctx = getContext();
        if (ctx.state === "suspended") ctx.resume();
        const t = ctx.currentTime;
        const vol = 0.1;

        // Note 1: G4
        playTone(ctx, 392.0, t, 0.22, vol);
        playTone(ctx, 783.99, t, 0.22, vol * 0.3);

        // Note 2: D5 — bright resolve
        playTone(ctx, 587.33, t + 0.14, 0.4, vol * 0.85);
        playTone(ctx, 1174.66, t + 0.14, 0.4, vol * 0.2);

        // Low body
        playTone(ctx, 196.0, t, 0.5, vol * 0.2); // G3 pad
    } catch {
        // Audio not available — fail silently
    }
}

/**
 * Ubuntu-style lock sound — a soft descending two-note motif.
 * D5 → A4 falling interval with muted tones. ~0.4s duration.
 */
export function playLockSound(): void {
    if (typeof window === "undefined") return;
    try {
        const ctx = getContext();
        if (ctx.state === "suspended") ctx.resume();
        const t = ctx.currentTime;
        const vol = 0.08;

        // Note 1: D5 — soft start
        playTone(ctx, 587.33, t, 0.2, vol);
        playTone(ctx, 1174.66, t, 0.2, vol * 0.15);

        // Note 2: A4 — descend and settle
        playTone(ctx, 440.0, t + 0.13, 0.3, vol * 0.7);
        playTone(ctx, 880.0, t + 0.13, 0.3, vol * 0.15);

        // Low body — muted
        playTone(ctx, 220.0, t, 0.4, vol * 0.15); // A3 pad
    } catch {
        // Audio not available — fail silently
    }
}