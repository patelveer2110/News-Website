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

    if (!image) {
      return res.status(400).json({ message: "Profile image is required" });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "Username already taken" });

    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "user-profiles",
      use_filename: true,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    userOtpStore.set(email, {
      otp,
      expiresAt,
      username,
      password,
      profileImage: uploadedImage.secure_url,
    });

    await sendEmail(email, "Verify your account", `Your OTP is: <b>${otp}</b>`);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to register user", error: err.message });
  }
};


// ========== Verify OTP & Create User ==========
const verifyUserOtpAndCreate = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = userOtpStore.get(email);

    if (!record) return res.status(400).json({ message: "OTP not requested" });

    const { otp: realOtp, expiresAt, username, password, profileImage } = record;

    if (Date.now() > expiresAt) {
      userOtpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (otp !== realOtp) return res.status(400).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      profileImage,
      isVerified: true,
    });
    await newUser.save();

    userOtpStore.delete(email);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ message: "User registered successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ========== Login User (Only After OTP Verification) ==========
const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user by email OR username
    const user = await UserModel.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user || !user.isVerified)
      return res.status(400).json({ message: "User not found or not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const forgotUserPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user || !user.isVerified)
      return res.status(404).json({ message: "User not found or not verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    userOtpStore.set(email, {
      otp,
      expiresAt,
      type: "reset-password",
    });

    await sendEmail(email, "Reset Your Password", `<b>Your OTP is: ${otp}</b>`);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const resetUserPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = userOtpStore.get(email);

    if (
      !record ||
      record.otp !== otp ||
      record.expiresAt < Date.now() ||
      record.type !== "reset-password"
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    userOtpStore.delete(email);
    res.status(200).json({ message: "Password reset successful" });
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
  verifyUserOtpAndCreate,
  loginUser,
  getUserProfile,
  editUserProfile,
  forgotUserPassword,
  resetUserPassword,
};
