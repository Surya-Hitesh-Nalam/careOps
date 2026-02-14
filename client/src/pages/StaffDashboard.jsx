import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useBusiness } from "../contexts/BusinessContext";
import api from "../utils/api";
import notify from "../utils/notify";
import { Calendar, Clock, CheckCircle, User, MapPin, FileText, ChevronRight, Loader, Star } from "lucide-react";

export default function StaffDashboard() {
    const { user } = useAuth();
    const { label, meta } = useBusiness();
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({ today: 0, completed: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyData();
    }, []);

    const fetchMyData = async () => {
        try {
            const { data } = await api.get("/bookings/mine");
            setBookings(data.bookings);

            // Calculate stats dynamically
            const today = new Date().toISOString().split('T')[0];
            const todayCount = data.bookings.filter(b => b.date.startsWith(today)).length;
            const completedCount = data.bookings.filter(b => b.status === 'completed').length; // Logic might need adjustment based on data range

            setStats({ today: todayCount, completed: completedCount });
        } catch (error) {
            console.error("Dashboard fetch error:", error);
            notify.error("Failed to load dashboard data. Please try refreshing.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: "center" }}><Loader className="animate-spin" /></div>;

    const renderIndustryWidget = () => {
        switch (meta.id) {
            case "clinical":
                return (
                    <div className="card glass-panel" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <FileText className="text-accent" size={18} /> Recent Lab Results
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {["John Doe - Blood Panel", "Jane Smith - MRI Report", "Mike Ross - Dental X-Ray"].map((item, i) => (
                                <div key={i} style={{ padding: "10px 14px", background: "var(--bg-tertiary)", borderRadius: 8, fontSize: "0.9rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span>{item}</span>
                                    <span style={{ fontSize: "0.75rem", padding: "2px 6px", borderRadius: 4, background: "var(--success-light)", color: "var(--success)" }}>Ready</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "auto":
                return (
                    <div className="card glass-panel" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <MapPin className="text-accent" size={18} /> Active Bays
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {[{ bay: 1, status: "Occupied", job: "Oil Change" }, { bay: 2, status: "Empty", job: "-" }, { bay: 3, status: "Occupied", job: "Brake Pad" }, { bay: 4, status: "Maintenance", job: "-" }].map((bay, i) => (
                                <div key={i} style={{ padding: 12, background: bay.status === "Occupied" ? "var(--accent-light)" : "var(--bg-tertiary)", borderRadius: 8, textAlign: "center" }}>
                                    <div style={{ fontWeight: 700 }}>Bay {bay.bay}</div>
                                    <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>{bay.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="card glass-panel" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <Star className="text-accent" size={18} /> My Performance
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 6 }}>
                                    <span>Customer Satisfaction</span>
                                    <span style={{ fontWeight: 700 }}>4.9/5</span>
                                </div>
                                <div style={{ height: 6, background: "var(--bg-tertiary)", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: "98%", height: "100%", background: "var(--success)" }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 6 }}>
                                    <span>Revenue Goal</span>
                                    <span style={{ fontWeight: 700 }}>85%</span>
                                </div>
                                <div style={{ height: 6, background: "var(--bg-tertiary)", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: "85%", height: "100%", background: "var(--accent)" }} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 8 }}>Good morning, {user.name}</h1>
                <p style={{ color: "var(--text-secondary)" }}>You have {stats.today} {label.customer.toLowerCase()}s scheduled today.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 40 }}>
                {/* Stats Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div className="card glass-panel" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ padding: 12, borderRadius: 12, background: "var(--accent-light)", color: "var(--accent)" }}><Calendar size={24} /></div>
                        <div>
                            <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{stats.today}</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>Appointments Today</div>
                        </div>
                    </div>
                    <div className="card glass-panel" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ padding: 12, borderRadius: 12, background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}><CheckCircle size={24} /></div>
                        <div>
                            <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{stats.completed}</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>Completed this week</div>
                        </div>
                    </div>
                </div>

                {/* Industry Specific Widget */}
                {renderIndustryWidget()}
            </div>

            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16 }}>My Schedule</h2>
            <div className="card glass-panel" style={{ overflow: "hidden" }}>
                {bookings.map((b, i) => (
                    <div key={b.id} style={{
                        padding: "20px 24px",
                        borderBottom: i < bookings.length - 1 ? "1px solid var(--border-light)" : "none",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        transition: "background 0.2s"
                    }} className="hover-bg">
                        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                            <div style={{
                                padding: "8px 12px", borderRadius: 8, background: "var(--bg-tertiary)",
                                fontWeight: 700, fontSize: "1.1rem", border: "1px solid var(--border-color)",
                                minWidth: 80, textAlign: "center"
                            }}>
                                {b.time}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: 4 }}>{b.customer}</div>
                                <div style={{ display: "flex", gap: 12, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FileText size={14} /> {b.service}</span>
                                    {meta.id === "clinical" && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={14} /> Patient ID: #{1000 + b.id}</span>}
                                    {meta.id === "auto" && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={14} /> Bay {b.id}</span>}
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-secondary glass-button">
                            View Details <ChevronRight size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
