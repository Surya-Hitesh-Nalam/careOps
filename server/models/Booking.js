import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    endTime: { type: String, default: "" },
    status: {
        type: String,
        enum: ["confirmed", "completed", "no_show", "cancelled"],
        default: "confirmed"
    },
    notes: { type: String, default: "" },
    formsStatus: {
        type: String,
        enum: ["not_required", "pending", "partial", "completed"],
        default: "not_required"
    },
    reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

bookingSchema.index({ workspace: 1, date: 1 });

export default mongoose.model("Booking", bookingSchema);
