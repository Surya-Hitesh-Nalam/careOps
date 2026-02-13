import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { MessageSquare, Send, Search, User, Clock, Sparkles, Loader } from "lucide-react";

export default function InboxPage() {
    const [convos, setConvos] = useState([]);
    const [active, setActive] = useState(null);
    const [reply, setReply] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const chatEnd = useRef(null);

    useEffect(() => { fetchConvos(); }, []);
    useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [active]);

    const fetchConvos = async () => {
        try { const { data } = await api.get("/conversations"); setConvos(data.conversations); } catch { }
        setLoading(false);
    };

    const selectConvo = async (c) => {
        try {
            const { data } = await api.get(`/conversations/${c.id}`);
            setActive(data.conversation);
            setAiSuggestions([]);
        } catch { }
    };

    const sendReply = async () => {
        if (!reply.trim() || !active) return;
        try {
            const { data } = await api.post(`/conversations/${active.id}/reply`, { body: reply });
            setActive(data.conversation);
            setReply("");
            setAiSuggestions([]);
            fetchConvos();
        } catch { }
    };

    const fetchSmartReplies = async () => {
        if (!active) return;
        setAiLoading(true);
        try {
            const { data } = await api.post("/ai/smart-reply", { conversationId: active.id });
            setAiSuggestions(data.suggestions || []);
        } catch { setAiSuggestions([]); }
        setAiLoading(false);
    };

    const filtered = convos.filter(c => c.contact?.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="page-container" style={{ padding: 0, height: "calc(100vh - var(--topbar-height))" }}>
            <div style={{ display: "flex", height: "100%" }}>
                {/* Conversation list */}
                <div style={{
                    width: 340, borderRight: "1px solid var(--border-color)",
                    display: "flex", flexDirection: "column", background: "var(--bg-secondary)"
                }}>
                    <div style={{ padding: "18px 16px 12px" }}>
                        <h2 style={{
                            fontSize: "1.15rem", fontWeight: 800, marginBottom: 12,
                            background: "var(--accent-gradient)", WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent", backgroundClip: "text"
                        }}>Inbox</h2>
                        <div className="search-input">
                            <Search size={15} />
                            <input placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: "0.83rem" }} />
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        {loading ? <div className="loading-spinner" style={{ marginTop: 40 }} /> :
                            filtered.length === 0 ? (
                                <div className="empty-state" style={{ padding: 32 }}>
                                    <MessageSquare size={32} /><p>No conversations</p>
                                </div>
                            ) : filtered.map(c => (
                                <div key={c.id} onClick={() => selectConvo(c)} style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: "12px 16px", cursor: "pointer",
                                    background: active?.id === c.id ? "var(--accent-light)" : "transparent",
                                    borderBottom: "1px solid var(--border-light)",
                                    transition: "background var(--transition-fast)"
                                }}>
                                    <div className="avatar sm">{c.contact?.name?.charAt(0) || "?"}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontWeight: 600, fontSize: "0.88rem" }} className="truncate">{c.contact?.name || "Unknown"}</span>
                                            <span style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", flexShrink: 0 }}>
                                                {new Date(c.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }} className="truncate">
                                            {c.messages?.[0]?.body || c.lastMessage || "No messages"}
                                        </div>
                                    </div>
                                    {c.unreadCount > 0 && <span className="badge badge-error" style={{ flexShrink: 0, minWidth: 20, textAlign: "center" }}>{c.unreadCount}</span>}
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* Chat area */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
                    {!active ? (
                        <div className="flex-center" style={{ flex: 1, flexDirection: "column", gap: 8 }}>
                            <MessageSquare size={48} color="var(--text-tertiary)" />
                            <h3 style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Select a conversation</h3>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            <div style={{
                                padding: "14px 20px", borderBottom: "1px solid var(--border-light)",
                                display: "flex", alignItems: "center", gap: 12,
                                background: "var(--bg-secondary)"
                            }}>
                                <div className="avatar sm">{active.contact?.name?.charAt(0) || "?"}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{active.contact?.name}</div>
                                    <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>{active.contact?.email}</div>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={fetchSmartReplies} disabled={aiLoading} style={{
                                    background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))",
                                    border: "1px solid rgba(99,102,241,0.2)", gap: 4
                                }}>
                                    {aiLoading ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                    AI Suggest
                                </button>
                            </div>

                            {/* Messages */}
                            <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                                {active.messages?.map((m, i) => {
                                    const isStaff = m.sender === "staff";
                                    const isSystem = m.sender === "system";
                                    return (
                                        <div key={i} style={{
                                            display: "flex",
                                            justifyContent: isSystem ? "center" : isStaff ? "flex-end" : "flex-start",
                                            animation: "fadeInUp 0.2s ease"
                                        }}>
                                            <div style={{
                                                maxWidth: isSystem ? "80%" : "65%", padding: isSystem ? "6px 14px" : "10px 16px",
                                                borderRadius: isSystem ? "12px" : isStaff ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                                background: isSystem ? "var(--bg-tertiary)" : isStaff ? "var(--accent)" : "var(--bg-secondary)",
                                                color: isSystem ? "var(--text-secondary)" : isStaff ? "white" : "var(--text-primary)",
                                                border: isStaff ? "none" : "1px solid var(--border-color)",
                                                fontSize: isSystem ? "0.78rem" : "0.88rem", lineHeight: 1.5,
                                                fontStyle: isSystem ? "italic" : "normal",
                                                boxShadow: "var(--shadow-xs)"
                                            }}>
                                                {m.body}
                                                <div style={{
                                                    fontSize: "0.68rem", marginTop: 4,
                                                    opacity: 0.7, textAlign: "right"
                                                }}>
                                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEnd} />
                            </div>

                            {/* AI Suggestions */}
                            {aiSuggestions.length > 0 && (
                                <div style={{
                                    padding: "10px 20px", borderTop: "1px solid var(--border-light)",
                                    background: "linear-gradient(135deg, rgba(99,102,241,0.03), rgba(168,85,247,0.03))",
                                    display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center"
                                }}>
                                    <Sparkles size={13} color="var(--accent)" style={{ flexShrink: 0 }} />
                                    {aiSuggestions.map((s, i) => (
                                        <button key={i} onClick={() => { setReply(s); setAiSuggestions([]); }} style={{
                                            padding: "5px 12px", borderRadius: 20,
                                            background: "var(--bg-secondary)", border: "1px solid var(--border-color)",
                                            fontSize: "0.78rem", cursor: "pointer", color: "var(--text-primary)",
                                            transition: "all var(--transition-fast)", maxWidth: "40%",
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                        }}
                                            onMouseEnter={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.background = "var(--accent-light)"; }}
                                            onMouseLeave={e => { e.target.style.borderColor = "var(--border-color)"; e.target.style.background = "var(--bg-secondary)"; }}
                                        >{s}</button>
                                    ))}
                                </div>
                            )}

                            {/* Reply */}
                            <div style={{
                                padding: "14px 20px", borderTop: "1px solid var(--border-light)",
                                display: "flex", gap: 10, background: "var(--bg-secondary)"
                            }}>
                                <input
                                    placeholder="Type a reply..."
                                    value={reply} onChange={e => setReply(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && sendReply()}
                                    style={{ flex: 1 }}
                                />
                                <button className="btn btn-primary" onClick={sendReply}>
                                    <Send size={16} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
