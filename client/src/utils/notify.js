import toast from "react-hot-toast";

// Standardized toast configuration
const notify = {
    success: (msg) => toast.success(msg, { duration: 3000, style: { background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-color)" } }),
    error: (msg) => toast.error(msg, { duration: 5000, style: { background: "#fee2e2", color: "#991b1b", border: "1px solid #f87171" } }),
    warning: (msg) => toast(msg, { icon: "⚠️", duration: 5000, style: { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" } }),
    loading: (msg) => toast.loading(msg, { style: { background: "var(--bg-secondary)", color: "var(--text-primary)" } }),
    dismiss: (id) => toast.dismiss(id)
};

export default notify;
