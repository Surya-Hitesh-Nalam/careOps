import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import {
    Calendar, Users, MessageSquare, FileText, Package,
    AlertTriangle, Clock, ArrowRight, TrendingUp, CheckCircle2,
    XCircle, Inbox, BarChart3, UserPlus, Sparkles, Brain, Lightbulb, Zap
} from "lucide-react";
import StaffDashboard from "./StaffDashboard";

export default function Dashboard() {
    const { user } = useAuth();
    const nav = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiInsights, setAiInsights] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => { fetchStats(); const iv = setInterval(fetchStats, 30000); return () => clearInterval(iv); }, []);

    const fetchStats = async () => {
        try { const { data } = await api.get("/dashboard/stats"); setStats(data); } catch { }
        setLoading(false);
    };

    const fetchAiInsights = async () => {
        setAiLoading(true);
        try { const { data } = await api.get("/ai/insights"); setAiInsights(data); } catch { }
        setAiLoading(false);
    };

    if (loading) return <div className="page-container"><div className="loading-spinner" /></div>;

    // Redirect or render Staff Dashboard
    if (user?.role === "staff") {
        return <StaffDashboard />;
    }

    if (!stats) return <div className="page-container"><div className="empty-state"><h3>Could not load dashboard</h3></div></div>;

    const statCards = [
        { label: "Today's Bookings", value: stats.bookings?.today || 0, icon: Calendar, color: "accent", to: "/bookings" },
        { label: "Upcoming", value: stats.bookings?.upcoming || 0, icon: Clock, color: "info", to: "/calendar" },
        { label: "Total Contacts", value: stats.leads?.total || 0, icon: Users, color: "success", to: "/contacts" },
        { label: "New Leads", value: stats.leads?.new || 0, icon: UserPlus, color: "warning", to: "/contacts" },
        { label: "Unread Messages", value: stats.leads?.unread || 0, icon: MessageSquare, color: "error", to: "/inbox" },
        { label: "Pending Forms", value: stats.forms?.pending || 0, icon: FileText, color: "accent", to: "/forms" },
        { label: "Low Stock Items", value: stats.inventory?.lowStock?.length || 0, icon: Package, color: "warning", to: "/inventory" },
        { label: "Completed", value: stats.bookings?.completed || 0, icon: CheckCircle2, color: "success", to: "/analytics" },
    ];

    const todaysSchedule = stats.bookings?.todayList || [];
    const unansweredConversations = stats.leads?.unanswered || [];

    const insightIcons = { success: CheckCircle2, warning: AlertTriangle, info: Lightbulb, tip: Zap };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
                    <p>Here's what's happening in your workspace today</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => nav("/analytics")}><BarChart3 size={15} /> Analytics</button>
                    <button className="btn btn-primary btn-sm" onClick={() => nav("/bookings")}><Calendar size={15} /> New Booking</button>
                </div>
            </div>

            {/* Stat Grid */}
            <div className="stats-grid">
                {statCards.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="stat-card" onClick={() => nav(s.to)} style={{ cursor: "pointer", animationDelay: `${i * 0.05}s`, animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}>
                            <div className={`stat-icon ${s.color}`}><Icon size={22} /></div>
                            <div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* AI Insights Card */}
            <div className="card glass-panel" style={{ marginBottom: 24, overflow: "hidden", position: "relative", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 4,
                    background: "var(--accent-gradient)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 3s ease-in-out infinite"
                }} />
                <div className="card-header" style={{ paddingTop: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: "var(--accent-gradient)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "var(--shadow-glow)"
                        }}>
                            <Sparkles size={18} color="white" />
                        </div>
                        <div>
                            <span className="card-title" style={{ fontSize: "1.05rem", display: "block" }}>AI Business Monitor</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>Powered by Gemini 2.0 Flash</span>
                        </div>
                    </div>
                    <button className="btn btn-secondary btn-sm glass-button" onClick={fetchAiInsights} disabled={aiLoading}>
                        <Brain size={14} /> {aiLoading ? "Analyzing..." : aiInsights ? "Refresh Insights" : "Generate Report"}
                    </button>
                </div>

                {!aiInsights && !aiLoading && (
                    <div className="empty-state" style={{ padding: "40px 32px" }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: "50%", background: "var(--accent-light)",
                            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16
                        }}>
                            <Sparkles size={28} color="var(--accent)" />
                        </div>
                        <h3 style={{ marginBottom: 8 }}>Unlock Business Intelligence</h3>
                        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
                            Gemini will analyze your bookings, inventory, and improved customer interactions to provide actionable strategic advice.
                        </p>
                        <button className="btn btn-primary" onClick={fetchAiInsights}>
                            <Zap size={16} /> Analyze My Business
                        </button>
                    </div>
                )}

                {aiLoading && (
                    <div style={{ padding: "60px 32px", textAlign: "center" }}>
                        <div className="loading-spinner" style={{ width: 40, height: 40, borderWidth: 4, marginBottom: 20 }} />
                        <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Analyzing {stats?.bookings?.today || "business"} data...</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Generating strategic insights tailored to your business type.</p>
                    </div>
                )}

                {aiInsights?.insights && !aiLoading && (
                    <div style={{ padding: "0 24px 24px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
                            {aiInsights.insights.map((insight, i) => {
                                const Icon = insightIcons[insight.type] || Lightbulb;
                                const styleConfig = {
                                    success: { bg: "var(--success-light)", color: "var(--success)", border: "rgba(16, 185, 129, 0.2)" },
                                    warning: { bg: "var(--warning-light)", color: "var(--warning)", border: "rgba(245, 158, 11, 0.2)" },
                                    info: { bg: "var(--info-light)", color: "var(--info)", border: "rgba(59, 130, 246, 0.2)" },
                                    tip: { bg: "var(--accent-light)", color: "var(--accent)", border: "rgba(99, 102, 241, 0.2)" }
                                };
                                const conf = styleConfig[insight.type] || styleConfig.info;

                                return (
                                    <div key={i} style={{
                                        padding: 18, borderRadius: "var(--radius-md)",
                                        background: "var(--bg-primary)",
                                        border: `1px solid ${conf.border}`,
                                        animation: `fadeInUp 0.4s ease ${i * 0.1}s both`,
                                        position: "relative", overflow: "hidden"
                                    }}>
                                        <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: conf.color }} />
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8, background: conf.bg,
                                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                            }}>
                                                <Icon size={16} color={conf.color} />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>{insight.title}</h4>
                                                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{insight.insight}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Alerts */}
            {stats.alerts?.length > 0 && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-header">
                        <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <AlertTriangle size={16} color="var(--warning)" /> Alerts
                        </span>
                        <span className="badge badge-warning">{stats.alerts.length}</span>
                    </div>
                    {stats.alerts.map((a, i) => (
                        <div key={i} className={`alert alert-${a.type === "error" ? "error" : a.type === "warning" ? "warning" : "info"}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => nav(a.link || "/dashboard")}>
                            <AlertTriangle size={16} />
                            <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{a.message}</span>
                            <ArrowRight size={14} style={{ marginLeft: "auto" }} />
                        </div>
                    ))}
                </div>
            )}

            <div className="grid-2">
                {/* Today's Schedule */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Clock size={16} color="var(--accent)" /> Today's Schedule
                        </span>
                        <button className="btn btn-ghost btn-sm" onClick={() => nav("/calendar")}>View all <ArrowRight size={14} /></button>
                    </div>
                    {todaysSchedule.length === 0 ? (
                        <div className="empty-state" style={{ padding: 24 }}><Calendar size={28} /><p>No appointments today</p></div>
                    ) : (
                        todaysSchedule.slice(0, 5).map((s, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                                borderBottom: i < 4 ? "1px solid var(--border-light)" : "none"
                            }}>
                                <div style={{
                                    width: 4, height: 36, borderRadius: 2,
                                    background: s.service?.color || "var(--accent)", flexShrink: 0
                                }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: "0.88rem" }} className="truncate">{s.contact?.name || "Client"}</div>
                                    <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>{s.service?.name}</div>
                                </div>
                                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent)" }}>{s.time}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Unanswered Conversations */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Inbox size={16} color="var(--info)" /> Unanswered Conversations
                        </span>
                        <button className="btn btn-ghost btn-sm" onClick={() => nav("/inbox")}>View all <ArrowRight size={14} /></button>
                    </div>
                    {unansweredConversations.length === 0 ? (
                        <div className="empty-state" style={{ padding: 24 }}><CheckCircle2 size={28} color="var(--success)" /><p>All caught up!</p></div>
                    ) : (
                        unansweredConversations.slice(0, 5).map((c, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                                borderBottom: i < 4 ? "1px solid var(--border-light)" : "none",
                                cursor: "pointer"
                            }} onClick={() => nav("/inbox")}>
                                <div className="avatar sm">{c.contact?.name?.charAt(0) || "?"}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: "0.88rem" }} className="truncate">{c.contact?.name || "Unknown"}</div>
                                    <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }} className="truncate">
                                        {c.messages?.[c.messages.length - 1]?.body || c.lastMessage || "..."}
                                    </div>
                                </div>
                                <span className="badge badge-error" style={{ flexShrink: 0 }}>new</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
