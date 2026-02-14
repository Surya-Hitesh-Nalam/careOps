import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useBusiness } from "../contexts/BusinessContext";
import {
    LayoutDashboard, Inbox, Users, Calendar, FileText,
    Package, UserCog, Settings, LogOut, ChevronLeft, Menu, Zap,
    BarChart3, Clock, Bot, Activity, Briefcase, Layout
} from "lucide-react";
import { useState } from "react";

const mainLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

// Links moved inside component to access context

export default function Sidebar() {
    const { user, logout } = useAuth();
    const { label } = useBusiness();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const isOwner = user?.role === "owner";

    const operationsLinks = [
        { to: "/bookings", icon: Calendar, label: "Bookings" },
        { to: "/calendar", icon: Clock, label: "Calendar" },
        { to: "/contacts", icon: Users, label: `${label.customer}s` },
        { to: "/inbox", icon: Inbox, label: "Inbox" },
    ];

    const managementLinks = [
        { to: "/services", icon: Briefcase, label: `${label.service}s` },
        { to: "/resources", icon: Layout, label: "Resources" },
        { to: "/forms", icon: FileText, label: "Forms" },
        { to: "/inventory", icon: Package, label: "Inventory" },
        { to: "/automations", icon: Bot, label: "Automations" },
    ];

    const systemLinks = [
        { to: "/staff", icon: UserCog, label: "Staff" },
        { to: "/activity", icon: Activity, label: "Activity Log" },
        { to: "/settings", icon: Settings, label: "Settings" },
    ];

    const staffMainLinks = [
        { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/bookings", icon: Calendar, label: "Bookings" },
        { to: "/calendar", icon: Clock, label: "Calendar" },
        { to: "/contacts", icon: Users, label: `${label.customer}s` },
        { to: "/inbox", icon: Inbox, label: "Inbox" },
        { to: "/forms", icon: FileText, label: "Forms" },
    ];

    const renderSection = (label, links) => (
        <div style={{ marginBottom: 4 }}>
            {!collapsed && label && (
                <div className="sidebar-section-label">{label}</div>
            )}
            {links.map(link => {
                const Icon = link.icon;
                const active = location.pathname === link.to;
                return (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: collapsed ? "10px 0" : "9px 14px",
                            justifyContent: collapsed ? "center" : "flex-start",
                            borderRadius: "var(--radius-sm)",
                            color: active ? "var(--text-primary)" : "var(--text-secondary)",
                            background: active ? "linear-gradient(90deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.05))" : "transparent",
                            border: active ? "1px solid rgba(99, 102, 241, 0.1)" : "1px solid transparent",
                            marginBottom: 1,
                            marginLeft: collapsed ? 0 : 8,
                            marginRight: collapsed ? 0 : 8,
                            fontSize: "0.86rem",
                            fontWeight: active ? 600 : 400,
                            textDecoration: "none",
                            transition: "all var(--transition-fast)",
                            position: "relative",
                            boxShadow: active ? "var(--shadow-xs)" : "none"
                        }}
                    >
                        {active && (
                            <div style={{
                                position: "absolute",
                                left: collapsed ? "50%" : 0,
                                top: collapsed ? "auto" : "50%",
                                bottom: collapsed ? 0 : "auto",
                                transform: collapsed ? "translateX(-50%)" : "translateY(-50%)",
                                width: collapsed ? 24 : 3,
                                height: collapsed ? 3 : 24,
                                borderRadius: "0 2px 2px 0",
                                background: "var(--accent)"
                            }} />
                        )}
                        <Icon size={19} />
                        {!collapsed && <span>{link.label}</span>}
                    </NavLink>
                );
            })}
        </div>
    );

    return (
        <>
            <button
                className="sidebar-mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                    display: "none",
                    position: "fixed",
                    top: 16, left: 16, zIndex: 1100,
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                    padding: 8, cursor: "pointer",
                    color: "var(--text-primary)"
                }}
            >
                <Menu size={20} />
            </button>

            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
                        zIndex: 999, display: "none"
                    }}
                    className="sidebar-backdrop"
                />
            )}

            <aside
                className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
                style={{
                    width: collapsed ? 72 : "var(--sidebar-width)",
                    position: "fixed", top: 0, left: 0, bottom: 0,
                    background: "var(--bg-secondary)",
                    borderRight: "1px solid var(--border-color)",
                    display: "flex", flexDirection: "column",
                    zIndex: "var(--z-sidebar)",
                    transition: "width var(--transition-normal), transform var(--transition-normal)",
                    overflow: "hidden"
                }}
            >
                {/* Logo */}
                <div style={{
                    padding: collapsed ? "18px 12px" : "18px 20px",
                    display: "flex", alignItems: "center",
                    justifyContent: collapsed ? "center" : "space-between",
                    borderBottom: "1px solid var(--border-light)",
                    minHeight: 64
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 34, height: 34,
                            background: "linear-gradient(135deg, #6366f1, #a855f7)",
                            borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", flexShrink: 0
                        }}>
                            <Zap size={17} />
                        </div>
                        {!collapsed && (
                            <span style={{ fontWeight: 800, fontSize: "1.08rem", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                                CareOps
                            </span>
                        )}
                    </div>
                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: "var(--text-tertiary)", padding: 4,
                                borderRadius: "var(--radius-xs)",
                                transition: "all var(--transition-fast)"
                            }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                    )}
                    {collapsed && (
                        <button
                            onClick={() => setCollapsed(false)}
                            style={{
                                position: "absolute", right: -12, top: 22,
                                width: 24, height: 24, borderRadius: "50%",
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-color)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: "var(--text-tertiary)",
                                boxShadow: "var(--shadow-sm)"
                            }}
                        >
                            <ChevronLeft size={12} style={{ transform: "rotate(180deg)" }} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
                    {isOwner ? (
                        <>
                            {renderSection(null, mainLinks)}
                            {renderSection("Operations", operationsLinks)}
                            {renderSection("Management", managementLinks)}
                            {renderSection("System", systemLinks)}
                        </>
                    ) : (
                        renderSection(null, staffMainLinks)
                    )}
                </nav>

                {/* User section */}
                <div style={{
                    padding: collapsed ? "14px 8px" : "14px 16px",
                    borderTop: "1px solid var(--border-light)"
                }}>
                    {!collapsed && user && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div className="avatar sm">{user.name?.charAt(0).toUpperCase()}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "0.83rem", fontWeight: 600, color: "var(--text-primary)" }} className="truncate">{user.name}</div>
                                <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", textTransform: "capitalize" }}>{user.role}</div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            width: "100%", padding: "8px 14px",
                            justifyContent: collapsed ? "center" : "flex-start",
                            background: "none", border: "none",
                            color: "var(--text-tertiary)", cursor: "pointer",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.83rem", transition: "all var(--transition-fast)",
                            fontFamily: "inherit"
                        }}
                    >
                        <LogOut size={18} />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            <style>{`
                @media (max-width: 1024px) {
                    .sidebar-mobile-toggle { display: block !important; }
                    .sidebar-backdrop { display: block !important; }
                    .sidebar { transform: translateX(-100%); box-shadow: var(--shadow-xl); }
                    .sidebar.mobile-open { transform: translateX(0); }
                }
            `}</style>
        </>
    );
}
