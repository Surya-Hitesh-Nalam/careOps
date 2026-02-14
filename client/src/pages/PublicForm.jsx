import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { CheckCircle, AlertCircle, Send, Loader2, Calendar, FileText, Mail, Phone, User as UserIcon } from "lucide-react";

export default function PublicForm() {
    const { formId } = useParams();
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [answers, setAnswers] = useState({});
    const [contact, setContact] = useState({ name: "", email: "", phone: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const { data } = await api.get(`/forms/public/template/${formId}`);
                setTemplate(data.template);
                const initAnswers = {};
                data.template.fields.forEach(f => {
                    if (f.type === "checkbox_group") initAnswers[f.label] = [];
                    else if (f.type === "checkbox") initAnswers[f.label] = "No";
                    else initAnswers[f.label] = "";
                });
                setAnswers(initAnswers);
            } catch (err) {
                console.error(err);
                setError("Form not found or no longer available.");
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [formId]);

    const handleChange = (label, value) => {
        setAnswers(prev => ({ ...prev, [label]: value }));
    };

    const handleCheckboxGroup = (label, option, checked) => {
        setAnswers(prev => {
            const current = prev[label] || [];
            if (checked) return { ...prev, [label]: [...current, option] };
            return { ...prev, [label]: current.filter(o => o !== option) };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (!contact.name || !contact.email) {
                setSaving(false);
                return alert("Please fill in your contact details.");
            }

            const formattedAnswers = Object.entries(answers).map(([label, value]) => ({
                label,
                value: Array.isArray(value) ? value.join(", ") : value
            }));

            await api.post(`/forms/public/${formId}/submit`, {
                answers: formattedAnswers,
                submittedBy: contact.name,
                contactDetails: contact
            });
            setSuccess(true);
        } catch (err) {
            console.error(err);
            alert("Failed to submit form. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "bg-tertiary" }}>
            <Loader2 className="animate-spin" size={32} color="var(--accent)" />
        </div>
    );

    if (error) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div className="glass-panel" style={{ padding: 40, textAlign: 'center', maxWidth: 500 }}>
                <AlertCircle size={48} color="var(--error)" style={{ marginBottom: 20, marginInline: "auto" }} />
                <h3 style={{ fontSize: "1.25rem", marginBottom: 8 }}>Unable to Load Form</h3>
                <p style={{ color: "var(--text-secondary)" }}>{error}</p>
            </div>
        </div>
    );

    if (success) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)" }}>
            <div className="glass-panel" style={{ padding: 60, textAlign: 'center', maxWidth: 500, width: "100%", borderRadius: "24px" }}>
                <div style={{
                    width: 80, height: 80, background: "var(--success-light)",
                    borderRadius: "50%", display: "flex", alignItems: "center",
                    justifyContent: "center", margin: "0 auto 24px auto"
                }}>
                    <CheckCircle size={40} color="var(--success)" />
                </div>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 12 }}>Submission Received!</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                    Thank you for filling out <strong>{template?.title}</strong>. We'll be in touch soon.
                </p>
            </div>
        </div>
    );

    return (
        <div style={{
            minHeight: "100vh",
            padding: "40px 20px",
            background: "linear-gradient(to bottom right, var(--bg-primary), var(--bg-tertiary))",
            display: "flex",
            justifyContent: "center"
        }}>
            <div className="glass-panel" style={{ maxWidth: 700, width: "100%", borderRadius: "24px", overflow: "hidden", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-xl)" }}>
                {/* Header Banner */}
                <div style={{
                    background: "var(--accent-gradient)",
                    padding: "40px 32px",
                    color: "white",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ position: "relative", zIndex: 2 }}>
                        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>{template.title}</h1>
                        <p style={{ opacity: 0.9, fontSize: "1.05rem", maxWidth: "90%", lineHeight: 1.5 }}>{template.description || "Please fill out the information below."}</p>
                    </div>
                    {/* Decorative Circles */}
                    <div style={{ position: "absolute", top: -20, right: -20, width: 140, height: 140, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
                    <div style={{ position: "absolute", bottom: -40, left: -20, width: 100, height: 100, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
                </div>

                <div style={{ padding: "40px 32px" }}>
                    <form onSubmit={handleSubmit}>
                        {/* Contact Section */}
                        <div style={{ marginBottom: 32 }}>
                            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-tertiary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                                <UserIcon size={16} /> Your Details
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                                    <label>Full Name <span style={{ color: "var(--error)" }}>*</span></label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            required
                                            value={contact.name}
                                            onChange={e => setContact({ ...contact, name: e.target.value })}
                                            placeholder="John Doe"
                                            style={{ paddingLeft: 40 }}
                                        />
                                        <UserIcon size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Email <span style={{ color: "var(--error)" }}>*</span></label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            required
                                            type="email"
                                            value={contact.email}
                                            onChange={e => setContact({ ...contact, email: e.target.value })}
                                            placeholder="john@example.com"
                                            style={{ paddingLeft: 40 }}
                                        />
                                        <Mail size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Phone</label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            value={contact.phone}
                                            onChange={e => setContact({ ...contact, phone: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                            style={{ paddingLeft: 40 }}
                                        />
                                        <Phone size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr style={{ border: "none", height: 1, background: "var(--border-light)", margin: "32px 0" }} />

                        {/* Dynamic Fields */}
                        <div style={{ marginBottom: 40 }}>
                            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-tertiary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                                <FileText size={16} /> Form Questions
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                {template.fields.map((f, i) => (
                                    <div key={i} className="input-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: "0.95rem", marginBottom: 8 }}>
                                            {f.label}
                                            {f.required && <span style={{ color: "var(--error)", marginLeft: 4 }}>*</span>}
                                        </label>

                                        {f.type === "textarea" ? (
                                            <textarea
                                                required={f.required}
                                                value={answers[f.label]}
                                                onChange={e => handleChange(f.label, e.target.value)}
                                                rows={4}
                                                style={{ minHeight: 100, resize: "vertical" }}
                                                placeholder="Type your answer here..."
                                            />
                                        ) : f.type === "select" ? (
                                            <div style={{ position: "relative" }}>
                                                <select
                                                    required={f.required}
                                                    value={answers[f.label]}
                                                    onChange={e => handleChange(f.label, e.target.value)}
                                                    style={{ appearance: "none" }}
                                                >
                                                    <option value="">Select an option...</option>
                                                    {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                                <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-tertiary)" }}>▼</div>
                                            </div>
                                        ) : f.type === "radio" ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                                                {(f.options || []).map(o => (
                                                    <label key={o} style={{
                                                        display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                                                        padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)",
                                                        background: answers[f.label] === o ? "var(--bg-hover)" : "transparent",
                                                        transition: "all 0.2s ease"
                                                    }}>
                                                        <input
                                                            type="radio"
                                                            name={`field-${i}`}
                                                            required={f.required}
                                                            checked={answers[f.label] === o}
                                                            onChange={() => handleChange(f.label, o)}
                                                            style={{ width: 16, height: 16, margin: 0 }}
                                                        />
                                                        <span style={{ fontSize: "0.95rem" }}>{o}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : f.type === "checkbox_group" ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                                                {(f.options || []).map(o => (
                                                    <label key={o} style={{
                                                        display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                                                        padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)",
                                                        background: (answers[f.label] || []).includes(o) ? "var(--bg-hover)" : "transparent",
                                                        transition: "all 0.2s ease"
                                                    }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={(answers[f.label] || []).includes(o)}
                                                            onChange={(e) => handleCheckboxGroup(f.label, o, e.target.checked)}
                                                            style={{ width: 16, height: 16, margin: 0 }}
                                                        />
                                                        <span style={{ fontSize: "0.95rem" }}>{o}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : f.type === "date" ? (
                                            <div style={{ position: "relative" }}>
                                                <input
                                                    type="date"
                                                    required={f.required}
                                                    value={answers[f.label]}
                                                    onChange={e => handleChange(f.label, e.target.value)}
                                                />
                                                <Calendar size={18} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-tertiary)" }} />
                                            </div>
                                        ) : (
                                            <input
                                                type={f.type === "number" ? "number" : f.type === "email" ? "email" : "text"}
                                                required={f.required}
                                                value={answers[f.label]}
                                                onChange={e => handleChange(f.label, e.target.value)}
                                                placeholder={`Enter ${f.label.toLowerCase()}...`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary"
                            style={{
                                width: "100%",
                                padding: "16px",
                                fontSize: "1.1rem",
                                borderRadius: "var(--radius-md)",
                                display: "flex",
                                justifyContent: "center",
                                gap: 10,
                                boxShadow: "0 8px 24px rgba(99, 102, 241, 0.25)"
                            }}
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <>Submit Application <Send size={18} /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
