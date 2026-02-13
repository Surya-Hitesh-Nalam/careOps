import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Users, Plus, X, Search, Edit2, Trash2, Mail, Phone, ChevronRight } from "lucide-react";

export default function Contacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
    const nav = useNavigate();

    useEffect(() => { fetchContacts(); }, []);

    const fetchContacts = async () => {
        try { const { data } = await api.get("/contacts"); setContacts(data.contacts); } catch { }
        setLoading(false);
    };

    const openCreate = () => { setEditing(null); setForm({ name: "", email: "", phone: "", notes: "" }); setShowModal(true); };
    const openEdit = (c) => { setEditing(c); setForm({ name: c.name, email: c.email || "", phone: c.phone || "", notes: c.notes || "" }); setShowModal(true); };

    const save = async () => {
        try {
            if (editing) { await api.put(`/contacts/${editing.id}`, form); }
            else { await api.post("/contacts", form); }
            setShowModal(false); fetchContacts();
        } catch { }
    };

    const remove = async (id) => {
        if (!confirm("Delete this contact?")) return;
        try { await api.delete(`/contacts/${id}`); fetchContacts(); } catch { }
    };

    const filtered = contacts.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>Contacts</h1><p>{contacts.length} total contacts in your workspace</p></div>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Contact</button>
            </div>

            {/* Search */}
            <div className="card" style={{ padding: 14, marginBottom: 20 }}>
                <div className="search-input">
                    <Search size={16} />
                    <input placeholder="Search contacts by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {loading ? <div className="loading-spinner" /> : filtered.length === 0 ? (
                <div className="empty-state">
                    <Users size={48} /><h3>{search ? "No matches found" : "No contacts yet"}</h3>
                    <p>{search ? "Try different keywords" : "Add your first contact to get started"}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>Contact</th><th>Email</th><th>Phone</th><th>Source</th><th>Created</th><th style={{ width: 80 }}>Actions</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => nav(`/contacts/${c.id}`)}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div className="avatar sm">{c.name?.charAt(0).toUpperCase()}</div>
                                            <span style={{ fontWeight: 600 }}>{c.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: "var(--text-secondary)" }}>
                                        {c.email ? <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Mail size={13} /> {c.email}</span> : "—"}
                                    </td>
                                    <td style={{ color: "var(--text-secondary)" }}>
                                        {c.phone ? <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Phone size={13} /> {c.phone}</span> : "—"}
                                    </td>
                                    <td><span className="badge badge-default">{c.source || "manual"}</span></td>
                                    <td style={{ fontSize: "0.82rem", color: "var(--text-tertiary)" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}><Edit2 size={14} /></button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => remove(c.id)} style={{ color: "var(--error)" }}><Trash2 size={14} /></button>
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
                            <h2>{editing ? "Edit Contact" : "New Contact"}</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <div className="input-group"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></div>
                        <div className="input-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" /></div>
                        <div className="input-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" /></div>
                        <div className="input-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." /></div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save}>{editing ? "Update" : "Create"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
