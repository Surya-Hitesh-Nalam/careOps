import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    slots: [{
        start: { type: String, required: true },
        end: { type: String, required: true }
    }]
}, { timestamps: true });

availabilitySchema.index({ workspace: 1, service: 1, dayOfWeek: 1 });

export default mongoose.model("Availability", availabilitySchema);
