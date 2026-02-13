import { useState } from "react";
import { useParams } from "react-router-dom";
import { Send, CheckCircle, Zap } from "lucide-react";

export default function PublicContact() {
    const { workspaceId } = useParams();
    const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.name || (!form.email && !form.phone) || !form.message) { setError("Please fill required fields"); return; }
        setSubmitting(true);
        try {
            const res = await fetch(`/api/public/workspace/${workspaceId}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
            setSuccess(true);
        } catch (err) { setError(err.message || "Failed to send"); }
        setSubmitting(false);
    };

    if (success) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: 20 }}>
            <div style={{ textAlign: "center", animation: "scaleIn 0.3s ease" }}>
                <CheckCircle size={64} color="var(--success)" style={{ marginBottom: 16 }} />
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8 }}>Message Sent!</h1>
                <p style={{ color: "var(--text-secondary)" }}>We'll get back to you as soon as possible.</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: 20 }}>
            <div style={{ width: "100%", maxWidth: 480, background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: 36, boxShadow: "var(--shadow-lg)" }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, var(--accent), #a855f7)", borderRadius: "var(--radius-sm)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", marginBottom: 12 }}><Zap size={24} /></div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Get in Touch</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Send us a message and we'll respond shortly</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required /></div>
                    <div className="input-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" /></div>
                    <div className="input-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" /></div>
                    <div className="input-group"><label>Message *</label><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" required style={{ minHeight: 100 }} /></div>
                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}>
                        <Send size={16} /> {submitting ? "Sending..." : "Send Message"}
                    </button>
                </form>
            </div>
        </div>
    );
}
