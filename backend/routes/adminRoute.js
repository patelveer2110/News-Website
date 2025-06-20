import { adminLogin, adminRegister, verifyAdminOtpAndCreate, forgotAdminPassword,resetAdminPassword, adminProfile, followUnfollowAdmin, searchAdminProfiles,getAllAdmins,updateProfile } from "../controllers/adminController.js";
import express from "express";
import fileUpload from "../middleware/multer.js";
import { userAuth } from "../middleware/userAuth.js";
import { adminAuth } from "../middleware/adminAuth.js";
const adminRoute = express.Router();
// Admin registration route
adminRoute.post("/register", fileUpload.single("image"), adminRegister);
adminRoute.post("/verify-otp", verifyAdminOtpAndCreate);
adminRoute.post("/forgot-password", forgotAdminPassword);
adminRoute.post("/reset-password", resetAdminPassword);
// Admin login route
adminRoute.post("/login", adminLogin);

// Admin profile route
adminRoute.get("/profile/:adminId", adminProfile);
adminRoute.get('/search/:query', searchAdminProfiles);
adminRoute.get("/all", getAllAdmins);
// Follow/Unfollow admin route
adminRoute.post("/follow-unfollow/:adminId", userAuth,followUnfollowAdmin);

adminRoute.put("/profile/edit", adminAuth, fileUpload.single("profileImage"), updateProfile);

export default adminRoute;