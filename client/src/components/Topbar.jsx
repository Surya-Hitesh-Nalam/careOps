import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { Sun, Moon, Bell, Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";

const pageTitles = {
    "/dashboard": "Dashboard",
    "/analytics": "Analytics",
    "/bookings": "Bookings",
    "/calendar": "Calendar",
    "/contacts": "Contacts",
    "/inbox": "Inbox",
    "/services": "Services",
    "/forms": "Forms",
    "/inventory": "Inventory",
    "/automations": "Automations",
    "/staff": "Staff",
    "/activity": "Activity Log",
    "/settings": "Settings",
};

export default function Topbar() {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const location = useLocation();
    const [alerts, setAlerts] = useState([]);
    const [showAlerts, setShowAlerts] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const alertRef = useRef(null);

    const currentPage = pageTitles[location.pathname] || "";

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const { data } = await api.get("/dashboard/stats");
                setAlerts(data.alerts || []);
            } catch { }
        };
        if (user?.workspace) fetchAlerts();
    }, [user, location.pathname]);

    useEffect(() => {
        const handleClick = (e) => {
            if (alertRef.current && !alertRef.current.contains(e.target)) setShowAlerts(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <header style={{
            position: "fixed", top: 0,
            left: "var(--sidebar-width)", right: 0,
            height: "var(--topbar-height)",
            background: "var(--bg-glass)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--border-light)",
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            zIndex: "var(--z-topbar)",
            transition: "left var(--transition-normal)"
        }}>
            {/* Left: Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-tertiary)" }}>CareOps</span>
                {currentPage && (
                    <>
                        <span style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>/</span>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{currentPage}</span>
                    </>
                )}
            </div>

            {/* Right: Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* Search */}
                {searchOpen ? (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                        padding: "6px 12px",
                        animation: "fadeIn 0.2s ease"
                    }}>
                        <Search size={16} color="var(--text-tertiary)" />
                        <input
                            autoFocus
                            placeholder="Quick search..."
                            style={{
                                border: "none", background: "none", outline: "none",
                                color: "var(--text-primary)", fontSize: "0.85rem",
                                width: 180, padding: 0
                            }}
                        />
                        <button onClick={() => setSearchOpen(false)} style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "var(--text-tertiary)", padding: 2
                        }}>
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="btn-icon sm"
                        style={{
                            background: "var(--bg-tertiary)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "var(--radius-sm)",
                            padding: 8, cursor: "pointer",
                            color: "var(--text-secondary)",
                            display: "flex", alignItems: "center"
                        }}
                        title="Search"
                    >
                        <Search size={16} />
                    </button>
                )}

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    style={{
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                        padding: 8, cursor: "pointer",
                        color: "var(--text-secondary)",
                        display: "flex", alignItems: "center",
                        transition: "all var(--transition-fast)"
                    }}
                    title={theme === "light" ? "Dark mode" : "Light mode"}
                >
                    {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                </button>

                {/* Notifications */}
                <div style={{ position: "relative" }} ref={alertRef}>
                    <button
                        onClick={() => setShowAlerts(!showAlerts)}
                        style={{
                            background: "var(--bg-tertiary)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "var(--radius-sm)",
                            padding: 8, cursor: "pointer",
                            color: "var(--text-secondary)",
                            display: "flex", alignItems: "center",
                            transition: "all var(--transition-fast)"
                        }}
                    >
                        <Bell size={16} />
                    </button>
                    {alerts.length > 0 && (
                        <span style={{
                            position: "absolute", top: -4, right: -4,
                            background: "var(--error)", color: "white",
                            borderRadius: "var(--radius-full)",
                            width: 18, height: 18,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.62rem", fontWeight: 700,
                            border: "2px solid var(--bg-secondary)"
                        }}>{alerts.length > 9 ? "9+" : alerts.length}</span>
                    )}

                    {showAlerts && (
                        <div className="dropdown" style={{ width: 320, maxHeight: 380, overflowY: "auto", right: 0 }}>
                            <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: "0.85rem", borderBottom: "1px solid var(--border-light)" }}>
                                Notifications
                            </div>
                            {alerts.length === 0 ? (
                                <div style={{ padding: 20, textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
                                    No new notifications
                                </div>
                            ) : (
                                alerts.map((a, i) => (
                                    <div key={i} className="dropdown-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                                        <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{a.message}</span>
                                        <span style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>{a.category}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* User avatar */}
                {user && (
                    <div className="avatar sm" style={{ marginLeft: 4, cursor: "pointer", fontSize: "0.7rem" }}>
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    header { left: 0 !important; padding-left: 56px !important; }
                }
            `}</style>
        </header>
    );
}
