import { useNavigate } from "react-router-dom";
import {
    Zap, Calendar, Users, FileText, Package, MessageSquare,
    BarChart3, Shield, Globe, ArrowRight, Check, Star,
    Sparkles, Clock, Bot, ChevronRight, Phone, Mail
} from "lucide-react";

const features = [
    { icon: Calendar, title: "Smart Booking", desc: "Automated scheduling with conflict detection, availability management, and public booking links for your clients.", color: "#6366f1" },
    { icon: Users, title: "CRM & Contacts", desc: "Manage your entire client base with detailed profiles, communication history, and automated follow-ups.", color: "#8b5cf6" },
    { icon: MessageSquare, title: "Unified Inbox", desc: "All client conversations in one place. Auto-replies, smart routing, and never miss a message again.", color: "#ec4899" },
    { icon: FileText, title: "Digital Forms", desc: "Create custom intake forms, auto-send before appointments, and collect client data seamlessly.", color: "#f59e0b" },
    { icon: Package, title: "Inventory Tracking", desc: "Real-time stock monitoring with low-stock alerts, usage tracking, and automated reorder notifications.", color: "#10b981" },
    { icon: BarChart3, title: "Analytics & Reports", desc: "Deep insights into your business. Revenue trends, booking patterns, client retention, and team performance.", color: "#3b82f6" },
    { icon: Bot, title: "Automation Engine", desc: "Set up triggers and actions. Welcome emails, booking confirmations, follow-ups — all on autopilot.", color: "#ef4444" },
    { icon: Shield, title: "Team & Permissions", desc: "Invite your team, assign roles, and control who sees what. Built-in collaboration tools.", color: "#14b8a6" },
    { icon: Globe, title: "Public Portal", desc: "Branded booking pages, contact forms, and client portal. Share links and let clients self-serve.", color: "#f97316" },
];

const testimonials = [
    { name: "Dr. Sarah Chen", role: "Wellness Clinic Owner", text: "CareOps replaced 5 different tools we were using. Our no-show rate dropped 40% with automated confirmations.", avatar: "SC", rating: 5 },
    { name: "Marcus Johnson", role: "Salon Manager", text: "The booking system is incredible. Clients love being able to book online, and the forms auto-send before their appointment.", avatar: "MJ", rating: 5 },
    { name: "Emily Rodriguez", role: "Physical Therapy Practice", text: "Inventory tracking alone saved us thousands. We never run out of supplies anymore, and the alerts are spot-on.", avatar: "ER", rating: 5 },
];

const plans = [
    { name: "Starter", price: "Free", period: "", desc: "For solo practitioners", features: ["Up to 50 contacts", "Basic booking", "1 service", "Email support"], cta: "Start Free", popular: false },
    { name: "Professional", price: "$29", period: "/month", desc: "For growing businesses", features: ["Unlimited contacts", "Advanced booking", "Unlimited services", "Forms & inventory", "Automation engine", "Analytics dashboard", "Priority support"], cta: "Start Trial", popular: true },
    { name: "Enterprise", price: "$79", period: "/month", desc: "For multi-location teams", features: ["Everything in Pro", "Multi-workspace", "Custom integrations", "API access", "Dedicated manager", "SLA guarantee", "White-label options"], cta: "Contact Sales", popular: false },
];

const stats = [
    { value: "12K+", label: "Active Businesses" },
    { value: "2.4M", label: "Bookings Managed" },
    { value: "98%", label: "Uptime SLA" },
    { value: "4.9★", label: "Average Rating" },
];

export default function Landing() {
    const nav = useNavigate();

    return (
        <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
            {/* ─── Navbar ─── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 40px",
                background: "var(--bg-glass)",
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid var(--border-light)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 38, height: 38,
                        background: "linear-gradient(135deg, #6366f1, #a855f7)",
                        borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white"
                    }}><Zap size={20} /></div>
                    <span style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.03em" }}>CareOps</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button className="btn btn-ghost" onClick={() => nav("/login")}>Sign In</button>
                    <button className="btn btn-primary" onClick={() => nav("/register")}>
                        Get Started <ArrowRight size={16} />
                    </button>
                </div>
            </nav>

            {/* ─── Hero ─── */}
            <section style={{
                minHeight: "100vh", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                textAlign: "center", padding: "120px 24px 80px",
                position: "relative", overflow: "hidden"
            }}>
                {/* Background orbs */}
                <div style={{ position: "absolute", top: "10%", left: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "5%", right: "10%", width: 350, height: 350, background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: "40%", right: "25%", width: 250, height: 250, background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none" }} />

                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "6px 16px", background: "var(--accent-light)",
                    borderRadius: "var(--radius-full)", marginBottom: 28,
                    fontSize: "0.82rem", fontWeight: 600, color: "var(--accent)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    animation: "fadeInDown 0.6s ease"
                }}>
                    <Sparkles size={14} /> Trusted by 12,000+ service businesses
                </div>

                <h1 style={{
                    fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 900,
                    lineHeight: 1.08, maxWidth: 820, letterSpacing: "-0.04em",
                    marginBottom: 22, animation: "fadeInUp 0.7s ease"
                }}>
                    Run Your Entire Business{" "}
                    <span style={{
                        background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                    }}>From One Place</span>
                </h1>

                <p style={{
                    fontSize: "1.15rem", color: "var(--text-secondary)",
                    maxWidth: 580, lineHeight: 1.7, marginBottom: 36,
                    animation: "fadeInUp 0.8s ease"
                }}>
                    Bookings, CRM, inbox, forms, inventory, analytics, and automation —
                    everything a service business needs, unified in one beautiful platform.
                </p>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", animation: "fadeInUp 0.9s ease" }}>
                    <button className="btn btn-primary btn-xl" onClick={() => nav("/register")} style={{ gap: 10 }}>
                        Start Free Trial <ArrowRight size={18} />
                    </button>
                    <button className="btn btn-secondary btn-xl" onClick={() => {
                        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                    }}>
                        See Features
                    </button>
                </div>

                {/* Stats row */}
                <div style={{
                    display: "flex", gap: 48, marginTop: 72,
                    flexWrap: "wrap", justifyContent: "center",
                    animation: "fadeIn 1.2s ease"
                }}>
                    {stats.map((s, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{s.value}</div>
                            <div style={{ fontSize: "0.82rem", color: "var(--text-tertiary)", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Features ─── */}
            <section id="features" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 60 }}>
                    <div style={{
                        display: "inline-flex", padding: "5px 14px",
                        background: "var(--accent-light)", borderRadius: "var(--radius-full)",
                        fontSize: "0.78rem", fontWeight: 700, color: "var(--accent)",
                        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16
                    }}>Everything You Need</div>
                    <h2 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 14 }}>
                        One platform, <span style={{ color: "var(--accent)" }}>infinite possibilities</span>
                    </h2>
                    <p style={{ color: "var(--text-secondary)", maxWidth: 540, margin: "0 auto", fontSize: "1.05rem" }}>
                        Replace your scattered tools with a single, powerful operations hub.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <div key={i} className="card" style={{
                                padding: 28, cursor: "default",
                                animation: `fadeInUp ${0.3 + i * 0.08}s ease both`
                            }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12,
                                    background: `${f.color}15`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: f.color, marginBottom: 16
                                }}><Icon size={24} /></div>
                                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ─── How It Works ─── */}
            <section style={{ padding: "80px 24px", background: "var(--bg-secondary)" }}>
                <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 56 }}>
                        <h2 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
                            Up and running in <span style={{ color: "var(--accent)" }}>minutes</span>
                        </h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Three simple steps to transform your operations</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32 }}>
                        {[
                            { step: "01", title: "Create Your Workspace", desc: "Sign up and set up your business profile, services, and availability in our guided onboarding wizard." },
                            { step: "02", title: "Invite Your Team", desc: "Add staff members, set granular permissions, and start collaborating with role-based access control." },
                            { step: "03", title: "Go Live", desc: "Activate your workspace, share booking links, and let automation handle the rest while you focus on clients." },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: "center", padding: 20 }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: "var(--radius-full)",
                                    background: "var(--accent-gradient)", color: "white",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.1rem", fontWeight: 800, margin: "0 auto 18px",
                                    boxShadow: "0 4px 20px rgba(99,102,241,0.3)"
                                }}>{s.step}</div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Testimonials ─── */}
            <section style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 56 }}>
                    <h2 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
                        Loved by <span style={{ color: "var(--accent)" }}>thousands</span>
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>See what our customers have to say</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                    {testimonials.map((t, i) => (
                        <div key={i} className="card" style={{ padding: 28 }}>
                            <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                                {Array.from({ length: t.rating }).map((_, j) => (
                                    <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />
                                ))}
                            </div>
                            <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
                                "{t.text}"
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid var(--border-light)", paddingTop: 16 }}>
                                <div className="avatar">{t.avatar}</div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{t.name}</div>
                                    <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Pricing ─── */}
            <section style={{ padding: "80px 24px 100px", background: "var(--bg-secondary)" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 56 }}>
                        <h2 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
                            Simple, transparent <span style={{ color: "var(--accent)" }}>pricing</span>
                        </h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Start free, scale as you grow</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, alignItems: "start" }}>
                        {plans.map((p, i) => (
                            <div key={i} className="card" style={{
                                padding: 32, textAlign: "center",
                                border: p.popular ? "2px solid var(--accent)" : undefined,
                                position: "relative"
                            }}>
                                {p.popular && (
                                    <div style={{
                                        position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                                        background: "var(--accent-gradient)", color: "white",
                                        padding: "4px 16px", borderRadius: "var(--radius-full)",
                                        fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase",
                                        letterSpacing: "0.05em"
                                    }}>Most Popular</div>
                                )}
                                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 6 }}>{p.name}</h3>
                                <p style={{ fontSize: "0.82rem", color: "var(--text-tertiary)", marginBottom: 20 }}>{p.desc}</p>
                                <div style={{ marginBottom: 24 }}>
                                    <span style={{ fontSize: "2.8rem", fontWeight: 900, letterSpacing: "-0.04em" }}>{p.price}</span>
                                    <span style={{ color: "var(--text-tertiary)", fontSize: "0.88rem" }}>{p.period}</span>
                                </div>
                                <div style={{ textAlign: "left", marginBottom: 24 }}>
                                    {p.features.map((f, j) => (
                                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                                            <Check size={16} color="var(--success)" />
                                            {f}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className={`btn ${p.popular ? "btn-primary" : "btn-secondary"} w-full`}
                                    onClick={() => nav("/register")}
                                    style={{ justifyContent: "center", padding: "12px 20px" }}
                                >
                                    {p.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section style={{
                padding: "100px 24px", textAlign: "center",
                position: "relative", overflow: "hidden"
            }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.06), rgba(236,72,153,0.04))", pointerEvents: "none" }} />
                <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
                    <h2 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>
                        Ready to streamline your operations?
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: 32 }}>
                        Join thousands of service businesses that have simplified their workflows, delighted their clients, and grown their revenue with CareOps.
                    </p>
                    <button className="btn btn-primary btn-xl" onClick={() => nav("/register")} style={{ gap: 10 }}>
                        Get Started for Free <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer style={{
                padding: "48px 24px 32px",
                background: "var(--bg-secondary)",
                borderTop: "1px solid var(--border-color)"
            }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{
                        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 32, marginBottom: 40
                    }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                                <div style={{
                                    width: 34, height: 34, background: "var(--accent-gradient)",
                                    borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white"
                                }}><Zap size={18} /></div>
                                <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>CareOps</span>
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", lineHeight: 1.6, maxWidth: 280 }}>
                                Unified operations platform for service businesses. Simplify, automate, grow.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 14, color: "var(--text-primary)" }}>Product</h4>
                            {["Features", "Pricing", "Integrations", "API Docs"].map(l => (
                                <div key={l} style={{ padding: "5px 0", fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer" }}>{l}</div>
                            ))}
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 14, color: "var(--text-primary)" }}>Company</h4>
                            {["About Us", "Blog", "Careers", "Contact"].map(l => (
                                <div key={l} style={{ padding: "5px 0", fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer" }}>{l}</div>
                            ))}
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 14, color: "var(--text-primary)" }}>Contact</h4>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                <Mail size={14} /> hello@careops.io
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                <Phone size={14} /> +1 (555) 123-4567
                            </div>
                        </div>
                    </div>
                    <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>
                            © 2026 CareOps. All rights reserved.
                        </div>
                        <div style={{ display: "flex", gap: 20, fontSize: "0.78rem", color: "var(--text-tertiary)" }}>
                            <span style={{ cursor: "pointer" }}>Privacy Policy</span>
                            <span style={{ cursor: "pointer" }}>Terms of Service</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
