import { useState, useEffect } from "react";
import api from "../utils/api";
import { FileText, Plus, X, Trash2, Eye, ChevronRight, Hash, AlignLeft, List, ToggleLeft } from "lucide-react";

const fieldTypes = [
    { value: "text", label: "Short Text", icon: AlignLeft },
    { value: "textarea", label: "Long Text", icon: AlignLeft },
    { value: "number", label: "Number", icon: Hash },
    { value: "email", label: "Email", icon: AlignLeft },
    { value: "phone", label: "Phone", icon: Hash },
    { value: "date", label: "Date", icon: List },
    { value: "select", label: "Dropdown", icon: List },
    { value: "radio", label: "Radio Button", icon: ToggleLeft },
    { value: "checkbox_group", label: "Checkbox Group", icon: List },
    { value: "checkbox", label: "Single Checkbox", icon: ToggleLeft },
];

export default function Forms() {
    const [templates, setTemplates] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("templates");
    const [showModal, setShowModal] = useState(false);
    const [viewSub, setViewSub] = useState(null);
    const [form, setForm] = useState({ title: "", description: "", fields: [] });

    // Edit Field State
    const [editingFieldIdx, setEditingFieldIdx] = useState(null);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const { data } = await api.get("/forms/templates");
            setTemplates(data.templates);
        } catch (err) { console.error("Failed to fetch templates", err); }

        try {
            const { data } = await api.get("/forms/submissions");
            setSubmissions(data.submissions);
        } catch (err) { if (err.response?.status !== 403) console.error("Failed to fetch submissions", err); }
        setLoading(false);
    };

    const addField = () => setForm({ ...form, fields: [...form.fields, { label: "New Field", type: "text", required: false, options: "" }] });
    const removeField = (i) => setForm({ ...form, fields: form.fields.filter((_, j) => j !== i) });
    const updateField = (i, key, val) => {
        const fields = [...form.fields];
        fields[i] = { ...fields[i], [key]: val };
        setForm({ ...form, fields });
    };

    const handleCopyLink = (id) => {
        const url = `${window.location.origin}/form/${id}`;
        navigator.clipboard.writeText(url);
        alert(`Copied form link: ${url}`);
    };

    const saveTemplate = async () => {
        const payload = {
            ...form,
            fields: form.fields.map(f => ({
                ...f,
                options: (f.type === "select" || f.type === "radio" || f.type === "checkbox_group") && typeof f.options === 'string'
                    ? f.options.split(",").map(o => o.trim()).filter(Boolean)
                    : f.options // already array from AI
            }))
        };
        try { await api.post("/forms/templates", payload); setShowModal(false); fetchAll(); } catch { }
    };

    const deleteTemplate = async (id) => {
        if (!confirm("Delete this form form?")) return;
        try { await api.delete(`/forms/templates/${id}`); fetchAll(); } catch { }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>Forms</h1><p>Create templates and view client submissions</p></div>
                <button className="btn btn-primary" onClick={() => { setForm({ title: "", description: "", fields: [] }); setShowModal(true); }}>
                    <Plus size={16} /> New Template
                </button>
            </div>

            <div className="tabs">
                <button className={`tab ${activeTab === "templates" ? "active" : ""}`} onClick={() => setActiveTab("templates")}>
                    Templates <span className="badge badge-default" style={{ marginLeft: 6 }}>{templates.length}</span>
                </button>
                <button className={`tab ${activeTab === "submissions" ? "active" : ""}`} onClick={() => setActiveTab("submissions")}>
                    Submissions <span className="badge badge-default" style={{ marginLeft: 6 }}>{submissions.length}</span>
                </button>
            </div>

            {loading ? <div className="loading-spinner" /> : activeTab === "templates" ? (
                templates.length === 0 ? (
                    <div className="empty-state"><FileText size={48} /><h3>No form templates</h3><p>Create your first form template</p></div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                        {templates.map(t => (
                            <div key={t.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                                <div style={{ height: 3, background: "var(--accent-gradient)" }} />
                                <div style={{ padding: 20 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                        <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{t.title}</h3>
                                        <div style={{ display: 'flex', gap: 5 }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => handleCopyLink(t.id)} title="Share Link"><div style={{ fontSize: '12px' }}>🔗 Share</div></button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => deleteTemplate(t.id)} style={{ color: "var(--error)" }}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    {t.description && <p style={{ fontSize: "0.82rem", color: "var(--text-tertiary)", marginBottom: 12 }}>{t.description}</p>}
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <span className="badge badge-accent">{t.fields?.length || 0} fields</span>
                                    </div>
                                    <div style={{ marginTop: 12, padding: "10px 0", borderTop: "1px solid var(--border-light)", fontSize: "0.78rem", color: "var(--text-tertiary)" }}>
                                        Public link: /form/{t.id}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="table-container">
                    <table>
                        <thead><tr><th>Form</th><th>Submitted By</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {submissions.map(s => (
                                <tr key={s.id}>
                                    <td style={{ fontWeight: 600 }}>{s.template?.title || "—"}</td>
                                    <td>{s.contact?.name || s.submittedBy || "Anonymous"}</td>
                                    <td><span className={`badge badge-${s.status === "completed" ? "success" : "warning"}`}>{s.status || "pending"}</span></td>
                                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                                    <td><button className="btn btn-ghost btn-sm" onClick={() => setViewSub(s)}><Eye size={14} /> View</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Template Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>New Form Template</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <div className="input-group"><label>Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Client Intake Form" /></div>
                        <div className="input-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this form" /></div>

                        <button
                            className="btn btn-secondary btn-sm"
                            style={{ margin: "10px 0", width: "100%", justifyContent: "center", background: "var(--accent-light)", color: "var(--accent)", border: "none" }}
                            onClick={async () => {
                                if (!form.title) return alert("Please enter a title (e.g. 'Dental Intake') to generate fields.");
                                if (!confirm("Generate fields with AI? This will replace current fields.")) return;
                                try {
                                    const { data } = await api.post("/ai/form-template", { businessType: "Service Business", serviceName: form.title });
                                    setForm({ ...form, description: data.description, fields: data.fields });
                                } catch (e) { alert("AI generation failed"); }
                            }}
                        >
                            ✨ Auto-Generate Fields with AI
                        </button>

                        <div style={{ marginBottom: 12, maxHeight: 400, overflowY: 'auto', paddingRight: 5 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <label style={{ fontWeight: 700, fontSize: "0.88rem" }}>Fields ({form.fields.length})</label>
                                <button className="btn btn-secondary btn-sm" onClick={addField}><Plus size={14} /> Add Field</button>
                            </div>
                            {form.fields.map((f, i) => (
                                <div key={i} style={{
                                    padding: 14, background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)",
                                    marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start", border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div className="grid-2" style={{ gap: 8 }}>
                                            <input placeholder="Field label" value={f.label} onChange={e => updateField(i, "label", e.target.value)} />
                                            <select value={f.type} onChange={e => updateField(i, "type", e.target.value)}>
                                                {fieldTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                        </div>
                                        {/* Show options input for select/radio/checkbox_group */}
                                        {(f.type === "select" || f.type === "radio" || f.type === "checkbox_group") && (
                                            <input
                                                placeholder="Options (comma-separated, e.g. Red, Blue, Green)"
                                                value={Array.isArray(f.options) ? f.options.join(", ") : f.options}
                                                onChange={e => updateField(i, "options", e.target.value)}
                                                style={{ marginTop: 6 }}
                                            />
                                        )}
                                        <div style={{ marginTop: 5, fontSize: '12px' }}>
                                            <label><input type="checkbox" checked={f.required} onChange={e => updateField(i, "required", e.target.checked)} /> Required</label>
                                        </div>
                                    </div>
                                    <button className="btn btn-ghost btn-sm" onClick={() => removeField(i)} style={{ color: "var(--error)" }}><Trash2 size={14} /></button>
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={saveTemplate}>Create Template</button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Submission Overlay logic remains same but simplified for brevity in this replacement */}
            {viewSub && (
                <div className="modal-overlay" onClick={() => setViewSub(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Submission</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setViewSub(null)}><X size={18} /></button>
                        </div>
                        {viewSub.answers?.map((a, i) => (
                            <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--border-light)" }}>
                                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-tertiary)" }}>{a.label}</div>
                                <div>{Array.isArray(a.value) ? a.value.join(", ") : (a.value || "—")}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
