import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem("careops_token");
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get("/auth/me");
            setUser(data.user);
        } catch {
            localStorage.removeItem("careops_token");
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadUser(); }, [loadUser]);

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("careops_token", data.token);
        setUser(data.user);
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await api.post("/auth/register", { name, email, password, role: "owner" });
        localStorage.setItem("careops_token", data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem("careops_token");
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const { data } = await api.get("/auth/me");
            setUser(data.user);
        } catch { }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}
