import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: String, enum: ["system", "staff", "customer"], required: true },
    channel: { type: String, enum: ["email", "sms", "system"], default: "system" },
    body: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

const conversationSchema = new mongoose.Schema({
    contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact", required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    messages: [messageSchema],
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCount: { type: Number, default: 0 },
    automationPaused: { type: Boolean, default: false },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

conversationSchema.index({ workspace: 1, lastMessageAt: -1 });

export default mongoose.model("Conversation", conversationSchema);
