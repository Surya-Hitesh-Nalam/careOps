import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, Zap } from "lucide-react";

export default function PublicForm() {
    const { formId } = useParams();
    const [template, setTemplate] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await fetch(`/api/forms/public/${formId}`);
                const data = await res.json();
                setTemplate(data.template);
            } catch { }
            setLoading(false);
        };
        fetchForm();
    }, [formId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const res = await fetch(`/api/forms/public/${formId}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers })
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
            setSuccess(true);
        } catch (err) { setError(err.message || "Submission failed"); }
        setSubmitting(false);
    };

    if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><div className="loading-spinner" /></div>;

    if (success) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: 20 }}>
            <div style={{ textAlign: "center", animation: "scaleIn 0.3s ease" }}>
                <CheckCircle size={64} color="var(--success)" style={{ marginBottom: 16 }} />
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8 }}>Form Submitted!</h1>
                <p style={{ color: "var(--text-secondary)" }}>Thank you for completing the form.</p>
            </div>
        </div>
    );

    if (!template) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "var(--text-secondary)" }}>Form not found</p>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "40px 20px" }}>
            <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, var(--accent), #a855f7)", borderRadius: "var(--radius-sm)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", marginBottom: 12 }}><Zap size={24} /></div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{template.title}</h1>
                    {template.description && <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 6 }}>{template.description}</p>}
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="card">
                    {template.fields?.map((field, i) => (
                        <div key={i} className="input-group">
                            <label>{field.label}{field.required ? " *" : ""}</label>
                            {field.type === "textarea" ? (
                                <textarea
                                    value={answers[field.label] || ""}
                                    onChange={e => setAnswers({ ...answers, [field.label]: e.target.value })}
                                    required={field.required}
                                />
                            ) : field.type === "select" ? (
                                <select value={answers[field.label] || ""} onChange={e => setAnswers({ ...answers, [field.label]: e.target.value })} required={field.required}>
                                    <option value="">Select...</option>
                                    {field.options?.map((opt, j) => <option key={j} value={opt}>{opt}</option>)}
                                </select>
                            ) : field.type === "checkbox" ? (
                                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", cursor: "pointer" }}>
                                    <input type="checkbox" checked={answers[field.label] || false} onChange={e => setAnswers({ ...answers, [field.label]: e.target.checked })} />
                                    {field.label}
                                </label>
                            ) : (
                                <input
                                    type={field.type}
                                    value={answers[field.label] || ""}
                                    onChange={e => setAnswers({ ...answers, [field.label]: e.target.value })}
                                    required={field.required}
                                />
                            )}
                        </div>
                    ))}
                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%", justifyContent: "center", padding: "12px 20px", marginTop: 8 }}>
                        {submitting ? "Submitting..." : "Submit Form"}
                    </button>
                </form>
            </div>
        </div>
    );
}
