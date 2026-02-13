import { useState, useEffect } from "react";
import api from "../utils/api";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarView() {
    const [bookings, setBookings] = useState([]);
    const [current, setCurrent] = useState(new Date());
    const [view, setView] = useState("month");
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => { fetchBookings(); }, [current]);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get("/bookings");
            setBookings(data.bookings);
        } catch { }
        setLoading(false);
    };

    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const prev = () => setCurrent(new Date(year, month - 1, 1));
    const next = () => setCurrent(new Date(year, month + 1, 1));
    const goToday = () => setCurrent(new Date());

    const getBookingsForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return bookings.filter(b => b.date?.startsWith(dateStr));
    };

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const selectedBookings = selectedDay ? getBookingsForDay(selectedDay) : [];

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>Calendar</h1><p>Visual overview of your schedule</p></div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button className="btn btn-secondary btn-sm" onClick={goToday}>Today</button>
                    <button className="btn btn-ghost btn-sm" onClick={prev}><ChevronLeft size={18} /></button>
                    <span style={{ fontWeight: 700, fontSize: "1.05rem", minWidth: 180, textAlign: "center" }}>
                        {MONTHS[month]} {year}
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={next}><ChevronRight size={18} /></button>
                </div>
            </div>

            {loading ? <div className="loading-spinner" /> : (
                <div style={{ display: "flex", gap: 20 }}>
                    {/* Calendar Grid */}
                    <div className="card" style={{ flex: 1, padding: 0, overflow: "hidden" }}>
                        {/* Day headers */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--border-light)" }}>
                            {DAYS.map(d => (
                                <div key={d} style={{
                                    padding: "12px 8px", textAlign: "center",
                                    fontSize: "0.75rem", fontWeight: 700,
                                    color: "var(--text-tertiary)", textTransform: "uppercase",
                                    letterSpacing: "0.06em"
                                }}>{d}</div>
                            ))}
                        </div>

                        {/* Day cells */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                            {days.map((d, i) => {
                                const dayBookings = d ? getBookingsForDay(d) : [];
                                const isTodayCell = d && isToday(d);
                                const isSelected = d === selectedDay;
                                return (
                                    <div
                                        key={i}
                                        onClick={() => d && setSelectedDay(d === selectedDay ? null : d)}
                                        style={{
                                            minHeight: 100, padding: 8,
                                            borderBottom: "1px solid var(--border-light)",
                                            borderRight: (i + 1) % 7 !== 0 ? "1px solid var(--border-light)" : "none",
                                            cursor: d ? "pointer" : "default",
                                            background: isSelected ? "var(--accent-lighter)" : d ? "transparent" : "var(--bg-tertiary)",
                                            transition: "background var(--transition-fast)"
                                        }}
                                    >
                                        {d && (
                                            <>
                                                <div style={{
                                                    width: 28, height: 28,
                                                    borderRadius: "var(--radius-full)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: "0.82rem", fontWeight: isTodayCell ? 700 : 500,
                                                    background: isTodayCell ? "var(--accent-gradient)" : "transparent",
                                                    color: isTodayCell ? "white" : "var(--text-primary)",
                                                    marginBottom: 4
                                                }}>{d}</div>
                                                {dayBookings.slice(0, 3).map((b, j) => (
                                                    <div key={j} style={{
                                                        fontSize: "0.68rem", padding: "2px 6px",
                                                        borderRadius: 4, marginBottom: 2,
                                                        background: `${b.service?.color || "var(--accent)"}20`,
                                                        color: b.service?.color || "var(--accent)",
                                                        fontWeight: 600, overflow: "hidden",
                                                        textOverflow: "ellipsis", whiteSpace: "nowrap"
                                                    }}>
                                                        {b.time} {b.contact?.name?.split(" ")[0]}
                                                    </div>
                                                ))}
                                                {dayBookings.length > 3 && (
                                                    <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", fontWeight: 600, paddingLeft: 6 }}>
                                                        +{dayBookings.length - 3} more
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar: Selected day detail */}
                    {selectedDay && (
                        <div className="card" style={{ width: 300, flexShrink: 0, animation: "slideInRight 0.3s ease", alignSelf: "start" }}>
                            <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>
                                {MONTHS[month]} {selectedDay}, {year}
                            </h3>
                            <p style={{ fontSize: "0.82rem", color: "var(--text-tertiary)", marginBottom: 16 }}>
                                {selectedBookings.length} booking{selectedBookings.length !== 1 ? "s" : ""}
                            </p>
                            {selectedBookings.length === 0 ? (
                                <div className="empty-state" style={{ padding: 24 }}>
                                    <Calendar size={32} />
                                    <p style={{ marginTop: 8 }}>No bookings</p>
                                </div>
                            ) : (
                                selectedBookings.map((b, i) => (
                                    <div key={i} style={{
                                        display: "flex", alignItems: "center", gap: 12,
                                        padding: "12px 0",
                                        borderBottom: i < selectedBookings.length - 1 ? "1px solid var(--border-light)" : "none"
                                    }}>
                                        <div style={{
                                            width: 4, height: 40, borderRadius: 2,
                                            background: b.service?.color || "var(--accent)",
                                            flexShrink: 0
                                        }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: "0.88rem" }} className="truncate">{b.contact?.name || "Unknown"}</div>
                                            <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>{b.service?.name}</div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.82rem", fontWeight: 600, color: "var(--accent)", flexShrink: 0 }}>
                                            <Clock size={13} /> {b.time}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
