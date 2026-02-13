import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    duration: { type: Number, required: true, min: 5 },
    price: { type: Number, default: 0 },
    location: { type: String, default: "" },
    color: { type: String, default: "#6366f1" },
    isActive: { type: Boolean, default: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true }
}, { timestamps: true });

export default mongoose.model("Service", serviceSchema);
