import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
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
    profileImage: {
        type: String,
        default: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    },
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
    }],
    isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
}, { timestamps: true });
const UserModel = mongoose.model.User || mongoose.model('User', userSchema);
export default UserModel;