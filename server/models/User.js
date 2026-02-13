import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["owner", "staff"], default: "staff" },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    permissions: {
        inbox: { type: Boolean, default: true },
        bookings: { type: Boolean, default: true },
        forms: { type: Boolean, default: true },
        inventory: { type: Boolean, default: false }
    },
    avatar: { type: String, default: "" },
    lastLogin: { type: Date }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

export default mongoose.model("User", userSchema);
