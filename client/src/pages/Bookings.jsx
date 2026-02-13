import { useState, useEffect } from "react";
import api from "../utils/api";
import { Calendar, Plus, X, CheckCircle2, XCircle, Clock, UserX, Filter, Search } from "lucide-react";

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ contact: "", service: "", date: "", time: "" });

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [bRes, cRes, sRes] = await Promise.all([api.get("/bookings"), api.get("/contacts"), api.get("/services")]);
            setBookings(bRes.data.bookings);
            setContacts(cRes.data.contacts);
            setServices(sRes.data.services);
        } catch { }
        setLoading(false);
    };

    const create = async () => {
        try { await api.post("/bookings", form); setShowModal(false); fetchAll(); } catch { }
    };

    const updateStatus = async (id, status) => {
        try { await api.put(`/bookings/${id}/status`, { status }); fetchAll(); } catch { }
    };

    const filtered = bookings.filter(b => {
        if (filter !== "all" && b.status !== filter) return false;
        if (search && !b.contact?.name?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const statusBadge = (s) => {
        const map = { confirmed: "info", completed: "success", cancelled: "default", no_show: "error" };
        return <span className={`badge badge-${map[s] || "default"}`}>{s?.replace("_", " ")}</span>;
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>Bookings</h1><p>Manage all your appointments</p></div>
                <button className="btn btn-primary" onClick={() => { setForm({ contact: "", service: "", date: "", time: "" }); setShowModal(true); }}><Plus size={16} /> New Booking</button>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: 14, marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <div className="search-input" style={{ flex: 1, minWidth: 200 }}>
                        <Search size={16} />
                        <input placeholder="Search by client name..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                        {["all", "confirmed", "completed", "cancelled", "no_show"].map(f => (
                            <button key={f} className={`chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                                {f === "all" ? "All" : f.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? <div className="loading-spinner" /> : filtered.length === 0 ? (
                <div className="empty-state"><Calendar size={48} /><h3>No bookings found</h3></div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead><tr><th>Client</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(b => (
                                <tr key={b.id}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div className="avatar sm">{b.contact?.name?.charAt(0) || "?"}</div>
                                            <span style={{ fontWeight: 600 }}>{b.contact?.name || "Unknown"}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.service?.color || "var(--accent)" }} />
                                            {b.service?.name || "—"}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{new Date(b.date).toLocaleDateString()}</td>
                                    <td style={{ fontWeight: 700, color: "var(--accent)" }}>{b.time}</td>
                                    <td>{statusBadge(b.status)}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: 4 }}>
                                            {b.status === "confirmed" && (
                                                <>
                                                    <button className="btn btn-ghost btn-sm" title="Complete" onClick={() => updateStatus(b.id, "completed")} style={{ color: "var(--success)" }}><CheckCircle2 size={15} /></button>
                                                    <button className="btn btn-ghost btn-sm" title="No-show" onClick={() => updateStatus(b.id, "no_show")} style={{ color: "var(--warning)" }}><UserX size={15} /></button>
                                                    <button className="btn btn-ghost btn-sm" title="Cancel" onClick={() => updateStatus(b.id, "cancelled")} style={{ color: "var(--error)" }}><XCircle size={15} /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>New Booking</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <div className="input-group">
                            <label>Client *</label>
                            <select value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })}>
                                <option value="">Select client</option>
                                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Service *</label>
                            <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                                <option value="">Select service</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration}min)</option>)}
                            </select>
                        </div>
                        <div className="grid-2">
                            <div className="input-group"><label>Date *</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                            <div className="input-group"><label>Time *</label><input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={create}>Create Booking</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
