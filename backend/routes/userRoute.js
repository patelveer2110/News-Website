import { loginUser, registerUser } from "../controllers/usercontroller.js";
import express from "express";
import fileUpload from "../middleware/multer.js";

const userRoute = express.Router();
// User registration route
userRoute.post("/register",fileUpload.single("image"), registerUser);
// User login route
userRoute.post("/login", loginUser);

export default userRoute;