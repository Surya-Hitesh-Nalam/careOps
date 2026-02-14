import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
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
                padding: 36,
                boxShadow: "var(--shadow-lg)",
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
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Welcome back</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Sign in to your CareOps account</p>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
                )}

                <form onSubmit={handleSubmit}>
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
                                placeholder="Enter your password"
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
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Create one</Link>
                </p>
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border-light)" }}>
                    <p style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: 12, letterSpacing: "0.05em", textAlign: "center" }}>
                        Judge Access / Demo Mode
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <button
                            type="button"
                            onClick={() => { setEmail("demo@careops.com"); setPassword("Judge123!"); }}
                            style={{
                                padding: "8px", fontSize: "0.8rem", borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border-color)", background: "var(--bg-tertiary)",
                                cursor: "pointer", fontWeight: 600, color: "var(--text-secondary)",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.color = "var(--accent)"; }}
                            onMouseLeave={e => { e.target.style.borderColor = "var(--border-color)"; e.target.style.color = "var(--text-secondary)"; }}
                        >
                            Login as Owner
                        </button>
                        <button
                            type="button"
                            onClick={() => { setEmail("staff@careops.com"); setPassword("Judge123!"); }}
                            style={{
                                padding: "8px", fontSize: "0.8rem", borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border-color)", background: "var(--bg-tertiary)",
                                cursor: "pointer", fontWeight: 600, color: "var(--text-secondary)",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.color = "var(--accent)"; }}
                            onMouseLeave={e => { e.target.style.borderColor = "var(--border-color)"; e.target.style.color = "var(--text-secondary)"; }}
                        >
                            Login as Staff
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
