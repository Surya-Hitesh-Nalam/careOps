import { useState, useEffect } from "react";
import api from "../utils/api";
import { Package, Plus, X, Edit2, Trash2, AlertTriangle, Minus, Search } from "lucide-react";

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: "", category: "", quantity: 0, unit: "pcs", threshold: 5 });

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try { const { data } = await api.get("/inventory"); setItems(data.items); } catch { }
        setLoading(false);
    };

    const openCreate = () => { setEditing(null); setForm({ name: "", category: "", quantity: 0, unit: "pcs", threshold: 5 }); setShowModal(true); };
    const openEdit = (item) => { setEditing(item); setForm({ name: item.name, category: item.category || "", quantity: item.quantity, unit: item.unit || "pcs", threshold: item.threshold || 5 }); setShowModal(true); };

    const save = async () => {
        try {
            if (editing) { await api.put(`/inventory/${editing.id}`, form); }
            else { await api.post("/inventory", form); }
            setShowModal(false); fetchItems();
        } catch { }
    };

    const adjust = async (id, delta) => {
        try { await api.put(`/inventory/${id}/adjust`, { adjustment: delta }); fetchItems(); } catch { }
    };

    const remove = async (id) => {
        if (!confirm("Delete this item?")) return;
        try { await api.delete(`/inventory/${id}`); fetchItems(); } catch { }
    };

    const filtered = items.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()));
    const lowStockCount = items.filter(i => i.quantity <= (i.threshold || 5)).length;

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>Inventory</h1><p>{items.length} items tracked</p></div>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Item</button>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", marginBottom: 20 }}>
                <div className="stat-card"><div className="stat-icon accent"><Package size={20} /></div><div><div className="stat-value">{items.length}</div><div className="stat-label">Total Items</div></div></div>
                <div className="stat-card"><div className="stat-icon warning"><AlertTriangle size={20} /></div><div><div className="stat-value">{lowStockCount}</div><div className="stat-label">Low Stock</div></div></div>
                <div className="stat-card"><div className="stat-icon success"><Package size={20} /></div><div><div className="stat-value">{items.reduce((s, i) => s + i.quantity, 0)}</div><div className="stat-label">Total Units</div></div></div>
            </div>

            <div className="card" style={{ padding: 14, marginBottom: 20 }}>
                <div className="search-input">
                    <Search size={16} />
                    <input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {loading ? <div className="loading-spinner" /> : filtered.length === 0 ? (
                <div className="empty-state"><Package size={48} /><h3>No items found</h3></div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                    {filtered.map(item => {
                        const isLow = item.quantity <= (item.threshold || 5);
                        return (
                            <div key={item.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                                <div style={{ height: 3, background: isLow ? "var(--warning)" : "var(--success)" }} />
                                <div style={{ padding: 18 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                        <div>
                                            <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{item.name}</h3>
                                            {item.category && <span className="badge badge-default" style={{ marginTop: 4 }}>{item.category}</span>}
                                        </div>
                                        <div style={{ display: "flex", gap: 4 }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}><Edit2 size={13} /></button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => remove(item.id)} style={{ color: "var(--error)" }}><Trash2 size={13} /></button>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => adjust(item.id, -1)} disabled={item.quantity <= 0}><Minus size={14} /></button>
                                            <div style={{ textAlign: "center", minWidth: 50 }}>
                                                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: isLow ? "var(--warning)" : "var(--text-primary)" }}>{item.quantity}</div>
                                                <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)" }}>{item.unit}</div>
                                            </div>
                                            <button className="btn btn-secondary btn-sm" onClick={() => adjust(item.id, 1)}><Plus size={14} /></button>
                                        </div>
                                        {isLow && (
                                            <span className="badge badge-warning" style={{ gap: 3 }}>
                                                <AlertTriangle size={10} /> Low
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editing ? "Edit Item" : "Add Item"}</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <div className="input-group"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Item name" /></div>
                        <div className="input-group"><label>Category</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Supplies, Equipment" /></div>
                        <div className="grid-2">
                            <div className="input-group"><label>Quantity</label><input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
                            <div className="input-group"><label>Unit</label><input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="pcs, boxes, etc." /></div>
                        </div>
                        <div className="input-group"><label>Low Stock Threshold</label><input type="number" value={form.threshold} onChange={e => setForm({ ...form, threshold: Number(e.target.value) })} /></div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save}>{editing ? "Update" : "Create"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
