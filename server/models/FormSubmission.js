import mongoose from "mongoose";

const formSubmissionSchema = new mongoose.Schema({
    template: { type: mongoose.Schema.Types.ObjectId, ref: "FormTemplate", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact", required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
        type: String,
        enum: ["pending", "completed", "overdue"],
        default: "pending"
    },
    submittedAt: { type: Date },
    dueDate: { type: Date }
}, { timestamps: true });

formSubmissionSchema.index({ workspace: 1, status: 1 });

export default mongoose.model("FormSubmission", formSubmissionSchema);
