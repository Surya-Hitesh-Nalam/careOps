import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { Search, Send, User, MessageSquare } from "lucide-react";

export default function InboxPage() {
    const [conversations, setConversations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);
    const [reply, setReply] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEnd = useRef(null);

    useEffect(() => { fetchConversations(); }, []);
    useEffect(() => { if (selected) fetchDetail(selected); }, [selected]);
    useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [detail]);

    const fetchConversations = async () => {
        try {
            const { data } = await api.get(`/conversations?search=${search}`);
            setConversations(data.conversations);
        } catch { }
        setLoading(false);
    };

    const fetchDetail = async (id) => {
        try {
            const { data } = await api.get(`/conversations/${id}`);
            setDetail(data.conversation);
        } catch { }
    };

    const sendReply = async () => {
        if (!reply.trim() || !selected) return;
        setSending(true);
        try {
            const { data } = await api.post(`/conversations/${selected}/reply`, { body: reply, channel: "email" });
            setDetail(data.conversation);
            setReply("");
            fetchConversations();
        } catch { }
        setSending(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
    };

    return (
        <div className="page-container" style={{ padding: 0, height: "calc(100vh - var(--topbar-height))" }}>
            <div style={{ display: "flex", height: "100%", borderTop: "1px solid var(--border-color)" }}>
                <div style={{
                    width: 340, borderRight: "1px solid var(--border-color)",
                    display: "flex", flexDirection: "column", background: "var(--bg-secondary)",
                    flexShrink: 0
                }}>
                    <div style={{ padding: "16px", borderBottom: "1px solid var(--border-color)" }}>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 10 }}>Inbox</h2>
                        <div className="search-bar" style={{ marginBottom: 0 }}>
                            <Search />
                            <input
                                value={search}
                                onChange={e => { setSearch(e.target.value); }}
                                onKeyDown={e => e.key === "Enter" && fetchConversations()}
                                placeholder="Search conversations..."
                            />
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        {loading ? <div className="loading-spinner" /> : conversations.length === 0 ? (
                            <div className="empty-state"><MessageSquare size={40} /><h3>No conversations</h3><p>Conversations appear when contacts reach out</p></div>
                        ) : conversations.map(c => (
                            <div
                                key={c.id}
                                onClick={() => setSelected(c.id)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: "14px 16px", cursor: "pointer",
                                    background: selected === c.id ? "var(--accent-light)" : "transparent",
                                    borderBottom: "1px solid var(--border-light)",
                                    transition: "background var(--transition-fast)"
                                }}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: "var(--radius-full)",
                                    background: "linear-gradient(135deg, var(--accent), #a855f7)",
                                    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 600, fontSize: "0.85rem", flexShrink: 0
                                }}>
                                    {c.contact?.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{c.contact?.name}</span>
                                        {c.unreadCount > 0 && <span className="badge badge-error" style={{ fontSize: "0.65rem" }}>{c.unreadCount}</span>}
                                    </div>
                                    <div style={{
                                        fontSize: "0.8rem", color: "var(--text-tertiary)",
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                    }}>
                                        {c.lastMessage || "No messages yet"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
                    {!detail ? (
                        <div className="empty-state" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <MessageSquare size={48} />
                            <h3>Select a conversation</h3>
                            <p>Choose a conversation from the list to view messages</p>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                padding: "14px 20px", borderBottom: "1px solid var(--border-color)",
                                background: "var(--bg-secondary)",
                                display: "flex", alignItems: "center", gap: 12
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: "var(--radius-full)",
                                    background: "linear-gradient(135deg, var(--accent), #a855f7)",
                                    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 600, fontSize: "0.8rem"
                                }}>
                                    {detail.contact?.name?.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{detail.contact?.name}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                                        {detail.contact?.email} {detail.contact?.phone ? `/ ${detail.contact.phone}` : ""}
                                    </div>
                                </div>
                                {detail.automationPaused && <span className="badge badge-warning" style={{ marginLeft: "auto" }}>Automation Paused</span>}
                            </div>

                            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                                {detail.messages?.map((msg, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            justifyContent: msg.sender === "staff" ? "flex-end" : "flex-start",
                                            marginBottom: 12
                                        }}
                                    >
                                        <div style={{
                                            maxWidth: "70%",
                                            padding: "10px 14px",
                                            borderRadius: msg.sender === "staff" ? "var(--radius-md) var(--radius-md) 4px var(--radius-md)" : "var(--radius-md) var(--radius-md) var(--radius-md) 4px",
                                            background: msg.sender === "staff" ? "var(--accent)" : msg.sender === "system" ? "var(--bg-tertiary)" : "var(--bg-secondary)",
                                            color: msg.sender === "staff" ? "white" : "var(--text-primary)",
                                            border: msg.sender !== "staff" ? "1px solid var(--border-color)" : "none",
                                            fontSize: "0.9rem", lineHeight: 1.5
                                        }}>
                                            <div>{msg.body}</div>
                                            <div style={{
                                                fontSize: "0.65rem", marginTop: 4,
                                                opacity: 0.6, textAlign: "right"
                                            }}>
                                                {msg.sender === "system" ? "System" : msg.sender === "staff" ? "You" : "Customer"} · {msg.channel} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEnd} />
                            </div>

                            <div style={{
                                padding: "14px 20px", borderTop: "1px solid var(--border-color)",
                                background: "var(--bg-secondary)",
                                display: "flex", gap: 10
                            }}>
                                <input
                                    value={reply}
                                    onChange={e => setReply(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    style={{
                                        flex: 1, padding: "10px 14px",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: "var(--radius-sm)",
                                        background: "var(--bg-primary)",
                                        color: "var(--text-primary)",
                                        fontSize: "0.9rem", outline: "none"
                                    }}
                                />
                                <button className="btn btn-primary" onClick={sendReply} disabled={sending || !reply.trim()}>
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
