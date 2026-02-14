import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getBusinessType, BUSINESS_TYPES } from "../config/businessTypes";

const BusinessContext = createContext();

export function BusinessProvider({ children }) {
    const { user } = useAuth();
    const [businessType, setBusinessType] = useState(BUSINESS_TYPES.GENERAL);
    const [loading, setLoading] = useState(true);

    // Effect to update business type when user logs in or workspace loads
    useEffect(() => {
        if (user && user.workspace) {
            const type = getBusinessType(user.workspace.type || "General");
            setBusinessType(type);
            applyTheme(type.id);
        } else {
            // Default or public view logic could go here
            // For now, we wait or stick to General
            setBusinessType(BUSINESS_TYPES.GENERAL);
        }
        setLoading(false);
    }, [user]);

    // Function to manually set type (e.g. during onboarding)
    const setType = (typeId) => {
        const typeConfig = Object.values(BUSINESS_TYPES).find(t => t.id === typeId) || BUSINESS_TYPES.GENERAL;
        setBusinessType(typeConfig);
        applyTheme(typeConfig.id);
    };

    const applyTheme = (typeId) => {
        const root = document.documentElement;
        // Simple logic for now, could be expanded to full color palettes
        switch (typeId) {
            case "clinical":
                root.style.setProperty("--accent", "#0ea5e9"); // Sky Blue
                root.style.setProperty("--accent-light", "rgba(14, 165, 233, 0.1)");
                root.style.setProperty("--accent-gradient", "linear-gradient(135deg, #0ea5e9, #3b82f6)");
                break;
            case "salon":
                root.style.setProperty("--accent", "#d946ef"); // Fuchsia
                root.style.setProperty("--accent-light", "rgba(217, 70, 239, 0.1)");
                root.style.setProperty("--accent-gradient", "linear-gradient(135deg, #d946ef, #a855f7)");
                break;
            case "auto":
                root.style.setProperty("--accent", "#ef4444"); // Red
                root.style.setProperty("--accent-light", "rgba(239, 68, 68, 0.1)");
                root.style.setProperty("--accent-gradient", "linear-gradient(135deg, #ef4444, #f97316)");
                break;
            case "fitness":
                root.style.setProperty("--accent", "#f59e0b"); // Amber
                root.style.setProperty("--accent-light", "rgba(245, 158, 11, 0.1)");
                root.style.setProperty("--accent-gradient", "linear-gradient(135deg, #f59e0b, #ef4444)");
                break;
            default:
                root.style.setProperty("--accent", "#6366f1"); // Indigo (Default)
                root.style.setProperty("--accent-light", "rgba(99, 102, 241, 0.1)");
                root.style.setProperty("--accent-gradient", "linear-gradient(135deg, #6366f1, #a855f7)");
        }
    };

    const value = {
        meta: businessType, // The full config object (labels, features, etc)
        setType, // To manually change it
        isLoading: loading,
        // Helper accessors for cleaner code in components
        label: {
            customer: businessType.customerTerm,
            service: businessType.serviceTerm,
            staff: "Staff" // Could also be dynamic
        }
    };

    return (
        <BusinessContext.Provider value={value}>
            {children}
        </BusinessContext.Provider>
    );
}

export function useBusiness() {
    return useContext(BusinessContext);
}
