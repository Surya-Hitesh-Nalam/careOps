import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    timezone: { type: String, default: "UTC" },
    contactEmail: { type: String, default: "" },
    phone: { type: String, default: "" },
    logo: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 1, min: 1, max: 8 },
    emailConfig: {
        provider: { type: String, default: "" },
        host: { type: String, default: "" },
        port: { type: Number, default: 587 },
        user: { type: String, default: "" },
        pass: { type: String, default: "" },
        configured: { type: Boolean, default: false }
    },
    smsConfig: {
        provider: { type: String, default: "" },
        sid: { type: String, default: "" },
        authToken: { type: String, default: "" },
        phone: { type: String, default: "" },
        configured: { type: Boolean, default: false }
    },
    settings: {
        accentColor: { type: String, default: "#6366f1" },
        fontScale: { type: Number, default: 1 },
        sidebarPosition: { type: String, enum: ["left", "right"], default: "left" }
    }
}, { timestamps: true });

export default mongoose.model("Workspace", workspaceSchema);
