import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import api from "../utils/api";
import notify from "../utils/notify";
import {
    Settings as SettingsIcon, Palette, Mail, Building, Globe,
    Save, Send, Check, Sun, Moon, AlertTriangle
} from "lucide-react";

const accentColors = [
    { value: "#6366f1", label: "Indigo" },
    { value: "#8b5cf6", label: "Violet" },
    { value: "#a855f7", label: "Purple" },
    { value: "#ec4899", label: "Pink" },
    { value: "#ef4444", label: "Red" },
    { value: "#f59e0b", label: "Amber" },
    { value: "#10b981", label: "Emerald" },
    { value: "#14b8a6", label: "Teal" },
    { value: "#3b82f6", label: "Blue" },
    { value: "#f97316", label: "Orange" },
];
export default function Settings() {
    const { user } = useAuth();
    const { theme, toggleTheme, accent, setAccent } = useTheme();
    const [activeTab, setActiveTab] = useState("general");
    const [workspace, setWorkspace] = useState({ name: "", type: "", phone: "", address: "" });
    const [email, setEmail] = useState({ host: "", port: 587, user: "", pass: "" });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchWS = async () => {
            try {
                const { data } = await api.get(`/workspace/${user.workspace}`);
                const ws = data.workspace;
                setWorkspace({ name: ws.name || "", type: ws.type || "", phone: ws.phone || "", address: ws.address || "" });
                // Load email config safely
                if (ws.emailConfig) {
                    const ec = typeof ws.emailConfig === "string" ? JSON.parse(ws.emailConfig) : ws.emailConfig;
                    setEmail({ ...email, ...ec });
                }
            } catch { }
        };
        if (user?.workspace) fetchWS();
    }, [user]);

    const saveWorkspace = async () => {
        try { await api.put(`/workspace/${user.workspace}`, workspace); showSaved(); } catch { }
    };

    const saveEmail = async () => {
        try {
            await api.put(`/workspace/${user.workspace}`, { emailConfig: { ...email, configured: true } });
            showSaved();
        } catch { }
    };

    const testEmail = async () => {
        const loadId = notify.loading("Sending test email...");
        try {
            await api.post("/integrations/test-email");
            notify.success("Test email sent successfully!");
        } catch (err) {
            notify.error("Failed to send test email. Check credentials.");
        } finally {
            notify.dismiss(loadId);
        }
    };

    const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    const tabs = [
        { key: "general", label: "General", icon: Building },
        { key: "appearance", label: "Appearance", icon: Palette },
        { key: "email", label: "Email Integration", icon: Mail },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>Settings</h1><p>Configure your workspace and preferences</p></div>
                {saved && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--success)", fontWeight: 600, fontSize: "0.88rem", animation: "fadeIn 0.3s ease" }}>
                        <Check size={16} /> Saved!
                    </div>
                )}
            </div>

            <div style={{ display: "flex", gap: 24 }}>
                {/* Settings nav */}
                <div style={{ width: 220, flexShrink: 0 }}>
                    <div className="card" style={{ padding: 6 }}>
                        {tabs.map(t => {
                            const Icon = t.icon;
                            return (
                                <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    width: "100%", padding: "10px 14px",
                                    borderRadius: "var(--radius-xs)",
                                    background: activeTab === t.key ? "var(--accent-light)" : "transparent",
                                    color: activeTab === t.key ? "var(--accent)" : "var(--text-secondary)",
                                    fontWeight: activeTab === t.key ? 600 : 400,
                                    border: "none", cursor: "pointer",
                                    fontSize: "0.88rem", fontFamily: "inherit",
                                    transition: "all var(--transition-fast)"
                                }}>
                                    <Icon size={17} /> {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Settings content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {activeTab === "general" && (
                        <div className="card">
                            <div className="card-header">
                                <span className="card-title">Workspace Details</span>
                            </div>
                            <div className="input-group"><label>Business Name</label><input value={workspace.name} onChange={e => setWorkspace({ ...workspace, name: e.target.value })} /></div>
                            <div className="input-group">
                                <label>Business Type</label>
                                <select value={workspace.type} onChange={e => setWorkspace({ ...workspace, type: e.target.value })}>
                                    <option value="">Select type</option>
                                    {["salon", "clinic", "spa", "fitness", "wellness", "dental", "veterinary", "other"].map(t => (
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group"><label>Phone</label><input value={workspace.phone} onChange={e => setWorkspace({ ...workspace, phone: e.target.value })} /></div>
                            <div className="input-group"><label>Address</label><textarea value={workspace.address} onChange={e => setWorkspace({ ...workspace, address: e.target.value })} /></div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-light)" }}>
                                <div style={{ fontSize: "0.82rem", color: "var(--text-tertiary)" }}>
                                    <Globe size={14} style={{ verticalAlign: "middle" }} /> Public booking: /book/{user?.workspace}
                                </div>
                                <button className="btn btn-primary" onClick={saveWorkspace}><Save size={15} /> Save Changes</button>
                            </div>
                        </div>
                    )}

                    {activeTab === "appearance" && (
                        <div className="card">
                            <div className="card-header"><span className="card-title">Appearance</span></div>

                            {/* Theme */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, display: "block" }}>Theme</label>
                                <div style={{ display: "flex", gap: 12 }}>
                                    {[
                                        { key: "light", label: "Light", icon: Sun },
                                        { key: "dark", label: "Dark", icon: Moon },
                                    ].map(t => {
                                        const Icon = t.icon;
                                        return (
                                            <button key={t.key} onClick={() => { if (theme !== t.key) toggleTheme(); }} style={{
                                                display: "flex", alignItems: "center", gap: 8,
                                                padding: "12px 24px",
                                                borderRadius: "var(--radius-sm)",
                                                border: `2px solid ${theme === t.key ? "var(--accent)" : "var(--border-color)"}`,
                                                background: theme === t.key ? "var(--accent-light)" : "var(--bg-tertiary)",
                                                color: theme === t.key ? "var(--accent)" : "var(--text-secondary)",
                                                fontWeight: 600, cursor: "pointer", fontSize: "0.88rem",
                                                fontFamily: "inherit"
                                            }}>
                                                <Icon size={17} /> {t.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Accent color */}
                            <div>
                                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, display: "block" }}>Accent Color</label>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    {accentColors.map(c => (
                                        <div key={c.value} onClick={() => setAccent(c.value)} style={{
                                            width: 40, height: 40, borderRadius: "var(--radius-sm)",
                                            background: c.value, cursor: "pointer",
                                            border: accent === c.value ? "3px solid var(--text-primary)" : "3px solid transparent",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            transition: "all var(--transition-fast)",
                                            transform: accent === c.value ? "scale(1.1)" : "scale(1)"
                                        }}>
                                            {accent === c.value && <Check size={18} color="white" />}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                    <label style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>Custom:</label>
                                    <input type="color" value={accent} onChange={e => setAccent(e.target.value)} style={{ width: 34, height: 28, padding: 0, border: "none", cursor: "pointer" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "email" && (
                        <div className="card">
                            <div className="card-header"><span className="card-title">Email Integration (SMTP)</span></div>
                            <div className="alert alert-info" style={{ marginBottom: 16 }}>
                                <Mail size={16} />
                                <span>Configure SMTP to send automated emails (confirmations, reminders, etc.)</span>
                            </div>
                            <div className="grid-2">
                                <div className="input-group"><label>SMTP Host</label><input value={email.host} onChange={e => setEmail({ ...email, host: e.target.value })} placeholder="smtp.gmail.com" /></div>
                                <div className="input-group"><label>Port</label><input type="number" value={email.port} onChange={e => setEmail({ ...email, port: Number(e.target.value) })} /></div>
                            </div>
                            <div className="input-group"><label>Username / Email</label><input value={email.user} onChange={e => setEmail({ ...email, user: e.target.value })} placeholder="your@email.com" /></div>
                            <div className="input-group"><label>Password / App Password</label><input type="password" value={email.pass} onChange={e => setEmail({ ...email, pass: e.target.value })} placeholder="••••••" /></div>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-light)" }}>
                                <button className="btn btn-secondary" onClick={testEmail}><Send size={15} /> Test Email</button>
                                <button className="btn btn-primary" onClick={saveEmail}><Save size={15} /> Save</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
