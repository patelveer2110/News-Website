import {
  loginUser,
  registerUser,
  verifyUserOtpAndCreate,
  getUserProfile,
  editUserProfile,
  forgotUserPassword,
  resetUserPassword,
} from "../controllers/usercontroller.js";
import express from "express";
import fileUpload from "../middleware/multer.js";

const userRoute = express.Router();

// 📩 User Registration (Sends OTP)
userRoute.post("/register", fileUpload.single("image"), registerUser);

// ✅ OTP Verification
userRoute.post("/verify-otp", verifyUserOtpAndCreate);

// 🔐 User Login
userRoute.post("/login", loginUser);

// 👤 Get User Profile
userRoute.get("/profile/:id", getUserProfile);

// 📝 Edit User Profile
userRoute.put("/profile/edit", fileUpload.single("image"), editUserProfile);

userRoute.post("/forgot-password", forgotUserPassword);
userRoute.post("/reset-password", resetUserPassword);

export default userRoute;
