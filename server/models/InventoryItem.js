import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, default: "pcs" },
    threshold: { type: Number, default: 5, min: 0 },
    category: { type: String, default: "General" },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true }
}, { timestamps: true });

inventoryItemSchema.index({ workspace: 1 });

export default mongoose.model("InventoryItem", inventoryItemSchema);
