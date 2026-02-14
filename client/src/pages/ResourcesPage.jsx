import { useState, useEffect } from "react";
import api from "../utils/api";
import { Plus, Trash2, Box, PenTool, Layout, Monitor } from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";

export default function ResourcesPage() {
    const { meta } = useBusiness();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState("Room");
    const [adding, setAdding] = useState(false);

    useEffect(() => { fetchResources(); }, []);

    const fetchResources = async () => {
        try { const { data } = await api.get("/resources"); setResources(data.resources); } catch { }
        setLoading(false);
    };

    const addResource = async () => {
        if (!newName) return;
        setAdding(true);
        try {
            await api.post("/resources", { name: newName, type: newType });
            setNewName("");
            fetchResources();
        } catch { }
        setAdding(false);
    };

    const deleteResource = async (id) => {
        if (!window.confirm("Delete this resource?")) return;
        try {
            await api.delete(`/resources/${id}`);
            fetchResources();
        } catch { }
    };

    const typeIcons = {
        "Room": Layout,
        "Equipment": PenTool,
        "Device": Monitor,
        "Chair": Box
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Resource Management</h1>
                    <p>Manage physical assets like rooms and equipment to prevent double-bookings.</p>
                </div>
            </div>

            <div className="grid-2">
                {/* Add New */}
                <div className="card" style={{ height: "fit-content" }}>
                    <div className="card-header">
                        <span className="card-title">Add New Resource</span>
                    </div>
                    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                        <div className="input-group">
                            <label>Resource Name</label>
                            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Treatment Room 1" />
                        </div>
                        <div className="input-group">
                            <label>Type</label>
                            <select value={newType} onChange={e => setNewType(e.target.value)}>
                                <option value="Room">Room / Bay</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Chair">Chair / Station</option>
                            </select>
                        </div>
                        <button className="btn btn-primary" onClick={addResource} disabled={adding}>
                            {adding ? "Adding..." : <><Plus size={16} /> Add Resource</>}
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Existing Resources</span>
                        <span className="badge badge-info">{resources.length} items</span>
                    </div>
                    {loading ? <div className="loading-spinner" style={{ margin: 40 }} /> :
                        resources.length === 0 ? (
                            <div className="empty-state" style={{ padding: 40 }}>
                                <Box size={32} />
                                <p>No resources added yet.</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: 500, overflowY: "auto" }}>
                                {resources.map(r => {
                                    const Icon = typeIcons[r.type] || Box;
                                    return (
                                        <div key={r.id} style={{
                                            padding: "16px 20px", borderBottom: "1px solid var(--border-light)",
                                            display: "flex", alignItems: "center", justifyContent: "space-between"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: 8, background: "var(--bg-tertiary)",
                                                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)"
                                                }}>
                                                    <Icon size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                                                    <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{r.type}</div>
                                                </div>
                                            </div>
                                            <button className="btn btn-ghost btn-sm" onClick={() => deleteResource(r.id)} style={{ color: "var(--error)" }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
