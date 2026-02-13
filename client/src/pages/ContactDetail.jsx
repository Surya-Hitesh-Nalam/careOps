import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
    ArrowLeft, Mail, Phone, Calendar, FileText, MessageSquare,
    Clock, Edit2, Trash2, Tag, MapPin, User
} from "lucide-react";

export default function ContactDetail() {
    const { id } = useParams();
    const nav = useNavigate();
    const [contact, setContact] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => { fetchData(); }, [id]);

    const fetchData = async () => {
        try {
            const [cRes, bRes] = await Promise.all([
                api.get(`/contacts/${id}`),
                api.get("/bookings")
            ]);
            setContact(cRes.data.contact);
            setBookings(bRes.data.bookings.filter(b => b.contact?.id === id));
        } catch { }
        setLoading(false);
    };

    if (loading) return <div className="page-container"><div className="loading-spinner" /></div>;
    if (!contact) return <div className="page-container"><div className="empty-state"><h3>Contact not found</h3></div></div>;

    const tabs = ["overview", "bookings", "activity"];

    return (
        <div className="page-container">
            {/* Back button */}
            <button className="btn btn-ghost btn-sm" onClick={() => nav("/contacts")} style={{ marginBottom: 20 }}>
                <ArrowLeft size={16} /> Back to Contacts
            </button>

            {/* Contact Header */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                    <div className="avatar xl" style={{ fontSize: "1.5rem" }}>
                        {contact.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>{contact.name}</h1>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                            {contact.email && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail size={14} /> {contact.email}</span>}
                            {contact.phone && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Phone size={14} /> {contact.phone}</span>}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                            <span className="badge badge-accent">{contact.source || "manual"}</span>
                            <span className="badge badge-default" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <Clock size={11} /> {new Date(contact.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-secondary btn-sm"><Edit2 size={14} /> Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: "var(--error)" }}><Trash2 size={14} /></button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {tabs.map(t => (
                    <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
                <div className="grid-2">
                    <div className="card">
                        <div className="card-header"><span className="card-title">Contact Info</span></div>
                        <div style={{ display: "grid", gap: 14 }}>
                            {[
                                { icon: User, label: "Name", value: contact.name },
                                { icon: Mail, label: "Email", value: contact.email || "—" },
                                { icon: Phone, label: "Phone", value: contact.phone || "—" },
                                { icon: Tag, label: "Source", value: contact.source || "manual" },
                                { icon: Calendar, label: "Created", value: new Date(contact.createdAt).toLocaleDateString() },
                            ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", flexShrink: 0 }}>
                                            <Icon size={16} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500 }}>{item.label}</div>
                                            <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>{item.value}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {contact.notes && (
                            <div style={{ marginTop: 16, padding: 14, background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                <strong>Notes:</strong> {contact.notes}
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <div className="card-header"><span className="card-title">Quick Stats</span></div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {[
                                { label: "Total Bookings", value: bookings.length, color: "var(--accent)" },
                                { label: "Completed", value: bookings.filter(b => b.status === "completed").length, color: "var(--success)" },
                                { label: "No Shows", value: bookings.filter(b => b.status === "no_show").length, color: "var(--error)" },
                                { label: "Upcoming", value: bookings.filter(b => b.status === "confirmed").length, color: "var(--info)" },
                            ].map((s, i) => (
                                <div key={i} style={{ padding: 16, background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "bookings" && (
                <div className="card">
                    {bookings.length === 0 ? (
                        <div className="empty-state"><Calendar size={40} /><h3>No bookings</h3><p>This contact has no booking history</p></div>
                    ) : (
                        <div className="table-container" style={{ border: "none", boxShadow: "none" }}>
                            <table>
                                <thead><tr><th>Service</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b.id}>
                                            <td style={{ fontWeight: 600 }}>{b.service?.name || "—"}</td>
                                            <td>{new Date(b.date).toLocaleDateString()}</td>
                                            <td style={{ fontWeight: 600, color: "var(--accent)" }}>{b.time}</td>
                                            <td><span className={`badge badge-${b.status === "completed" ? "success" : b.status === "confirmed" ? "info" : b.status === "no_show" ? "error" : "default"}`}>{b.status?.replace("_", " ")}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "activity" && (
                <div className="card">
                    <div style={{ padding: "8px 0" }}>
                        {[
                            { action: "Contact created", time: contact.createdAt, icon: User, color: "var(--success)" },
                            ...bookings.map(b => ({ action: `Booking: ${b.service?.name || "Service"}`, time: b.createdAt, icon: Calendar, color: "var(--accent)" }))
                        ].sort((a, b) => new Date(b.time) - new Date(a.time)).map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
                                    borderBottom: "1px solid var(--border-light)"
                                }}>
                                    <div style={{ width: 34, height: 34, borderRadius: "var(--radius-full)", background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: item.color }}>
                                        <Icon size={16} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>{item.action}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{new Date(item.time).toLocaleString()}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
