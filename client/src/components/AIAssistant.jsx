import { useState } from "react";
import { Sparkles, X, MessageSquare, FileText, BarChart2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ role: "ai", text: "Hi! I'm your CareOps AI Assistant. How can I help you today?" }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    const suggestions = [
        { label: "Summarize this page", icon: FileText, query: "Summarize the key information on the current page." },
        { label: "Draft an email", icon: MessageSquare, query: "Draft a professional email to a client about a rescheduling." },
        { label: "Business Insights", icon: BarChart2, query: "Analyze my business performance for today." },
    ];

    const handleSend = async (text) => {
        if (!text && !input) return;
        const query = text || input;

        setMessages(prev => [...prev, { role: "user", text: query }]);
        setInput("");
        setLoading(true);

        try {
            // Context aware request
            const context = {
                path: location.pathname,
                // In a real app, we might scrape page content here
            };

            const { data } = await api.post("/ai/assist", { query, context });
            setMessages(prev => [...prev, { role: "ai", text: data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: "ai", text: "Sorry, I encountered an error processing your request." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed", bottom: 32, right: 32,
                    width: 56, height: 56, borderRadius: "50%",
                    background: "var(--accent-gradient)",
                    color: "white", border: "none",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", zIndex: 1000,
                    transition: "transform 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
                {isOpen ? <X size={24} /> : <Sparkles size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="glass-panel" style={{
                    position: "fixed", bottom: 100, right: 32,
                    width: 350, height: 500,
                    borderRadius: 16,
                    display: "flex", flexDirection: "column",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    zIndex: 1000, overflow: "hidden",
                    border: "1px solid var(--border-light)"
                }}>
                    <div style={{ padding: "16px 20px", background: "var(--accent-gradient)", color: "white", display: "flex", alignItems: "center", gap: 8 }}>
                        <Sparkles size={18} />
                        <span style={{ fontWeight: 600 }}>AI Assistant</span>
                    </div>

                    <div style={{ flex: 1, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                                background: m.role === "user" ? "var(--accent)" : "var(--bg-tertiary)",
                                color: m.role === "user" ? "white" : "var(--text-primary)",
                                padding: "10px 14px", borderRadius: 12,
                                maxWidth: "85%", fontSize: "0.9rem", lineHeight: "1.4"
                            }}>
                                {m.text}
                            </div>
                        ))}
                        {loading && <div style={{ alignSelf: "flex-start", padding: "10px 14px", background: "var(--bg-tertiary)", borderRadius: 12, fontSize: "0.8rem", color: "var(--text-tertiary)" }}>Thinking...</div>}

                        {messages.length === 1 && (
                            <div style={{ marginTop: 20 }}>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 10, fontWeight: 600 }}>TRY ASKING:</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {suggestions.map((s, i) => (
                                        <button key={i} onClick={() => handleSend(s.query)} style={{
                                            display: "flex", alignItems: "center", gap: 10,
                                            padding: "10px", background: "var(--bg-secondary)",
                                            border: "1px solid var(--border-color)", borderRadius: 8,
                                            cursor: "pointer", textAlign: "left", color: "var(--text-primary)",
                                            fontSize: "0.85rem", transition: "background 0.2s"
                                        }} className="hover-bg">
                                            <s.icon size={16} color="var(--accent)" />
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: 16, borderTop: "1px solid var(--border-light)", background: "var(--bg-secondary)" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSend()}
                                placeholder="Ask me anything..."
                                style={{
                                    flex: 1, padding: "10px 14px", borderRadius: 20,
                                    border: "1px solid var(--border-color)",
                                    background: "var(--bg-primary)", color: "var(--text-primary)",
                                    fontSize: "0.9rem", outline: "none"
                                }}
                            />
                            <button onClick={() => handleSend()} disabled={!input} style={{
                                width: 40, height: 40, borderRadius: "50%",
                                background: input ? "var(--accent)" : "var(--bg-tertiary)",
                                color: input ? "white" : "var(--text-tertiary)",
                                border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: input ? "pointer" : "default"
                            }}>
                                <ShowIcon icon={input ? Sparkles : MessageSquare} size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Helper to avoid conditional hook rules or messy inline conditionals
function ShowIcon({ icon: Icon, size }) { return <Icon size={size} />; }
