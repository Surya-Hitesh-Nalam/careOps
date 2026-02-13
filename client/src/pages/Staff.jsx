import { useState, useEffect } from "react";
import api from "../utils/api";
import { UserCog, Plus, X, Trash2, Shield, Mail, Eye, EyeOff } from "lucide-react";

const permissions = [
    { key: "bookings", label: "Bookings" },
    { key: "contacts", label: "Contacts" },
    { key: "inbox", label: "Inbox" },
    { key: "forms", label: "Forms" },
    { key: "inventory", label: "Inventory" },
];

export default function Staff() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ email: "", name: "", password: "", permissions: { bookings: true, contacts: true, conversations: true, forms: true, inventory: false } });
    const [showPw, setShowPw] = useState(false);

    useEffect(() => { fetchStaff(); }, []);

    const fetchStaff = async () => {
        try { const { data } = await api.get("/staff"); setStaff(data.staff); } catch { }
        setLoading(false);
    };

    const invite = async () => {
        try { await api.post("/staff/invite", form); setShowModal(false); fetchStaff(); } catch { }
    };

    const remove = async (id) => {
        if (!confirm("Remove this staff member?")) return;
        try { await api.delete(`/staff/${id}`); fetchStaff(); } catch { }
    };

    const togglePerm = async (staffId, key, current) => {
        const member = staff.find(s => s.id === staffId);
        if (!member) return;
        const updated = { ...member.permissions, [key]: !current };
        try { await api.put(`/staff/${staffId}/permissions`, { permissions: updated }); fetchStaff(); } catch { }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>Staff</h1><p>Manage your team and permissions</p></div>
                <button className="btn btn-primary" onClick={() => { setForm({ email: "", name: "", password: "", permissions: { bookings: true, contacts: true, conversations: true, forms: true, inventory: false } }); setShowModal(true); }}>
                    <Plus size={16} /> Invite Staff
                </button>
            </div>

            {loading ? <div className="loading-spinner" /> : staff.length === 0 ? (
                <div className="empty-state">
                    <UserCog size={48} /><h3>No team members yet</h3>
                    <p>Invite staff to help manage your workspace</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
                    {staff.map(s => (
                        <div key={s.id} className="card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div className="avatar" style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}>
                                        {s.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{s.name}</h3>
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", color: "var(--text-tertiary)" }}>
                                            <Mail size={12} /> {s.email}
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => remove(s.id)} style={{ color: "var(--error)" }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 14 }}>
                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                                    <Shield size={12} /> Permissions
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {permissions.map(p => {
                                        const active = s.permissions?.[p.key];
                                        return (
                                            <button
                                                key={p.key}
                                                className={`chip ${active ? "active" : ""}`}
                                                onClick={() => togglePerm(s.id, p.key, active)}
                                            >
                                                {p.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Invite Staff Member</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <div className="input-group"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></div>
                        <div className="input-group"><label>Email *</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" /></div>
                        <div className="input-group">
                            <label>Password *</label>
                            <div style={{ position: "relative" }}>
                                <input type={showPw ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Temporary password" />
                                <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>Permissions</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {permissions.map(p => (
                                    <button key={p.key} className={`chip ${form.permissions[p.key] ? "active" : ""}`}
                                        onClick={() => setForm({ ...form, permissions: { ...form.permissions, [p.key]: !form.permissions[p.key] } })}>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={invite}>Send Invite</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
