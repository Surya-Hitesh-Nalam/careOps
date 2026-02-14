import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import { useBusiness } from "../contexts/BusinessContext";
import { BUSINESS_TYPES } from "../config/businessTypes";
import {
    Building2, Mail, Phone, Globe, FileText, Calendar,
    Package, UserPlus, CheckCircle, ChevronRight, ChevronLeft,
    Plus, Trash2, Zap, ArrowRight, Clock, Star, Shield, Sparkles, Loader
} from "lucide-react";

const steps = [
    { num: 1, title: "Workspace", icon: Building2, desc: "Set up your business", color: "#6366f1" },
    { num: 2, title: "Channels", icon: Mail, desc: "Communication", color: "#8b5cf6" },
    { num: 3, title: "Services", icon: Calendar, desc: "Your offerings", color: "#a855f7" },
    { num: 4, title: "Availability", icon: Clock, desc: "Set schedule", color: "#d946ef" },
    { num: 5, title: "Forms", icon: FileText, desc: "Intake forms", color: "#ec4899" },
    { num: 6, title: "Inventory", icon: Package, desc: "Track resources", color: "#f43f5e" },
    { num: 7, title: "Staff", icon: UserPlus, desc: "Invite team", color: "#f97316" },
    { num: 8, title: "Activate", icon: CheckCircle, desc: "Go live", color: "#10b981" }
];

const stepIllustrations = {
    1: { emoji: "🏢", headline: "Let's build your workspace", sub: "Tell us about your business so we can personalize your experience." },
    2: { emoji: "📡", headline: "Connect your channels", sub: "Set up Email and SMS so your customers can reach you." },
    3: { emoji: "📋", headline: "Define your services", sub: "Add the services you offer so customers can book them." },
    4: { emoji: "🗓️", headline: "Set your availability", sub: "Define when customers can book appointments with you." },
    5: { emoji: "📝", headline: "Create intake forms", sub: "Design forms to collect information before appointments." },
    6: { emoji: "📦", headline: "Set up inventory", sub: "Track supplies and get alerts when stock is low." },
    7: { emoji: "👥", headline: "Invite your team", sub: "Add staff members and set their permissions." },
    8: { emoji: "🚀", headline: "You're ready to launch!", sub: "Everything is set up. Activate your workspace to go live." }
};

export default function Onboarding() {
    const { user } = useAuth();
    const { setType, meta } = useBusiness();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [ws, setWs] = useState(null);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // Step 1 — Workspace
    const [wsName, setWsName] = useState("");
    const [wsType, setWsType] = useState("");
    const [wsAddress, setWsAddress] = useState("");
    const [wsTimezone, setWsTimezone] = useState("UTC");
    const [wsEmail, setWsEmail] = useState("");
    const [wsPhone, setWsPhone] = useState("");

    // Step 2 — Channels
    const [smtpHost, setSmtpHost] = useState("");
    const [smtpPort, setSmtpPort] = useState("587");
    const [smtpUser, setSmtpUser] = useState("");
    const [smtpPass, setSmtpPass] = useState("");
    const [twilioSid, setTwilioSid] = useState("");
    const [twilioAuth, setTwilioAuth] = useState("");
    const [twilioPhone, setTwilioPhone] = useState("");

    // Step 3 — Services
    const [svcName, setSvcName] = useState("");
    const [svcDuration, setSvcDuration] = useState(30);
    const [svcPrice, setSvcPrice] = useState(0);
    const [svcDesc, setSvcDesc] = useState("");
    const [services, setServices] = useState([]);

    // Step 4 — Availability
    const [availService, setAvailService] = useState("");
    const [availDay, setAvailDay] = useState(1);
    const [availStart, setAvailStart] = useState("09:00");
    const [availEnd, setAvailEnd] = useState("17:00");

    // Step 5 — Forms
    const [formTitle, setFormTitle] = useState("Client Intake Form");
    const [formFields, setFormFields] = useState([{ label: "Full Name", type: "text", required: true }]);

    // Step 6 — Inventory
    const [invName, setInvName] = useState("");
    const [invQty, setInvQty] = useState(10);
    const [invUnit, setInvUnit] = useState("pcs");
    const [invThreshold, setInvThreshold] = useState(5);

    // Step 7 — Staff
    const [staffName, setStaffName] = useState("");
    const [staffEmail, setStaffEmail] = useState("");
    const [staffPass, setStaffPass] = useState("");

    useEffect(() => { loadWorkspace(); }, []);

    const loadWorkspace = async () => {
        try {
            const { data } = await api.get("/workspace/mine");
            if (data.workspace) {
                setWs(data.workspace);
                setStep(data.workspace.onboardingStep || 1);
                setWsName(data.workspace.name || "");
                setWsType(data.workspace.type || "");
                setWsAddress(data.workspace.address || "");
                setWsEmail(data.workspace.contactEmail || "");
                setWsPhone(data.workspace.phone || "");
            }
        } catch { }
    };

    const msg = (s, e) => { setStatus(s); setError(e || ""); setTimeout(() => setStatus(""), 3000); };

    const createWorkspace = async () => {
        if (!wsName) return msg("", "Workspace name is required");
        setSaving(true);
        try {
            if (ws) {
                const { data } = await api.put(`/workspace/${ws.id}`, { name: wsName, type: wsType, address: wsAddress, timezone: wsTimezone, contactEmail: wsEmail, phone: wsPhone, onboardingStep: 2 });
                setWs(data.workspace);
            } else {
                const { data } = await api.post("/workspace", { name: wsName, type: wsType, address: wsAddress, timezone: wsTimezone, contactEmail: wsEmail, phone: wsPhone });
                setWs(data.workspace);
            }
            setStep(2);
        } catch (err) { msg("", err.response?.data?.message || "Failed"); }
        setSaving(false);
    };

    const configureEmail = async () => {
        setSaving(true);
        try {
            await api.put("/integrations/email", { host: smtpHost, port: Number(smtpPort), user: smtpUser, pass: smtpPass });
            msg("Email configured!");
        } catch (err) { msg("", err.response?.data?.message || "Failed"); }
        setSaving(false);
    };

    const configureSms = async () => {
        setSaving(true);
        try {
            await api.put("/integrations/sms", { sid: twilioSid, authToken: twilioAuth, phone: twilioPhone });
            msg("SMS configured!");
        } catch (err) { msg("", err.response?.data?.message || "Failed"); }
        setSaving(false);
    };

    const skipChannel = async () => {
        try {
            if (ws) await api.put(`/workspace/${ws.id}`, { onboardingStep: 3 });
            setStep(3);
        } catch { setStep(3); }
    };

    const addService = async () => {
        if (!svcName || !svcDuration) return msg("", "Name and duration are required");
        setSaving(true);
        try {
            const { data } = await api.post("/services", { name: svcName, description: svcDesc, duration: Number(svcDuration), price: Number(svcPrice) });
            setServices([...services, data.service]);
            setSvcName(""); setSvcDesc(""); setSvcDuration(30); setSvcPrice(0);
            msg("Service added!");
        } catch (err) { msg("", err.response?.data?.message || "Failed"); }
        setSaving(false);
    };

    const saveAvailability = async () => {
        if (!availService) return msg("", "Select a service first");
        setSaving(true);
        try {
            await api.post("/availability", { serviceId: availService, dayOfWeek: Number(availDay), slots: [{ start: availStart, end: availEnd }] });
            msg("Availability saved!");
        } catch (err) { msg("", err.response?.data?.message || "Failed"); }
        setSaving(false);
    };

    const addFormField = () => setFormFields([...formFields, { label: "", type: "text", required: false }]);
    const removeFormField = (idx) => { const f = [...formFields]; f.splice(idx, 1); setFormFields(f); };

    const createFormTemplate = async () => {
        if (!formTitle) return msg("", "Form title required");
        setSaving(true);
        try {
            await api.post("/forms/templates", { title: formTitle, fields: formFields });
            msg("Form created!");
        } catch (err) { msg("", err.response?.data?.message || "Failed"); }
        setSaving(false);
    };

    const generateTemplate = async () => {
        setSaving(true);
        try {
            // Use the first service name or a generic term
            const serviceName = services.length > 0 ? services[0].name : "General Service";
            const { data } = await api.post("/ai/form-template", { businessType: wsType, serviceName });
            if (data.fields) {
                setFormTitle(data.title);
                setFormFields(data.fields);
                msg("AI Generated Form!");
            }
        } catch (err) { msg("", "AI generation failed"); }
        setSaving(false);
    };

    const addInventoryItem = async () => {
        if (!invName) return msg("", "Item name required");
        setSaving(true);
        try {
            await api.post("/inventory", { name: invName, quantity: Number(invQty), unit: invUnit, threshold: Number(invThreshold) });
            msg("Item added!");
            setInvName(""); setInvQty(10);
        } catch (err) { msg("", err.response?.data?.message || "Failed"); }
        setSaving(false);
    };

    const inviteStaff = async () => {
        if (!staffName || !staffEmail || !staffPass) return msg("", "All fields required");
        setSaving(true);
        try {
            await api.post("/staff/invite", { name: staffName, email: staffEmail, password: staffPass });
            msg("Staff invited!");
            setStaffName(""); setStaffEmail(""); setStaffPass("");
        } catch (err) { msg("", err.response?.data?.message || "Failed"); }
        setSaving(false);
    };

    const activateWorkspace = async () => {
        if (!ws) return;
        setSaving(true);
        try {
            await api.put(`/workspace/${ws.id}/activate`);
            msg("Workspace activated! 🎉");
            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (err) {
            msg("", err.response?.data?.errors?.join(", ") || err.response?.data?.message || "Activation failed");
        }
        setSaving(false);
    };

    const goStep = (s) => {
        if (s < 1 || s > 8) return;
        if (s > 1 && !ws) return msg("", "Create workspace first");
        setStep(s);
        if (ws) api.put(`/workspace/${ws.id}`, { onboardingStep: s }).catch(() => { });
    };

    const ill = stepIllustrations[step];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const handleTypeSelect = (t) => {
        setWsType(t.label);
        setType(t.id);

        // Auto-configure services based on type
        if (t.id === "clinical") {
            setServices([
                { name: "General Checkup", duration: 30, price: 150, description: "Standard health assessment" },
                { name: "Specialist Consultation", duration: 45, price: 250, description: "In-depth review with a specialist" }
            ]);
        } else if (t.id === "salon") {
            setServices([
                { name: "Haircut & Style", duration: 60, price: 80, description: "Wash, cut and blowdry" },
                { name: "Color Treatment", duration: 120, price: 150, description: "Full head color" }
            ]);
        } else if (t.id === "auto") {
            setServices([
                { name: "Oil Change", duration: 45, price: 60, description: "Synthetic oil change and filter replacement" },
                { name: "Brake Inspection", duration: 30, price: 40, description: "Detailed brake system check" }
            ]);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex" }}>
            {/* Left Panel — Illustration & Progress */}
            <div style={{
                width: 380, background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)",
                display: "flex", flexDirection: "column", padding: "40px 32px", color: "white",
                position: "relative", overflow: "hidden"
            }}>
                {/* Background decoration */}
                <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
                <div style={{ position: "absolute", bottom: -40, left: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

                <div style={{ marginBottom: 40 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #6366f1, #a855f7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Zap size={18} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>CareOps</span>
                    </div>
                    <p style={{ fontSize: "0.82rem", opacity: 0.6 }}>Setting up your workspace</p>
                </div>

                {/* Step illustration */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                    <div style={{
                        fontSize: 64, marginBottom: 20,
                        animation: "float 3s ease-in-out infinite",
                        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))"
                    }}>{ill.emoji}</div>
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 8 }}>{ill.headline}</h2>
                    <p style={{ fontSize: "0.88rem", opacity: 0.7, lineHeight: 1.6, maxWidth: 280 }}>{ill.sub}</p>
                </div>

                {/* Step progress */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        const isActive = step === s.num;
                        const isComplete = step > s.num;
                        return (
                            <div key={i} onClick={() => goStep(s.num)} style={{
                                display: "flex", alignItems: "center", gap: 12, padding: "8px 12px",
                                borderRadius: 10, cursor: "pointer",
                                background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                                transition: "all 0.2s ease"
                            }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                                    background: isComplete ? s.color : isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                                    transition: "all 0.3s ease", flexShrink: 0
                                }}>
                                    {isComplete ? <CheckCircle size={14} /> : <Icon size={14} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: isActive ? 700 : 500, fontSize: "0.82rem", opacity: isActive ? 1 : 0.6 }}>{s.title}</div>
                                </div>
                                {isActive && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Panel — Form Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
                <div style={{ flex: 1, maxWidth: 640, margin: "0 auto", padding: "48px 40px", width: "100%" }}>
                    {/* Step indicator */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                        <div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Step {step} of 8</div>
                            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{steps[step - 1].title}</h1>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                            {steps.map((_, i) => (
                                <div key={i} style={{
                                    width: step === i + 1 ? 24 : 8, height: 8, borderRadius: 4,
                                    background: i + 1 <= step ? "var(--accent)" : "var(--border-color)",
                                    transition: "all 0.3s ease"
                                }} />
                            ))}
                        </div>
                    </div>

                    {/* Status messages */}
                    {status && <div className="alert alert-success" style={{ marginBottom: 16, animation: "fadeInUp 0.3s ease" }}><CheckCircle size={16} /> {status}</div>}
                    {error && <div className="alert alert-error" style={{ marginBottom: 16, animation: "fadeInUp 0.3s ease" }}>{error}</div>}

                    {/* ─── STEP 1: Workspace ─── */}
                    {step === 1 && (
                        <div style={{ animation: "fadeInUp 0.4s ease" }}>
                            <div className="input-group"><label>Business Name *</label><input value={wsName} onChange={e => setWsName(e.target.value)} placeholder="e.g. Sunrise Care Clinic" /></div>
                            <div className="input-group">
                                <label>Business Type</label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    {Object.values(BUSINESS_TYPES).filter(t => t.id !== "general").map(t => (
                                        <div key={t.id} onClick={() => handleTypeSelect(t)} style={{
                                            padding: 16, borderRadius: "var(--radius-md)",
                                            border: wsType === t.label ? "2px solid var(--accent)" : "1px solid var(--border-color)",
                                            background: wsType === t.label ? "var(--accent-light)" : "var(--bg-secondary)",
                                            cursor: "pointer", transition: "all 0.2s ease",
                                            display: "flex", flexDirection: "column", gap: 8
                                        }}>
                                            <div style={{ fontWeight: 700, color: wsType === t.label ? "var(--accent)" : "var(--text-primary)" }}>{t.label}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                                                Managing {t.customerTerm}s & {t.serviceTerm}s
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div className="input-group"><label>Contact Email</label><input value={wsEmail} onChange={e => setWsEmail(e.target.value)} placeholder="hello@clinic.com" /></div>
                                <div className="input-group"><label>Phone</label><input value={wsPhone} onChange={e => setWsPhone(e.target.value)} placeholder="+1 555 000 0000" /></div>
                            </div>
                            <div className="input-group"><label>Address</label><input value={wsAddress} onChange={e => setWsAddress(e.target.value)} placeholder="123 Care St, Suite 100" /></div>
                            <button className="btn btn-primary" onClick={createWorkspace} disabled={saving} style={{ width: "100%", justifyContent: "center", marginTop: 16, padding: "14px 20px" }}>
                                {saving ? <Loader size={16} className="animate-spin" /> : <><span>{ws ? "Update & Continue" : "Create Workspace"}</span><ArrowRight size={16} /></>}
                            </button>
                        </div>
                    )}

                    {/* ─── STEP 2: Channels ─── */}
                    {step === 2 && (
                        <div style={{ animation: "fadeInUp 0.4s ease" }}>
                            <div className="card" style={{ marginBottom: 16 }}>
                                <div className="card-header"><span className="card-title"><Mail size={16} /> Email (SMTP)</span></div>
                                <div style={{ padding: 16 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                                        <div className="input-group"><label>SMTP Host</label><input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" /></div>
                                        <div className="input-group"><label>Port</label><input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="587" /></div>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                        <div className="input-group"><label>User</label><input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="email@domain.com" /></div>
                                        <div className="input-group"><label>Password</label><input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} placeholder="App password" /></div>
                                    </div>
                                    <button className="btn btn-primary btn-sm" onClick={configureEmail} disabled={saving}>{saving ? "Saving..." : "Configure Email"}</button>
                                </div>
                            </div>
                            <div className="card" style={{ marginBottom: 16 }}>
                                <div className="card-header"><span className="card-title"><Phone size={16} /> SMS (Twilio)</span></div>
                                <div style={{ padding: 16 }}>
                                    <div className="input-group"><label>Account SID</label><input value={twilioSid} onChange={e => setTwilioSid(e.target.value)} placeholder="ACxxxxxxx" /></div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                        <div className="input-group"><label>Auth Token</label><input type="password" value={twilioAuth} onChange={e => setTwilioAuth(e.target.value)} /></div>
                                        <div className="input-group"><label>Phone Number</label><input value={twilioPhone} onChange={e => setTwilioPhone(e.target.value)} placeholder="+1234567890" /></div>
                                    </div>
                                    <button className="btn btn-primary btn-sm" onClick={configureSms} disabled={saving}>{saving ? "Saving..." : "Configure SMS"}</button>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                                <button className="btn btn-ghost" onClick={() => goStep(1)} style={{ flex: 1, justifyContent: "center" }}><ChevronLeft size={16} /> Back</button>
                                <button className="btn btn-primary" onClick={() => goStep(3)} style={{ flex: 2, justifyContent: "center" }}>Continue <ArrowRight size={16} /></button>
                                <button className="btn btn-ghost" onClick={skipChannel} style={{ flex: 1, justifyContent: "center" }}>Skip</button>
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 3: Services ─── */}
                    {step === 3 && (
                        <div style={{ animation: "fadeInUp 0.4s ease" }}>
                            {services.length > 0 && (
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                                    {services.map((s, i) => (
                                        <div key={i} style={{ padding: "8px 14px", borderRadius: "var(--radius-md)", background: "var(--accent-light)", border: "1px solid var(--accent)", fontSize: "0.82rem", fontWeight: 600 }}>
                                            <Star size={12} style={{ marginRight: 4, color: "var(--accent)" }} />{s.name} — {s.duration}min
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div className="input-group"><label>Service Name *</label><input value={svcName} onChange={e => setSvcName(e.target.value)} placeholder="e.g. Consultation" /></div>
                                <div className="input-group"><label>Duration (minutes) *</label><input type="number" value={svcDuration} onChange={e => setSvcDuration(e.target.value)} /></div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div className="input-group"><label>Price ($)</label><input type="number" value={svcPrice} onChange={e => setSvcPrice(e.target.value)} /></div>
                                <div className="input-group">
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                        <label style={{ marginBottom: 0 }}>Description</label>
                                        <button className="btn btn-ghost btn-sm" style={{ padding: "0 6px", height: 20, fontSize: "0.7rem", color: "var(--accent)" }}
                                            onClick={async () => {
                                                if (!svcName) return msg("", "Enter a service name first");
                                                setSvcDesc("Generating...");
                                                try {
                                                    // Quick inline AI call or mock for now as we don't have a specific route for this yet, 
                                                    // but I'll use a new endpoint I'll add or just a placeholder for the hackathon demo if route not ready.
                                                    // Actually, I'll add the route to ai.js next.
                                                    const res = await api.post("/ai/generate-description", { name: svcName, type: wsType });
                                                    setSvcDesc(res.data.description);
                                                } catch (e) { setSvcDesc(svcName + " service including consultation and treatment."); }
                                            }}>
                                            <Sparkles size={10} style={{ marginRight: 4 }} /> AI Write
                                        </button>
                                    </div>
                                    <textarea value={svcDesc} onChange={e => setSvcDesc(e.target.value)} placeholder="Brief description" />
                                </div>
                            </div>
                            <button className="btn btn-secondary" onClick={addService} disabled={saving} style={{ marginBottom: 16 }}><Plus size={16} /> Add Service</button>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button className="btn btn-ghost" onClick={() => goStep(2)}><ChevronLeft size={16} /> Back</button>
                                <button className="btn btn-primary" onClick={() => goStep(4)} style={{ flex: 1, justifyContent: "center" }}>Continue <ArrowRight size={16} /></button>
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 4: Availability ─── */}
                    {step === 4 && (
                        <div style={{ animation: "fadeInUp 0.4s ease" }}>
                            <div className="input-group">
                                <label>Service</label>
                                <select value={availService} onChange={e => setAvailService(e.target.value)}>
                                    <option value="">Select a service</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Day of Week</label>
                                <select value={availDay} onChange={e => setAvailDay(e.target.value)}>
                                    {dayNames.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                </select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div className="input-group"><label>Start Time</label><input type="time" value={availStart} onChange={e => setAvailStart(e.target.value)} /></div>
                                <div className="input-group"><label>End Time</label><input type="time" value={availEnd} onChange={e => setAvailEnd(e.target.value)} /></div>
                            </div>
                            <button className="btn btn-secondary" onClick={saveAvailability} disabled={saving}><Clock size={16} /> Save Availability</button>
                            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                                <button className="btn btn-ghost" onClick={() => goStep(3)}><ChevronLeft size={16} /> Back</button>
                                <button className="btn btn-primary" onClick={() => goStep(5)} style={{ flex: 1, justifyContent: "center" }}>Continue <ArrowRight size={16} /></button>
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 5: Forms ─── */}
                    {step === 5 && (
                        <div style={{ animation: "fadeInUp 0.4s ease" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
                                <div className="input-group" style={{ marginBottom: 0, flex: 1, marginRight: 12 }}>
                                    <label>Form Title</label>
                                    <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Client Intake Form" />
                                </div>
                                <button className="btn btn-ghost" onClick={generateTemplate} disabled={saving} style={{
                                    border: "1px solid var(--accent)", color: "var(--accent)", background: "var(--accent-light)", height: 42
                                }}>
                                    {saving ? <Loader size={16} className="animate-spin" /> : <><Sparkles size={16} /> AI Generate</>}
                                </button>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", fontWeight: 600, fontSize: "0.82rem", marginBottom: 8 }}>Fields</label>
                                {formFields.map((f, i) => (
                                    <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
                                        <input value={f.label} onChange={e => { const ff = [...formFields]; ff[i].label = e.target.value; setFormFields(ff); }} placeholder="Field label" />
                                        <select value={f.type} onChange={e => { const ff = [...formFields]; ff[i].type = e.target.value; setFormFields(ff); }}>
                                            {["text", "email", "phone", "textarea", "select", "checkbox", "date", "number"].map(t => <option key={t}>{t}</option>)}
                                        </select>
                                        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", cursor: "pointer" }}>
                                            <input type="checkbox" checked={f.required} onChange={e => { const ff = [...formFields]; ff[i].required = e.target.checked; setFormFields(ff); }} /> Req
                                        </label>
                                        <button className="btn btn-ghost btn-sm" onClick={() => removeFormField(i)} style={{ color: "var(--error)" }}><Trash2 size={14} /></button>
                                    </div>
                                ))}
                                <button className="btn btn-ghost btn-sm" onClick={addFormField}><Plus size={14} /> Add Field</button>
                            </div>
                            <button className="btn btn-secondary" onClick={createFormTemplate} disabled={saving} style={{ marginBottom: 16 }}><FileText size={16} /> Create Form</button>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button className="btn btn-ghost" onClick={() => goStep(4)}><ChevronLeft size={16} /> Back</button>
                                <button className="btn btn-primary" onClick={() => goStep(6)} style={{ flex: 1, justifyContent: "center" }}>Continue <ArrowRight size={16} /></button>
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 6: Inventory ─── */}
                    {step === 6 && (
                        <div style={{ animation: "fadeInUp 0.4s ease" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div className="input-group"><label>Item Name *</label><input value={invName} onChange={e => setInvName(e.target.value)} placeholder="e.g. Gloves" /></div>
                                <div className="input-group"><label>Quantity</label><input type="number" value={invQty} onChange={e => setInvQty(e.target.value)} /></div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div className="input-group"><label>Unit</label><input value={invUnit} onChange={e => setInvUnit(e.target.value)} placeholder="pcs, boxes, etc" /></div>
                                <div className="input-group"><label>Low Stock Threshold</label><input type="number" value={invThreshold} onChange={e => setInvThreshold(e.target.value)} /></div>
                            </div>
                            <button className="btn btn-secondary" onClick={addInventoryItem} disabled={saving}><Package size={16} /> Add Item</button>
                            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                                <button className="btn btn-ghost" onClick={() => goStep(5)}><ChevronLeft size={16} /> Back</button>
                                <button className="btn btn-primary" onClick={() => goStep(7)} style={{ flex: 1, justifyContent: "center" }}>Continue <ArrowRight size={16} /></button>
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 7: Staff ─── */}
                    {step === 7 && (
                        <div style={{ animation: "fadeInUp 0.4s ease" }}>
                            <div className="input-group"><label>Staff Name</label><input value={staffName} onChange={e => setStaffName(e.target.value)} placeholder="Jane Doe" /></div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div className="input-group"><label>Email</label><input value={staffEmail} onChange={e => setStaffEmail(e.target.value)} placeholder="jane@clinic.com" /></div>
                                <div className="input-group"><label>Password</label><input type="password" value={staffPass} onChange={e => setStaffPass(e.target.value)} placeholder="min. 6 characters" /></div>
                            </div>
                            <button className="btn btn-secondary" onClick={inviteStaff} disabled={saving}><UserPlus size={16} /> Invite Staff</button>
                            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                                <button className="btn btn-ghost" onClick={() => goStep(6)}><ChevronLeft size={16} /> Back</button>
                                <button className="btn btn-primary" onClick={() => goStep(8)} style={{ flex: 1, justifyContent: "center" }}>Continue <ArrowRight size={16} /></button>
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 8: Activate ─── */}
                    {step === 8 && (
                        <div style={{ animation: "fadeInUp 0.4s ease", textAlign: "center", paddingTop: 40 }}>
                            <div style={{ fontSize: 72, marginBottom: 20 }}>🚀</div>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 12 }}>Your Workspace is Ready!</h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", maxWidth: 420, margin: "0 auto 32px", lineHeight: 1.6 }}>
                                You've completed all the setup steps. Activate your workspace to start receiving bookings,
                                managing customers, and growing your business with CareOps.
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320, margin: "0 auto" }}>
                                <button className="btn btn-primary" onClick={activateWorkspace} disabled={saving} style={{ width: "100%", justifyContent: "center", padding: "16px 24px", fontSize: "1rem" }}>
                                    {saving ? <Loader size={18} className="animate-spin" /> : <><Sparkles size={18} /> Activate Workspace</>}
                                </button>
                                <button className="btn btn-ghost" onClick={() => navigate("/dashboard")} style={{ justifyContent: "center" }}>Skip to Dashboard</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
