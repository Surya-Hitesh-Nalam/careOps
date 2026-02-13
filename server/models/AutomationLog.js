import mongoose from "mongoose";

const automationLogSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    event: { type: String, required: true },
    action: { type: String, required: true },
    status: { type: String, enum: ["success", "failed", "skipped"], default: "success" },
    details: { type: String, default: "" },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    relatedModel: { type: String }
}, { timestamps: true });

automationLogSchema.index({ workspace: 1, createdAt: -1 });

export default mongoose.model("AutomationLog", automationLogSchema);
