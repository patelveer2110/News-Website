import AdminModel from "../models/admin.js";
import PostModel from "../models/post.js";
import UserModel from "../models/user.js";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { log } from "console";
import { sendEmail } from "../utils/sendEmail.js";

// imp/ort { adminOtpStore } from "../utils/adminOtpStore.js";
const adminOtpStore = new Map();
const adminRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const image = req.file?.path;

    if (!image) {
      return res.status(400).json({ message: "Profile image is required" });
    }

    const existing = await AdminModel.findOne({ email });
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    const existingUsername = await AdminModel.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "Username already taken" });

    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "admin-profiles",
      use_filename: true,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Store temp data until OTP is verified
    adminOtpStore.set(email, {
      otp,
      expiresAt,
      username,
      password,
      profileImage: uploadedImage.secure_url,
    });
    console.log("OTP Store:", adminOtpStore);
    
    await sendEmail(email, "Verify your admin account", `Your OTP is: ${otp}`);
console.log("OTP sent to email:", email, "with OTP:", otp);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to register admin", error: err.message });
  }
};
const verifyAdminOtpAndCreate = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = adminOtpStore.get(email);

    if (!record) return res.status(400).json({ message: "OTP not requested" });

    const { otp: realOtp, expiresAt, username, password } = record;

    if (Date.now() > expiresAt) {
      adminOtpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (otp !== realOtp) return res.status(400).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new AdminModel({ username, email, password: hashedPassword });
    await newAdmin.save();

    adminOtpStore.delete(email);

    const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ message: "Admin registered successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const adminLogin = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find admin by email OR username
    const admin = await AdminModel.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!admin)
      return res.status(400).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Admin logged in successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const forgotAdminPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await AdminModel.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    adminOtpStore.set(email, {
      otp,
      expiresAt,
      type: "reset-password", // optional identifier
    });

    await sendEmail(email, "Reset Admin Password", `Your OTP is: <b>${otp}</b>`);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const resetAdminPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = adminOtpStore.get(email);

    if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedAdmin = await AdminModel.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    adminOtpStore.delete(email);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const adminProfile = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { userId } = req.query;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const admin = await AdminModel.findById(adminId).select("-password").lean();
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const followersCount = admin.followers?.length || 0;

    let isFollowing = false;
    if (userId) {
      isFollowing = admin.followers?.some(id => id.toString() === userId);
    }

    res.status(200).json({
      ...admin,
      followersCount,
      isFollowing,
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const followUnfollowAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const userId = req.userID; // From authentication middleware

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [admin, user] = await Promise.all([
      AdminModel.findById(adminId),
      UserModel.findById(userId)
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isFollowing = admin.followers.includes(userId);

    if (isFollowing) {
      // Unfollow
      admin.followers = admin.followers.filter(id => id.toString() !== userId.toString());
      user.following = user.following.filter(id => id.toString() !== adminId.toString());
      console.log("Unfollowing admin:", adminId, "by user:", userId);
      console.log("Updated followers:", admin.followers);
      console.log("Updated following:", user.following);
      
    } else {
      // Follow
      admin.followers.push(userId);
      user.following.push(adminId);
      console.log("following admin:", adminId, "by user:", userId);
      console.log("Updated followers:", admin.followers);
      console.log("Updated following:", user.following);
    }

    await Promise.all([admin.save(), user.save()]);

    res.status(200).json({
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      admin
    });

  } catch (error) {
    console.error("Error in followUnfollowAdmin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateProfile = async (req, res) => {
    try {
        // const { adminId } = req.params;
        const adminId = req.adminID;

        if ( !adminId) {
            return res.status(403).json({ message: "Unauthorized: cannot edit others' profiles" });
        }

        const { username, email } = req.body;

        // Check if username or email already taken by others
        const usernameExists = await AdminModel.findOne({ username, _id: { $ne: adminId } });
        if (usernameExists) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const emailExists = await AdminModel.findOne({ email, _id: { $ne: adminId } });
        if (emailExists) {
            return res.status(400).json({ message: "Email already taken" });
        }

        let profileImageUrl;
        if (req.file) {
            // Upload new profile image to cloudinary
            const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
                folder: "blog",
                use_filename: true,
            });
            profileImageUrl = uploadedImage.secure_url;
        }

        const updateData = { username, email };
        if (profileImageUrl) updateData.profileImage = profileImageUrl;

        const updatedAdmin = await AdminModel.findByIdAndUpdate(adminId, updateData, { new: true });

        if (!updatedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", admin: updatedAdmin });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}
const getPostCountsForAdmins = async (adminIds) => {
  // aggregate published posts grouped by createdBy (admin)
  const counts = await PostModel.aggregate([
    {
      $match: {
        createdBy: { $in: adminIds },
        status: "published"  // only count published posts
      }
    },
    {
      $group: {
        _id: "$createdBy",
        count: { $sum: 1 }
      }
    }
  ]);

  // Map adminId to count for quick lookup
  const countMap = {};
  counts.forEach(c => {
    countMap[c._id.toString()] = c.count;
  });

  return countMap;
}

const getAllAdmins = async (req, res) => {
  try {
    const admins = await AdminModel.find({}).select("-password");

    const adminIds = admins.map(admin => admin._id);
    const postCounts = await getPostCountsForAdmins(adminIds);

    const results = admins.map(admin => ({
      _id: admin._id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
      profileImage: admin.profileImage,
      followerCount: admin.followers ? admin.followers.length : 0,
      postCount: postCounts[admin._id.toString()] || 0,
    }));

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Search admins by query with follower and post counts
const searchAdminProfiles = async (req, res) => {
  const query = req.params.query?.trim();

  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const regex = new RegExp(query, "i");

    const admins = await AdminModel.find({
      $or: [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
        { email: { $regex: regex } },
      ],
    }).select("-password");

    const adminIds = admins.map(admin => admin._id);
    const postCounts = await getPostCountsForAdmins(adminIds);

    const results = admins.map(admin => ({
      _id: admin._id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
      profileImage: admin.profileImage,
      followerCount: admin.followers ? admin.followers.length : 0,
      postCount: postCounts[admin._id.toString()] || 0,
    }));

    res.status(200).json(results);
  } catch (error) {
    console.error("Admin search error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
export { adminRegister, adminLogin, verifyAdminOtpAndCreate, forgotAdminPassword,resetAdminPassword, adminProfile,followUnfollowAdmin,updateProfile , getAllAdmins, searchAdminProfiles };
