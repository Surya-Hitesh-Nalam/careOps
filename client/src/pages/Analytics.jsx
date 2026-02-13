import { useState, useEffect } from "react";
import api from "../utils/api";
import {
    BarChart3, TrendingUp, TrendingDown, Calendar, Users, DollarSign,
    Clock, FileText, Package, ArrowUpRight, ArrowDownRight
} from "lucide-react";

const MiniBar = ({ data, color = "var(--accent)" }) => {
    const max = Math.max(...data, 1);
    return (
        <div style={{ display: "flex", alignItems: "end", gap: 2, height: 40 }}>
            {data.map((v, i) => (
                <div key={i} style={{
                    flex: 1, minWidth: 4, maxWidth: 12,
                    height: `${(v / max) * 100}%`,
                    background: color, opacity: 0.3 + (i / data.length) * 0.7,
                    borderRadius: 2, transition: "height 0.3s ease"
                }} />
            ))}
        </div>
    );
};

const MiniLine = ({ data, color = "var(--accent)" }) => {
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 200, h = 50;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
    return (
        <svg width={w} height={h} style={{ overflow: "visible" }}>
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default function Analytics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("7d");

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get("/dashboard/stats");
                setStats(data);
            } catch { }
            setLoading(false);
        };
        fetch();
    }, []);

    if (loading) return <div className="page-container"><div className="loading-spinner" /></div>;

    const bookingData = [12, 19, 15, 22, 18, 25, 30];
    const revenueData = [4200, 3800, 5100, 4700, 5300, 6200, 5800];
    const contactData = [5, 8, 3, 12, 7, 9, 14];
    const formData = [8, 6, 10, 4, 12, 9, 7];

    const kpis = [
        { label: "Total Bookings", value: stats?.bookings?.today + stats?.bookings?.upcoming + stats?.bookings?.completed || 0, change: "+12%", up: true, icon: Calendar, color: "var(--accent)", data: bookingData },
        { label: "Revenue (Est.)", value: "$12,480", change: "+8.3%", up: true, icon: DollarSign, color: "var(--success)", data: revenueData },
        { label: "New Contacts", value: stats?.leads?.new || 0, change: "+24%", up: true, icon: Users, color: "var(--info)", data: contactData },
        { label: "Forms Completed", value: stats?.forms?.completed || 0, change: "-5%", up: false, icon: FileText, color: "var(--warning)", data: formData },
    ];

    const sources = [
        { name: "Website Booking", value: 42, pct: 42 },
        { name: "Walk-in", value: 28, pct: 28 },
        { name: "Phone", value: 18, pct: 18 },
        { name: "Referral", value: 12, pct: 12 },
    ];

    const topServices = [
        { name: "Consultation", bookings: 48, revenue: "$3,840" },
        { name: "Follow-up", bookings: 35, revenue: "$2,100" },
        { name: "Assessment", bookings: 28, revenue: "$3,360" },
        { name: "Therapy Session", bookings: 22, revenue: "$2,640" },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Analytics</h1>
                    <p>Track performance and business insights</p>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                    {["7d", "30d", "90d", "12m"].map(p => (
                        <button key={p} className={`chip ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)}>{p}</button>
                    ))}
                </div>
            </div>

            {/* KPIs */}
            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                {kpis.map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={i} className="card" style={{ padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", fontWeight: 500, marginBottom: 4 }}>{kpi.label}</div>
                                    <div style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em" }}>{kpi.value}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: "0.78rem", fontWeight: 600, color: kpi.up ? "var(--success)" : "var(--error)" }}>
                                        {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        {kpi.change} vs last period
                                    </div>
                                </div>
                                <div style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: kpi.color }}>
                                    <Icon size={22} />
                                </div>
                            </div>
                            <MiniBar data={kpi.data} color={kpi.color} />
                        </div>
                    );
                })}
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
                {/* Booking Trend */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Booking Trend</span>
                        <TrendingUp size={18} color="var(--accent)" />
                    </div>
                    <div style={{ padding: "16px 0" }}>
                        <MiniLine data={[18, 22, 15, 28, 32, 25, 38, 42, 35, 48, 44, 52]} color="var(--accent)" />
                    </div>
                    <div style={{ display: "flex", gap: 24, fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 8 }}>
                        <div><span style={{ fontWeight: 700, color: "var(--text-primary)" }}>52</span> this week</div>
                        <div><span style={{ fontWeight: 700, color: "var(--text-primary)" }}>38</span> last week</div>
                        <div style={{ color: "var(--success)", fontWeight: 600 }}>+36.8%</div>
                    </div>
                </div>

                {/* Contact Sources */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Contact Sources</span>
                        <Users size={18} color="var(--info)" />
                    </div>
                    <div>
                        {sources.map((s, i) => (
                            <div key={i} style={{ marginBottom: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 5 }}>
                                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                                    <span style={{ fontWeight: 700 }}>{s.pct}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${s.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid-2">
                {/* Top Services */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Top Services</span>
                        <BarChart3 size={18} color="var(--warning)" />
                    </div>
                    <div className="table-container" style={{ border: "none", boxShadow: "none" }}>
                        <table>
                            <thead><tr><th>Service</th><th>Bookings</th><th>Revenue</th></tr></thead>
                            <tbody>
                                {topServices.map((s, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                                        <td><span className="badge badge-info">{s.bookings}</span></td>
                                        <td style={{ fontWeight: 600, color: "var(--success)" }}>{s.revenue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inventory Status */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Inventory Health</span>
                        <Package size={18} color="var(--success)" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {[
                            { label: "In Stock", value: 142, color: "var(--success)" },
                            { label: "Low Stock", value: stats?.inventory?.lowStock?.length || 0, color: "var(--warning)" },
                            { label: "Out of Stock", value: 0, color: "var(--error)" },
                            { label: "Categories", value: 8, color: "var(--info)" },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: 14, background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: item.color }}>{item.value}</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500, marginTop: 2 }}>{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
