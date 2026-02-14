import { useState, useEffect } from "react";
import api from "../utils/api";
import notify from "../utils/notify";
import { UserCog, Plus, X, Trash2, Shield, Mail, Eye, EyeOff, Briefcase, Check, Copy } from "lucide-react";

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
    const [inviteResult, setInviteResult] = useState(null); // { email, password }
    const [services, setServices] = useState([]);
    const [assignModal, setAssignModal] = useState(null); // { staffId, selectedServices }

    useEffect(() => { fetchStaff(); }, []);

    const fetchStaff = async () => {
        try {
            const [staffRes, servicesRes] = await Promise.all([
                api.get("/staff"),
                api.get("/services")
            ]);
            setStaff(staffRes.data.staff);
            setServices(servicesRes.data.services);
        } catch { }
        setLoading(false);
    };

    // ... existing code ...

    const invite = async () => {
        try {
            const res = await api.post("/staff/invite", form);
            setShowModal(false);
            setInviteResult({
                email: form.email,
                password: form.password,
                emailPreview: res.data.emailPreview
            });

            // Check if email was sent gracefully
            if (res.data.emailSent === false) {
                notify.warning("Staff added, but email failed to send. Please share credentials manually.");
            } else {
                notify.success("Staff member invited successfully!");
            }

            fetchStaff();
        } catch (err) {
            notify.error(err.response?.data?.message || "Failed to invite staff");
        }
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

    const saveServices = async () => {
        if (!assignModal) return;
        try {
            await api.put(`/staff/${assignModal.staffId}/services`, { serviceIds: assignModal.selectedServices });
            setAssignModal(null);
            fetchStaff();
        } catch { }
    };

    const toggleService = (id) => {
        if (!assignModal) return;
        const current = assignModal.selectedServices;
        if (current.includes(id)) {
            setAssignModal({ ...assignModal, selectedServices: current.filter(s => s !== id) });
        } else {
            setAssignModal({ ...assignModal, selectedServices: [...current, id] });
        }
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

                            <div style={{ marginTop: 12, borderTop: "1px solid var(--border-light)", paddingTop: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
                                        <Briefcase size={12} /> Assigned Services
                                    </div>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setAssignModal({ staffId: s.id, selectedServices: s.services?.map(srv => srv.id) || [] })} style={{ fontSize: "0.7rem", height: 24 }}>
                                        Edit
                                    </button>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {s.services && s.services.length > 0 ? s.services.map(srv => (
                                        <span key={srv.id} style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: 4, background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}>
                                            {srv.name}
                                        </span>
                                    )) : <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontStyle: "italic" }}>No specific services assigned</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Invite Success Modal */}
            {inviteResult && (
                <div className="modal-overlay">
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{ color: "var(--success)" }}>Staff Invited! 🎉</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setInviteResult(null)}><X size={18} /></button>
                        </div>
                        <p style={{ marginBottom: 16 }}>Currently, email delivery is simulated. Please copy these credentials or open the preview link.</p>
                        <div style={{ background: "var(--bg-tertiary)", padding: 16, borderRadius: 8, border: "1px solid var(--border-color)", marginBottom: 20 }}>
                            <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-tertiary)" }}>Email:</span>
                                <strong style={{ userSelect: "all" }}>{inviteResult.email}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ color: "var(--text-tertiary)" }}>Password:</span>
                                <strong style={{ userSelect: "all" }}>{inviteResult.password}</strong>
                            </div>
                            {inviteResult.emailPreview && (
                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
                                    <a href={inviteResult.emailPreview} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                                        <Mail size={16} /> View Email Preview
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions" style={{ justifyContent: "center" }}>
                            <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(`Email: ${inviteResult.email}\nPassword: ${inviteResult.password}`); notify.success("Copied to clipboard!"); }} style={{ width: "100%" }}>
                                <Copy size={16} /> Copy Credentials
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Service Assignment Modal */}
            {assignModal && (
                <div className="modal-overlay" onClick={() => setAssignModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Assign Services</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setAssignModal(null)}><X size={18} /></button>
                        </div>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: 16 }}>
                            Select which services this staff member is qualified to perform.
                        </p>
                        <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                            {services.map(s => {
                                const isSelected = assignModal.selectedServices.includes(s.id);
                                return (
                                    <div key={s.id} onClick={() => toggleService(s.id)} style={{
                                        padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                                        border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border-color)",
                                        background: isSelected ? "var(--accent-light)" : "var(--bg-secondary)",
                                        display: "flex", alignItems: "center", justifyContent: "space-between"
                                    }}>
                                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.name}</div>
                                        {isSelected && <Check size={16} color="var(--accent)" />}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setAssignModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={saveServices}>Save Assignments</button>
                        </div>
                    </div>
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
