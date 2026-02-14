import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { MessageSquare, Send, Search, User, Clock, Sparkles, Loader, Lock, Tag, MoreVertical } from "lucide-react";

export default function InboxPage() {
    const [convos, setConvos] = useState([]);
    const [active, setActive] = useState(null);
    const [reply, setReply] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [isInternalMode, setIsInternalMode] = useState(false);
    const [tags, setTags] = useState([]);
    const [priority, setPriority] = useState("normal");
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
            setTags(data.conversation.tags || []);
            setPriority(data.conversation.priority || "normal");
            setAiSuggestions([]);
        } catch { }
    };

    const sendReply = async () => {
        if (!reply.trim() || !active) return;
        try {
            const { data } = await api.post(`/conversations/${active.id}/reply`, {
                body: reply,
                isInternal: isInternalMode
            });
            setActive(data.conversation);
            setReply("");
            if (!isInternalMode) setAiSuggestions([]);
            setIsInternalMode(false);
            fetchConvos();
        } catch { }
    };

    const updateMeta = async (newTags, newPriority) => {
        try {
            await api.put(`/conversations/${active.id}`, { tags: newTags, priority: newPriority });
            setTags(newTags);
            setPriority(newPriority);
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
        <div className="page-container" style={{ padding: 0, height: "calc(100vh - var(--topbar-height))", overflow: "hidden" }}>
            <div style={{ display: "flex", height: "100%" }}>
                {/* ─── Sidebar: Conversation List ─── */}
                <div style={{
                    width: 360,
                    borderRight: "1px solid var(--border-color)",
                    display: "flex", flexDirection: "column",
                    background: "var(--bg-secondary)",
                    zIndex: 2
                }}>
                    <div style={{ padding: "24px 20px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <h2 style={{
                                fontSize: "1.25rem", fontWeight: 800,
                                background: "var(--accent-gradient)", WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent", backgroundClip: "text",
                                letterSpacing: "-0.02em"
                            }}>Inbox</h2>
                            <div className="badge badge-accent">{filtered.length}</div>
                        </div>

                        <div className="search-input" style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, boxShadow: "var(--shadow-xs)" }}>
                            <Search size={16} color="var(--text-tertiary)" />
                            <input
                                placeholder="Search messages..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ border: "none", padding: 0, background: "transparent", fontSize: "0.9rem", width: "100%" }}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
                        {loading ? (
                            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                                <Loader className="animate-spin" color="var(--accent)" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="empty-state" style={{ padding: 40 }}>
                                <MessageSquare size={40} color="var(--text-tertiary)" style={{ opacity: 0.5 }} />
                                <p>No conversations found</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {filtered.map(c => (
                                    <div key={c.id} onClick={() => selectConvo(c)} style={{
                                        display: "flex", alignItems: "start", gap: 14,
                                        padding: "16px", cursor: "pointer",
                                        background: active?.id === c.id ? "var(--bg-primary)" : "transparent",
                                        borderRadius: "var(--radius-md)",
                                        border: active?.id === c.id ? "1px solid var(--border-focus)" : "1px solid transparent",
                                        transition: "all 0.2s ease",
                                        position: "relative"
                                    }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <div className="avatar" style={{
                                            width: 40, height: 40, borderRadius: "50%",
                                            background: active?.id === c.id ? "var(--accent-gradient)" : "var(--bg-tertiary)",
                                            color: active?.id === c.id ? "white" : "var(--text-secondary)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontWeight: 700, fontSize: "0.9rem", flexShrink: 0
                                        }}>
                                            {c.contact?.name?.charAt(0) || "?"}
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-primary)" }} className="truncate">
                                                    {c.contact?.name || "Unknown"}
                                                </span>
                                                <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 500 }}>
                                                    {new Date(c.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <div style={{
                                                fontSize: "0.85rem", color: active?.id === c.id ? "var(--text-secondary)" : "var(--text-tertiary)",
                                                lineHeight: 1.4
                                            }} className="truncate">
                                                {c.messages?.[0]?.body || c.lastMessage || "No messages yet"}
                                            </div>
                                        </div>
                                        {c.unreadCount > 0 && (
                                            <div style={{
                                                position: "absolute", right: 16, bottom: 16,
                                                background: "var(--accent)", color: "white",
                                                fontSize: "0.65rem", fontWeight: 700,
                                                padding: "2px 6px", borderRadius: "10px",
                                                boxShadow: "0 2px 4px rgba(99, 102, 241, 0.4)"
                                            }}>
                                                {c.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Main Chat Area ─── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-primary)", position: "relative" }}>
                    {!active ? (
                        <div className="flex-center" style={{ flex: 1, flexDirection: "column", gap: 16, opacity: 0.6 }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: "50%",
                                background: "var(--bg-tertiary)", display: "flex",
                                alignItems: "center", justifyContent: "center"
                            }}>
                                <MessageSquare size={40} color="var(--text-tertiary)" />
                            </div>
                            <h3 style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Select a conversation to start chatting</h3>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div style={{
                                padding: "16px 24px",
                                borderBottom: "1px solid var(--border-light)",
                                display: "flex", alignItems: "center", gap: 16,
                                background: "rgba(255, 255, 255, 0.8)",
                                backdropFilter: "blur(12px)",
                                zIndex: 10
                            }}>
                                <div className="avatar" style={{
                                    width: 44, height: 44, borderRadius: "50%",
                                    background: "var(--accent-gradient)", color: "white",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 700, fontSize: "1rem", boxShadow: "var(--shadow-md)"
                                }}>
                                    {active.contact?.name?.charAt(0) || "?"}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 2 }}>{active.contact?.name}</h3>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{active.contact?.email}</span>
                                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--text-tertiary)", opacity: 0.4 }} />
                                        <span className={`badge ${priority === 'urgent' ? 'badge-error' : priority === 'high' ? 'badge-warning' : 'badge-default'}`} style={{ fontSize: "0.65rem", padding: "2px 8px" }}>
                                            {priority.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <button className="glass-button" onClick={fetchSmartReplies} disabled={aiLoading} style={{
                                        display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                                        borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600,
                                        color: aiLoading ? "var(--text-tertiary)" : "var(--accent)"
                                    }}>
                                        {aiLoading ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                        Smart Reply
                                    </button>

                                    <div style={{ width: 1, height: 24, background: "var(--border-color)" }} />

                                    <select
                                        value={priority}
                                        onChange={(e) => updateMeta(tags, e.target.value)}
                                        style={{
                                            padding: "8px 12px", borderRadius: "var(--radius-sm)",
                                            border: "1px solid var(--border-color)", fontSize: "0.85rem",
                                            background: "var(--bg-secondary)", cursor: "pointer", width: "auto"
                                        }}
                                    >
                                        <option value="normal">Active</option>
                                        <option value="high">High Priority</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
                                {active.messages?.map((m, i) => {
                                    const isStaff = m.sender === "staff";
                                    const isSystem = m.sender === "system";
                                    const isInternal = m.isInternal;

                                    return (
                                        <div key={i} style={{
                                            display: "flex",
                                            justifyContent: isSystem ? "center" : (isStaff || isInternal) ? "flex-end" : "flex-start",
                                            animation: `fadeInUp 0.3s ease forwards`,
                                            animationDelay: `${i * 0.05}s`,
                                            opacity: 0
                                        }}>
                                            {/* Avatar for customer */}
                                            {!isSystem && !isStaff && !isInternal && (
                                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10, alignSelf: "flex-end", fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                                                    {active.contact?.name?.charAt(0)}
                                                </div>
                                            )}

                                            <div style={{
                                                maxWidth: isSystem ? "80%" : "60%",
                                                padding: isSystem ? "8px 16px" : "14px 18px",
                                                borderRadius: isSystem ? "20px" : (isStaff || isInternal) ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                                                background: isInternal ? "#fffbeb" : isSystem ? "var(--bg-tertiary)" : isStaff ? "var(--accent-gradient)" : "white",
                                                color: isInternal ? "#b45309" : isSystem ? "var(--text-secondary)" : isStaff ? "white" : "var(--text-primary)",
                                                border: isInternal ? "1px solid #fcd34d" : isSystem ? "none" : isStaff ? "none" : "1px solid var(--border-light)",
                                                boxShadow: isSystem ? "none" : isStaff ? "0 4px 12px rgba(99, 102, 241, 0.25)" : "var(--shadow-sm)",
                                                fontSize: isSystem ? "0.8rem" : "0.92rem",
                                                lineHeight: 1.5,
                                                fontStyle: isSystem ? "italic" : "normal",
                                                whiteSpace: "pre-wrap"
                                            }}>
                                                {isInternal && (
                                                    <div style={{
                                                        fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                                                        marginBottom: 6, display: "flex", gap: 6, alignItems: "center",
                                                        paddingBottom: 6, borderBottom: "1px solid rgba(0,0,0,0.05)"
                                                    }}>
                                                        <Lock size={12} /> Internal Note
                                                    </div>
                                                )}
                                                {m.body}
                                                <div style={{
                                                    fontSize: "0.7rem", marginTop: 6,
                                                    opacity: 0.7, textAlign: "right",
                                                    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4
                                                }}>
                                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    {(isStaff || isInternal) && <span style={{ fontSize: "0.9rem" }}>✓✓</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEnd} />
                            </div>

                            {/* Smart Replies Overlay */}
                            {aiSuggestions.length > 0 && (
                                <div style={{
                                    padding: "16px 24px",
                                    background: "rgba(255,255,255,0.9)",
                                    backdropFilter: "blur(8px)",
                                    borderTop: "1px solid var(--border-light)",
                                    animation: "slideUp 0.3s ease"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                        <Sparkles size={16} className="text-purple-500" />
                                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Suggestions</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                                        {aiSuggestions.map((s, i) => (
                                            <button key={i} onClick={() => { setReply(s); setAiSuggestions([]); }} style={{
                                                padding: "10px 16px", borderRadius: "16px",
                                                border: "1px solid var(--border-color)",
                                                background: "white",
                                                fontSize: "0.85rem", cursor: "pointer", color: "var(--text-primary)",
                                                transition: "all 0.2s ease",
                                                minWidth: "200px", maxWidth: "300px",
                                                textAlign: "left", lineHeight: 1.4,
                                                boxShadow: "var(--shadow-sm)",
                                                flexShrink: 0
                                            }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.borderColor = "var(--accent)";
                                                    e.currentTarget.style.transform = "translateY(-2px)";
                                                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.borderColor = "var(--border-color)";
                                                    e.currentTarget.style.transform = "none";
                                                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                                                }}
                                            >
                                                {s.length > 60 ? s.substring(0, 60) + "..." : s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Input Area */}
                            <div style={{
                                padding: "20px 24px",
                                background: isInternalMode ? "#fffbeb" : "white",
                                borderTop: "1px solid var(--border-light)",
                                transition: "background 0.3s ease"
                            }}>
                                <div style={{
                                    display: "flex", gap: 12,
                                    background: isInternalMode ? "white" : "var(--bg-tertiary)",
                                    padding: "8px", borderRadius: "var(--radius-lg)",
                                    border: isInternalMode ? "1px solid #fcd34d" : "1px solid transparent",
                                    boxShadow: isInternalMode ? "0 0 0 4px #fef3c7" : "none",
                                    transition: "all 0.3s ease"
                                }}>
                                    <button
                                        onClick={() => setIsInternalMode(!isInternalMode)}
                                        title={isInternalMode ? "Switch to Public Reply" : "Switch to Internal Note"}
                                        style={{
                                            width: 44, height: 44, borderRadius: "var(--radius-md)", border: "none",
                                            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                                            background: isInternalMode ? "#f59e0b" : "transparent",
                                            color: isInternalMode ? "white" : "var(--text-tertiary)",
                                            transition: "all 0.2s ease"
                                        }}
                                        className="hover:bg-gray-200"
                                    >
                                        <Lock size={20} />
                                    </button>

                                    <textarea
                                        placeholder={isInternalMode ? "Add a private note for your team (customer won't see this)..." : "Type your message..."}
                                        value={reply}
                                        onChange={e => setReply(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                sendReply();
                                            }
                                        }}
                                        style={{
                                            flex: 1, border: "none", background: "transparent",
                                            fontSize: "0.95rem", resize: "none", padding: "10px 4px",
                                            minHeight: 44, maxHeight: 120, outline: "none"
                                        }}
                                    />

                                    <button
                                        onClick={sendReply}
                                        disabled={!reply.trim()}
                                        style={{
                                            width: 44, height: 44, borderRadius: "var(--radius-md)", border: "none",
                                            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                                            background: !reply.trim() ? "var(--bg-hover)" : isInternalMode ? "#f59e0b" : "var(--accent-gradient)",
                                            color: !reply.trim() ? "var(--text-tertiary)" : "white",
                                            transition: "all 0.2s ease",
                                            boxShadow: !reply.trim() ? "none" : "0 4px 12px rgba(99, 102, 241, 0.3)"
                                        }}
                                    >
                                        {isInternalMode ? <Tag size={20} /> : <Send size={20} />}
                                    </button>
                                </div>

                                {isInternalMode && (
                                    <div style={{ fontSize: "0.75rem", color: "#b45309", marginTop: 8, marginLeft: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                                        <Lock size={12} /> Internal Note Mode Active
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
