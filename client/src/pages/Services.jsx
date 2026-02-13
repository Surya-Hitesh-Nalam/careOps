import { useState, useEffect } from "react";
import api from "../utils/api";
import { Briefcase, Plus, X, Clock, DollarSign, MapPin, Edit2, Trash2, Palette } from "lucide-react";

const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#14b8a6", "#f97316", "#84cc16"];

export default function Services() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: "", description: "", duration: 30, price: 0, location: "", color: "#6366f1" });

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        try {
            const { data } = await api.get("/services");
            setServices(data.services);
        } catch { }
        setLoading(false);
    };

    const openCreate = () => { setEditing(null); setForm({ name: "", description: "", duration: 30, price: 0, location: "", color: "#6366f1" }); setShowModal(true); };
    const openEdit = (s) => { setEditing(s); setForm({ name: s.name, description: s.description || "", duration: s.duration, price: s.price || 0, location: s.location || "", color: s.color || "#6366f1" }); setShowModal(true); };

    const saveService = async () => {
        try {
            if (editing) {
                await api.put(`/services/${editing.id}`, form);
            } else {
                await api.post("/services", form);
            }
            setShowModal(false);
            fetchServices();
        } catch { }
    };

    const deleteService = async (id) => {
        if (!confirm("Delete this service?")) return;
        try { await api.delete(`/services/${id}`); fetchServices(); } catch { }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>Services</h1><p>Create and manage your service offerings</p></div>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Service</button>
            </div>

            {loading ? <div className="loading-spinner" /> : services.length === 0 ? (
                <div className="empty-state">
                    <Briefcase size={48} />
                    <h3>No services yet</h3>
                    <p>Create your first service to start taking bookings</p>
                    <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 16 }}><Plus size={16} /> Create Service</button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                    {services.map(s => (
                        <div key={s.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                            <div style={{ height: 4, background: s.color || "var(--accent)" }} />
                            <div style={{ padding: 22 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{
                                            width: 42, height: 42, borderRadius: "var(--radius-sm)",
                                            background: `${s.color || "var(--accent)"}15`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            color: s.color || "var(--accent)"
                                        }}><Briefcase size={20} /></div>
                                        <div>
                                            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>{s.name}</h3>
                                            {s.description && <p style={{ fontSize: "0.82rem", color: "var(--text-tertiary)", marginTop: 2 }}>{s.description}</p>}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}><Edit2 size={14} /></button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => deleteService(s.id)} style={{ color: "var(--error)" }}><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                                        <Clock size={14} /> {s.duration} min
                                    </div>
                                    {s.price > 0 && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", color: "var(--success)", fontWeight: 600 }}>
                                            <DollarSign size={14} /> ${s.price}
                                        </div>
                                    )}
                                    {s.location && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                                            <MapPin size={14} /> {s.location}
                                        </div>
                                    )}
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
                            <h2>{editing ? "Edit Service" : "New Service"}</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <div className="input-group"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Consultation" /></div>
                        <div className="input-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What does this service include?" /></div>
                        <div className="grid-2">
                            <div className="input-group"><label>Duration (min) *</label><input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} /></div>
                            <div className="input-group"><label>Price ($)</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} /></div>
                        </div>
                        <div className="input-group"><label>Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Room 3, Online" /></div>
                        <div className="input-group">
                            <label>Color</label>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {colors.map(c => (
                                    <div key={c} onClick={() => setForm({ ...form, color: c })} style={{
                                        width: 32, height: 32, borderRadius: "var(--radius-sm)",
                                        background: c, cursor: "pointer",
                                        border: form.color === c ? "3px solid var(--text-primary)" : "3px solid transparent",
                                        transition: "all var(--transition-fast)"
                                    }} />
                                ))}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={saveService}>{editing ? "Update" : "Create"} Service</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
