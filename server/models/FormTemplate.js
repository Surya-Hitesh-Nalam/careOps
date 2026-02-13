import mongoose from "mongoose";

const formTemplateSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    fields: [{
        label: { type: String, required: true },
        type: { type: String, enum: ["text", "email", "phone", "textarea", "select", "checkbox", "file", "date", "number"], default: "text" },
        required: { type: Boolean, default: false },
        options: [{ type: String }],
        placeholder: { type: String, default: "" }
    }],
    linkedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("FormTemplate", formTemplateSchema);
