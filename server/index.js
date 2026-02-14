import "dotenv/config";
import express from "express";
import cors from "cors";
import prisma from "./config/prisma.js";
import authRoutes from "./routes/auth.js";
import workspaceRoutes from "./routes/workspace.js";
import staffRoutes from "./routes/staff.js";
import contactRoutes from "./routes/contacts.js";
import serviceRoutes from "./routes/services.js";
import availabilityRoutes from "./routes/availability.js";
import bookingRoutes from "./routes/bookings.js";
import formRoutes from "./routes/forms.js";
import inventoryRoutes from "./routes/inventory.js";
import conversationRoutes from "./routes/conversations.js";
import dashboardRoutes from "./routes/dashboard.js";
import publicRoutes from "./routes/public.js";
import integrationRoutes from "./routes/integrations.js";
import aiRoutes from "./routes/ai.js";
import resourceRoutes from "./routes/resources.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/resources", resourceRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", db: "postgresql", time: new Date().toISOString() }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await prisma.$connect();
        console.log("PostgreSQL connected via Prisma");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error("Failed to connect:", err.message);
        process.exit(1);
    }
}

start();
