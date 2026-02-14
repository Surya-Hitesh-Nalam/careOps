import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BusinessProvider } from "./contexts/BusinessContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import AIAssistant from "./components/AIAssistant";
import { Toaster } from "react-hot-toast";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import InboxPage from "./pages/InboxPage";
import Contacts from "./pages/Contacts";
import ContactDetail from "./pages/ContactDetail";
import Bookings from "./pages/Bookings";
import CalendarView from "./pages/CalendarView";
import Services from "./pages/Services";
import Forms from "./pages/Forms";
import Inventory from "./pages/Inventory";
import ResourcesPage from "./pages/ResourcesPage";
import AutomationRules from "./pages/AutomationRules";
import Staff from "./pages/Staff";
import ActivityLog from "./pages/ActivityLog";
import Settings from "./pages/Settings";
import PublicBooking from "./pages/PublicBooking";
import PublicContact from "./pages/PublicContact";
import PublicForm from "./pages/PublicForm";

function AppLayout({ children }) {
    const { user } = useAuth();
    const location = useLocation();
    const publicPaths = ["/", "/login", "/register", "/onboarding"];
    const isPublic = publicPaths.includes(location.pathname) || location.pathname.startsWith("/book/") || location.pathname.startsWith("/contact/") || location.pathname.startsWith("/form/");

    if (!user || isPublic) return children;

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar />
                {children}
                <AIAssistant />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <BusinessProvider>
                        <Toaster position="top-right" toastOptions={{ className: 'glass-panel', style: { padding: '16px', color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' } }} />
                        <AppLayout>
                            <Routes>
                                {/* Public */}
                                <Route path="/" element={<Landing />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

                                {/* Core App */}
                                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                                <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
                                <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                                <Route path="/contacts/:id" element={<ProtectedRoute><ContactDetail /></ProtectedRoute>} />
                                <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                                <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
                                <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
                                <Route path="/forms" element={<ProtectedRoute><Forms /></ProtectedRoute>} />
                                <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                                <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
                                <Route path="/automations" element={<ProtectedRoute><AutomationRules /></ProtectedRoute>} />
                                <Route path="/staff" element={<ProtectedRoute ownerOnly><Staff /></ProtectedRoute>} />
                                <Route path="/activity" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
                                <Route path="/settings" element={<ProtectedRoute ownerOnly><Settings /></ProtectedRoute>} />

                                {/* Public-facing */}
                                <Route path="/book/:workspaceId" element={<PublicBooking />} />
                                <Route path="/contact/:workspaceId" element={<PublicContact />} />
                                <Route path="/form/:formId" element={<PublicForm />} />

                                {/* Fallback */}
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </AppLayout>
                    </BusinessProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}
