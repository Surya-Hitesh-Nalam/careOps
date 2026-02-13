import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Clock, MapPin, DollarSign, User, Mail, Phone, CheckCircle, Zap } from "lucide-react";

const API = "/api/public/workspace";

export default function PublicBooking() {
    const { workspaceId } = useParams();
    const [workspace, setWorkspace] = useState(null);
    const [services, setServices] = useState([]);
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", time: "", notes: "" });
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [wsRes, svcRes] = await Promise.all([
                    fetch(`${API}/${workspaceId}`).then(r => r.json()),
                    fetch(`${API}/${workspaceId}/services`).then(r => r.json())
                ]);
                setWorkspace(wsRes.workspace);
                setServices(svcRes.services);
            } catch { }
            setLoading(false);
        };
        fetchData();
    }, [workspaceId]);

    const fetchSlots = async (date) => {
        if (!selectedService || !date) return;
        try {
            const res = await fetch(`/api/bookings/public/${workspaceId}/slots?serviceId=${selectedService.id}&date=${date}`);
            const data = await res.json();
            setSlots(data.slots || []);
        } catch { setSlots([]); }
    };

    const handleDateChange = (date) => {
        setForm({ ...form, date, time: "" });
        fetchSlots(date);
    };

    const submitBooking = async () => {
        setError("");
        if (!form.name || !form.email || !form.date || !form.time) { setError("Please fill all required fields"); return; }
        setSubmitting(true);
        try {
            const res = await fetch(`/api/bookings/public/${workspaceId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, serviceId: selectedService.id })
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
            setSuccess(true);
        } catch (err) { setError(err.message || "Booking failed"); }
        setSubmitting(false);
    };

    if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-primary)" }}><div className="loading-spinner" /></div>;

    if (success) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: 20 }}>
            <div style={{ textAlign: "center", maxWidth: 460, animation: "scaleIn 0.3s ease" }}>
                <CheckCircle size={64} color="var(--success)" style={{ marginBottom: 16 }} />
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8 }}>Booking Confirmed!</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.6 }}>
                    Your appointment for <strong>{selectedService?.name}</strong> on <strong>{form.date}</strong> at <strong>{form.time}</strong> has been confirmed. You'll receive a confirmation shortly.
                </p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "40px 20px" }}>
            <div style={{ maxWidth: 640, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{
                        width: 48, height: 48,
                        background: "linear-gradient(135deg, var(--accent), #a855f7)",
                        borderRadius: "var(--radius-sm)",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        color: "white", marginBottom: 12
                    }}><Zap size={24} /></div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{workspace?.name || "Book an Appointment"}</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Select a service and pick your preferred time</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {step === 1 && (
                    <div>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 16 }}>Choose a Service</h2>
                        <div style={{ display: "grid", gap: 12 }}>
                            {services.map(s => (
                                <div key={s.id} className="card" onClick={() => { setSelectedService(s); setStep(2); }}
                                    style={{ cursor: "pointer", transition: "all var(--transition-fast)", border: "2px solid var(--border-color)" }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-color)"}>
                                    <h3 style={{ fontWeight: 600, marginBottom: 6 }}>{s.name}</h3>
                                    <div style={{ display: "flex", gap: 16, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> {s.duration} min</span>
                                        {s.price > 0 && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><DollarSign size={14} /> ${s.price}</span>}
                                        {s.location && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={14} /> {s.location}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ animation: "fadeIn 0.3s ease" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)} style={{ marginBottom: 16 }}>← Change service</button>
                        <div className="card" style={{ marginBottom: 16, background: "var(--accent-light)", border: "1px solid var(--accent)" }}>
                            <div style={{ fontWeight: 600, color: "var(--accent)" }}>{selectedService?.name}</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{selectedService?.duration} min{selectedService?.price > 0 ? ` · $${selectedService.price}` : ""}</div>
                        </div>
                        <div className="grid-2">
                            <div className="input-group"><label>Full Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></div>
                            <div className="input-group"><label>Email *</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" /></div>
                        </div>
                        <div className="input-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" /></div>
                        <div className="grid-2">
                            <div className="input-group"><label>Date *</label><input type="date" value={form.date} onChange={e => handleDateChange(e.target.value)} min={new Date().toISOString().split("T")[0]} /></div>
                            <div className="input-group"><label>Time *</label>
                                {slots.length > 0 ? (
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                        {slots.map(s => (
                                            <button key={typeof s === 'string' ? s : s.start} className={`btn btn-sm ${form.time === (typeof s === 'string' ? s : s.start) ? "btn-primary" : "btn-secondary"}`} onClick={() => setForm({ ...form, time: typeof s === 'string' ? s : s.start })}>{typeof s === 'string' ? s : s.start}</button>
                                        ))}
                                    </div>
                                ) : (
                                    <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                                )}
                            </div>
                        </div>
                        <div className="input-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Anything we should know?" /></div>
                        <button className="btn btn-primary" onClick={submitBooking} disabled={submitting} style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}>
                            {submitting ? "Booking..." : "Confirm Booking"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
