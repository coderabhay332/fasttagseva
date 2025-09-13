import mongoose, { model, Schema } from "mongoose";
import {} from "./user.dto";
import bcrypt from "bcrypt";
const hashPassword = async (password) => {
    const hash = await bcrypt.hash(password, 12);
    return hash;
};
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    },
    content: [{
            type: mongoose.Schema.Types.ObjectId, ref: "Content", required: true
        }],
    refreshToken: {
        type: String
    }
});
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await hashPassword(this.password);
    }
    next();
});
export default model("User", userSchema);
//# sourceMappingURL=user.schema.js.map