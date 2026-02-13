import { useState } from "react";
import {
    Activity, Calendar, Users, Mail, Package, FileText,
    UserCog, Settings, Filter, Search
} from "lucide-react";

const generateLogs = () => {
    const actions = [
        {
            type: "booking", icon: Calendar, color: "#6366f1", messages: [
                "New booking created for John Doe — Consultation at 10:00 AM",
                "Booking #1042 marked as completed",
                "Booking #1038 cancelled by client",
                "New booking created for Emily Chen — Assessment at 2:30 PM"
            ]
        },
        {
            type: "contact", icon: Users, color: "#10b981", messages: [
                "New contact added: Sarah Johnson (Website)",
                "Contact Michael Brown updated phone number",
                "New contact added: Lisa Wang (Walk-in)",
                "Contact James Wilson merged with duplicate"
            ]
        },
        {
            type: "email", icon: Mail, color: "#3b82f6", messages: [
                "Welcome email sent to sarah@example.com",
                "Booking confirmation sent to john@example.com",
                "Form reminder sent to emily@example.com",
                "Low stock alert sent to owner"
            ]
        },
        {
            type: "inventory", icon: Package, color: "#f59e0b", messages: [
                "Inventory adjusted: Latex Gloves -5 (15 → 10)",
                "New item added: Disinfectant Spray (qty: 48)",
                "Low stock alert: Surgical Masks (qty: 3)",
                "Inventory adjusted: Face Shields +20 (10 → 30)"
            ]
        },
        {
            type: "form", icon: FileText, color: "#8b5cf6", messages: [
                "New form submission: Intake Form by David Park",
                "Form template updated: Post-Visit Survey",
                "New form submission: Health Screening by Anna Lee",
                "Form template created: Consent Form v2"
            ]
        },
        {
            type: "staff", icon: UserCog, color: "#ec4899", messages: [
                "Staff member invited: dr.smith@clinic.com",
                "Permissions updated for Maria Garcia",
                "Staff member removed: Robert Taylor",
                "Staff login: Dr. Amanda Chen"
            ]
        },
        {
            type: "system", icon: Settings, color: "#64748b", messages: [
                "Workspace settings updated — business hours changed",
                "Email integration configured (SMTP)",
                "Theme changed to dark mode",
                "Public booking page activated"
            ]
        },
    ];

    const logs = [];
    const now = new Date();
    let offset = 0;

    for (let i = 0; i < 30; i++) {
        const cat = actions[Math.floor(Math.random() * actions.length)];
        const msg = cat.messages[Math.floor(Math.random() * cat.messages.length)];
        offset += Math.floor(Math.random() * 45 + 5);
        const time = new Date(now.getTime() - offset * 60000);
        logs.push({
            id: i, type: cat.type, icon: cat.icon, color: cat.color,
            message: msg, time
        });
    }
    return logs;
};

export default function ActivityLog() {
    const [logs] = useState(generateLogs);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const types = ["all", "booking", "contact", "email", "inventory", "form", "staff", "system"];

    const filtered = logs.filter(l => {
        if (filter !== "all" && l.type !== filter) return false;
        if (search && !l.message.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const formatTime = (date) => {
        const diff = Math.floor((Date.now() - date.getTime()) / 60000);
        if (diff < 1) return "Just now";
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>Activity Log</h1><p>Complete audit trail of all workspace actions</p></div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="badge badge-default">{filtered.length} events</span>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 20, padding: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <div className="search-input" style={{ flex: 1, minWidth: 200 }}>
                        <Search size={16} />
                        <input
                            placeholder="Search activity..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {types.map(t => (
                            <button key={t} className={`chip ${filter === t ? "active" : ""}`} onClick={() => setFilter(t)}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="card" style={{ padding: 0 }}>
                {filtered.length === 0 ? (
                    <div className="empty-state" style={{ padding: 48 }}>
                        <Activity size={40} />
                        <h3>No matching activity</h3>
                        <p>Try adjusting your filters</p>
                    </div>
                ) : (
                    filtered.map((log, i) => {
                        const Icon = log.icon;
                        return (
                            <div
                                key={log.id}
                                style={{
                                    display: "flex", alignItems: "center", gap: 14,
                                    padding: "14px 20px",
                                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border-light)" : "none",
                                    transition: "background var(--transition-fast)",
                                    cursor: "default"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <div style={{
                                    width: 36, height: 36, borderRadius: "var(--radius-full)",
                                    background: `${log.color}12`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: log.color, flexShrink: 0
                                }}>
                                    <Icon size={16} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "0.88rem", fontWeight: 500 }} className="truncate">{log.message}</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                                    <span className={`badge badge-default`}>{log.type}</span>
                                    <span style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", fontWeight: 500, minWidth: 60, textAlign: "right" }}>
                                        {formatTime(log.time)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
