import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import {
    Calendar, Users, MessageSquare, FileText, Package,
    AlertTriangle, Clock, ArrowRight, TrendingUp, CheckCircle2,
    XCircle, Inbox, BarChart3, UserPlus, Sparkles, Brain, Lightbulb, Zap
} from "lucide-react";

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
            <div className="card" style={{ marginBottom: 20, overflow: "hidden", position: "relative" }}>
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: "linear-gradient(90deg, var(--accent), #a855f7, #ec4899, var(--accent))",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 3s ease-in-out infinite"
                }} />
                <div className="card-header" style={{ paddingTop: 16 }}>
                    <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Sparkles size={18} color="var(--accent)" /> AI Business Insights
                        <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 12, background: "linear-gradient(135deg, var(--accent), #a855f7)", color: "white", fontWeight: 600 }}>GEMINI</span>
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={fetchAiInsights} disabled={aiLoading}>
                        <Brain size={14} /> {aiLoading ? "Analyzing..." : aiInsights ? "Refresh" : "Generate Insights"}
                    </button>
                </div>
                {!aiInsights && !aiLoading && (
                    <div className="empty-state" style={{ padding: 32 }}>
                        <Sparkles size={32} style={{ opacity: 0.5, color: "var(--accent)" }} />
                        <p style={{ color: "var(--text-secondary)" }}>Click "Generate Insights" to get AI-powered business analysis</p>
                    </div>
                )}
                {aiLoading && (
                    <div style={{ padding: 32, textAlign: "center" }}>
                        <div className="loading-spinner" />
                        <p style={{ marginTop: 8, color: "var(--text-secondary)", fontSize: "0.85rem" }}>Gemini is analyzing your business data...</p>
                    </div>
                )}
                {aiInsights?.insights && !aiLoading && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 16px 16px" }}>
                        {aiInsights.insights.map((insight, i) => {
                            const Icon = insightIcons[insight.type] || Lightbulb;
                            const colors = { success: "#10b981", warning: "#f59e0b", info: "#6366f1", tip: "#8b5cf6" };
                            return (
                                <div key={i} style={{
                                    padding: 14, borderRadius: "var(--radius-md)",
                                    background: "var(--bg-primary)", border: "1px solid var(--border-light)",
                                    animation: `fadeInUp 0.3s ease ${i * 0.1}s both`
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                        <Icon size={14} color={colors[insight.type] || "var(--accent)"} />
                                        <span style={{ fontWeight: 700, fontSize: "0.8rem", color: colors[insight.type] || "var(--accent)" }}>{insight.title}</span>
                                    </div>
                                    <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.4, margin: 0 }}>{insight.insight}</p>
                                </div>
                            );
                        })}
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
