"use client";

import { useForm } from "react-hook-form";
import { socials } from "@/data/socials";
import { clsx } from "clsx";
import { useWindowStore } from "@/store/windows";

interface FormData {
    name: string;
    email: string;
    message: string;
}

function SocialIcon({ icon }: { icon: string }) {
    const map: Record<string, React.ReactNode> = {
        github: (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
        ),
        linkedin: (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
        twitter: (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
        email: (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
        ),
        globe: (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
        ),
    };
    return <>{map[icon] || null}</>;
}

export function ContactApp() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm<FormData>();

    const onSubmit = (data: FormData) => {
        const mailto = `mailto:hello@yourname.dev?subject=Portfolio contact from ${encodeURIComponent(data.name)}&body=${encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`)}`;
        const a = document.createElement("a");
        a.href = mailto;
        a.click();
        reset();
    };

    const inputStyle = {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        padding: "10px 14px",
        color: "#e0e0e0",
        fontSize: "14px",
        width: "100%",
        outline: "none",
        transition: "border-color 0.15s",
    };

    const inputErrorStyle = { ...inputStyle, borderColor: "rgba(240,80,96,0.5)" };

    return (
        <div className="h-full overflow-y-auto px-6 py-5 space-y-5" style={{ color: "#e0e0e0" }}>
            <div>
                <h2 className="text-base font-semibold text-white">Get in Touch</h2>
                <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Have a project in mind? I&apos;d love to hear from you.
                </p>
            </div>

            {isSubmitSuccessful && (
                <div
                    className="rounded-lg px-4 py-3 text-sm"
                    style={{ background: "rgba(86,195,85,0.1)", border: "1px solid rgba(86,195,85,0.2)", color: "#56c355" }}
                >
                    ✓ Thanks! Your default email app should open shortly.
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
                <div>
                    <label htmlFor="contact-name" className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Name</label>
                    <input
                        id="contact-name"
                        type="text"
                        placeholder="Your name"
                        style={errors.name ? inputErrorStyle : inputStyle}
                        aria-invalid={!!errors.name}
                        {...register("name", { required: "Name is required" })}
                    />
                    {errors.name && <p className="text-xs mt-1" style={{ color: "#f05060" }}>{errors.name.message}</p>}
                </div>

                <div>
                    <label htmlFor="contact-email" className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Email</label>
                    <input
                        id="contact-email"
                        type="email"
                        placeholder="you@example.com"
                        style={errors.email ? inputErrorStyle : inputStyle}
                        aria-invalid={!!errors.email}
                        {...register("email", {
                            required: "Email is required",
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                        })}
                    />
                    {errors.email && <p className="text-xs mt-1" style={{ color: "#f05060" }}>{errors.email.message}</p>}
                </div>

                <div>
                    <label htmlFor="contact-message" className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Message</label>
                    <textarea
                        id="contact-message"
                        rows={4}
                        placeholder="Tell me about your project..."
                        style={errors.message ? { ...inputErrorStyle, resize: "none" } : { ...inputStyle, resize: "none" }}
                        aria-invalid={!!errors.message}
                        {...register("message", {
                            required: "Message is required",
                            minLength: { value: 10, message: "Message must be at least 10 characters" },
                        })}
                    />
                    {errors.message && <p className="text-xs mt-1" style={{ color: "#f05060" }}>{errors.message.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={clsx(
                        "w-full py-2.5 rounded-lg text-white text-sm font-medium transition-all focus:outline-none",
                        isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:brightness-110 active:scale-[0.99]"
                    )}
                    style={{ background: "#E95420" }}
                    aria-label="Send message"
                >
                    {isSubmitting ? "Preparing..." : "Send Message →"}
                </button>
            </form>

            {/* Socials */}
            <div style={{ paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Or find me at</p>
                <div className="flex flex-wrap gap-2">
                    {socials.map((s) => (
                        <a
                            key={s.label}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={s.label}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 focus:outline-none"
                            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                            <SocialIcon icon={s.icon} />
                            {s.label}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
