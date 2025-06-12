import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { sendEmail } from "../utils/sendEmail.js";
import AdminModel from "../models/admin.js";

// ========== OTP Store (in-memory for User) ==========
const userOtpStore = new Map();

// ========== Register User (OTP sent, user not created yet) ==========
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const image = req.file?.path;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    if (!image) return res.status(400).json({ message: "Profile image required" });

    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    const hashedPassword = await bcrypt.hash(password, 10);
    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "blog",
      use_filename: true,
    });

    // Store temporary data with OTP
    userOtpStore.set(email, {
      username,
      email,
      password: hashedPassword,
      profileImage: uploadedImage.secure_url,
      otp,
      otpExpiry,
    });

    await sendEmail(email, "Verify your email", `<h3>Your OTP is: ${otp}</h3>`);
    res.status(200).json({ message: "OTP sent to email. Please verify." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========== Verify OTP & Create User ==========
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const userRecord = userOtpStore.get(email);

    if (
      !userRecord ||
      userRecord.otp !== otp ||
      userRecord.otpExpiry < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const { username, password, profileImage } = userRecord;

    const newUser = new UserModel({
      username,
      email,
      password,
      profileImage,
      isVerified: true,
    });

    await newUser.save();
    userOtpStore.delete(email);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ message: "User created and verified", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========== Login User (Only After OTP Verification) ==========
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "User not verified or not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========== Get User Profile ==========
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const followedAdmins = await AdminModel.find({ _id: { $in: user.following } }).select("username profileImage");
    res.status(200).json({ user, followedAdmins });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========== Edit User Profile ==========
const editUserProfile = async (req, res) => {
  try {
    const id = req.userID; // Assuming user ID is stored in req.user after authentication
    let { username, profileImage } = req.body;
    const image = req.file?.path;

    if (!username && !image) {
      return res.status(400).json({ message: "Provide username or image to update" });
    }

    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image, {
        folder: "blog",
        use_filename: true,
      });
      profileImage = uploadedImage.secure_url;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { ...(username && { username }), ...(profileImage && { profileImage }) },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  registerUser,
  verifyOtp,
  loginUser,
  getUserProfile,
  editUserProfile,
};
