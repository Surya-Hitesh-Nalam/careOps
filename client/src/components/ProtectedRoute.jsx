import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, ownerOnly }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading-spinner" />;
    if (!user) return <Navigate to="/login" />;
    if (ownerOnly && user.role !== "owner") return <Navigate to="/dashboard" />;
    return children;
}
