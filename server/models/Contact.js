import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    phone: { type: String, default: "" },
    message: { type: String, default: "" },
    source: { type: String, enum: ["contact_form", "booking", "manual"], default: "manual" },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    tags: [{ type: String }],
    notes: { type: String, default: "" }
}, { timestamps: true });

contactSchema.index({ workspace: 1, email: 1 });

export default mongoose.model("Contact", contactSchema);
