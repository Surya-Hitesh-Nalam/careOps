import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
        setLoading(true);
        try {
            await register(name, email, password);
            navigate("/onboarding");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--bg-primary)", padding: 20
        }}>
            <div style={{
                width: "100%", maxWidth: 420,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: 36, boxShadow: "var(--shadow-lg)",
                animation: "scaleIn 0.3s ease"
            }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{
                        width: 48, height: 48,
                        background: "linear-gradient(135deg, var(--accent), #a855f7)",
                        borderRadius: "var(--radius-sm)",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        color: "white", marginBottom: 12
                    }}>
                        <Zap size={24} />
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Create your account</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Get started with CareOps in minutes</p>
                </div>

                {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPw ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Minimum 6 characters"
                                required
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{
                                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                                background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)"
                            }}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "12px 20px" }}
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
