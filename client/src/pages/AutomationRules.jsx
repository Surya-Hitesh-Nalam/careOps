import { useState, useEffect } from "react";
import api from "../utils/api";
import {
    Bot, Zap, Mail, MessageSquare, Package, Calendar,
    Users, Bell, ToggleLeft, ToggleRight, Plus, X, ChevronRight,
    ArrowRight
} from "lucide-react";

const ruleTemplates = [
    {
        id: "welcome_email",
        name: "Welcome Email",
        desc: "Send a welcome email when a new contact is created",
        trigger: "New Contact Created",
        action: "Send Email",
        triggerIcon: Users,
        actionIcon: Mail,
        color: "#6366f1",
        enabled: true
    },
    {
        id: "booking_confirm",
        name: "Booking Confirmation",
        desc: "Auto-confirm bookings and notify clients via email",
        trigger: "New Booking Created",
        action: "Send Confirmation",
        triggerIcon: Calendar,
        actionIcon: Mail,
        color: "#10b981",
        enabled: true
    },
    {
        id: "low_stock_alert",
        name: "Low Stock Alert",
        desc: "Notify workspace owner when inventory items reach low stock threshold",
        trigger: "Inventory Below Threshold",
        action: "Send Alert",
        triggerIcon: Package,
        actionIcon: Bell,
        color: "#f59e0b",
        enabled: true
    },
    {
        id: "staff_reply_notify",
        name: "Staff Reply Notification",
        desc: "Notify clients when a staff member replies to their conversation",
        trigger: "Staff Replies",
        action: "Send Notification",
        triggerIcon: MessageSquare,
        actionIcon: Bell,
        color: "#3b82f6",
        enabled: false
    },
    {
        id: "no_show_followup",
        name: "No-Show Follow Up",
        desc: "Send a follow-up message when a client misses their appointment",
        trigger: "Booking Marked No-Show",
        action: "Send Follow-up",
        triggerIcon: Calendar,
        actionIcon: Mail,
        color: "#ef4444",
        enabled: false
    },
    {
        id: "form_reminder",
        name: "Form Reminder",
        desc: "Remind clients to complete pre-appointment forms 24 hours before booking",
        trigger: "24h Before Booking",
        action: "Send Reminder",
        triggerIcon: Calendar,
        actionIcon: Mail,
        color: "#8b5cf6",
        enabled: false
    },
];

export default function AutomationRules() {
    const [rules, setRules] = useState(ruleTemplates);
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState("rules");
    const [loading, setLoading] = useState(false);

    const toggleRule = (id) => {
        setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    };

    const activeCount = rules.filter(r => r.enabled).length;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Automations</h1>
                    <p>Configure automated workflows and triggers</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="badge badge-accent">{activeCount} active</span>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", marginBottom: 24 }}>
                {[
                    { icon: Zap, label: "Active Rules", value: activeCount, color: "accent" },
                    { icon: Mail, label: "Emails Sent", value: "1,284", color: "success" },
                    { icon: Bell, label: "Alerts Fired", value: "456", color: "warning" },
                    { icon: Bot, label: "Total Runs", value: "3,741", color: "info" },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="stat-card">
                            <div className={`stat-icon ${s.color}`}><Icon size={22} /></div>
                            <div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === "rules" ? "active" : ""}`} onClick={() => setActiveTab("rules")}>Automation Rules</button>
                <button className={`tab ${activeTab === "logs" ? "active" : ""}`} onClick={() => setActiveTab("logs")}>Execution Log</button>
            </div>

            {activeTab === "rules" && (
                <div style={{ display: "grid", gap: 12 }}>
                    {rules.map(rule => {
                        const TriggerIcon = rule.triggerIcon;
                        const ActionIcon = rule.actionIcon;
                        return (
                            <div key={rule.id} className="card" style={{
                                padding: 20,
                                opacity: rule.enabled ? 1 : 0.65,
                                borderLeft: `4px solid ${rule.enabled ? rule.color : "var(--border-color)"}`,
                                transition: "all var(--transition-normal)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                            <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{rule.name}</h3>
                                            {rule.enabled && <span className="badge badge-success">Active</span>}
                                        </div>
                                        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 12 }}>{rule.desc}</p>

                                        {/* Trigger → Action flow */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: 8,
                                                padding: "6px 14px",
                                                background: `${rule.color}10`,
                                                borderRadius: "var(--radius-full)",
                                                fontSize: "0.78rem", fontWeight: 600,
                                                color: rule.color
                                            }}>
                                                <TriggerIcon size={14} />
                                                {rule.trigger}
                                            </div>
                                            <ArrowRight size={16} color="var(--text-tertiary)" />
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: 8,
                                                padding: "6px 14px",
                                                background: "var(--bg-tertiary)",
                                                borderRadius: "var(--radius-full)",
                                                fontSize: "0.78rem", fontWeight: 600,
                                                color: "var(--text-secondary)"
                                            }}>
                                                <ActionIcon size={14} />
                                                {rule.action}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleRule(rule.id)}
                                        className={`toggle ${rule.enabled ? "active" : ""}`}
                                        style={{ flexShrink: 0 }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === "logs" && (
                <div className="card">
                    <div className="table-container" style={{ border: "none", boxShadow: "none" }}>
                        <table>
                            <thead>
                                <tr><th>Rule</th><th>Trigger</th><th>Status</th><th>Time</th></tr>
                            </thead>
                            <tbody>
                                {[
                                    { rule: "Welcome Email", trigger: "New contact: John Doe", status: "success", time: "2 min ago" },
                                    { rule: "Booking Confirmation", trigger: "New booking #1042", status: "success", time: "15 min ago" },
                                    { rule: "Low Stock Alert", trigger: "Item: Latex Gloves (qty: 3)", status: "success", time: "1 hour ago" },
                                    { rule: "Welcome Email", trigger: "New contact: Sarah Lee", status: "success", time: "2 hours ago" },
                                    { rule: "Booking Confirmation", trigger: "New booking #1041", status: "failed", time: "3 hours ago" },
                                    { rule: "Staff Reply Notification", trigger: "Staff replied to conv #28", status: "success", time: "4 hours ago" },
                                ].map((log, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>{log.rule}</td>
                                        <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{log.trigger}</td>
                                        <td>
                                            <span className={`badge badge-${log.status === "success" ? "success" : "error"}`}>{log.status}</span>
                                        </td>
                                        <td style={{ color: "var(--text-tertiary)", fontSize: "0.82rem" }}>{log.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
