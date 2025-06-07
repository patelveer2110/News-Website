import AdminModel from "../models/admin.js";
import PostModel from "../models/post.js";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const adminRegister = async (req, res, next) => {
    try {
        console.log("Admin Register Request");
        
        console.log("REQ BODY:", req.body);
        console.log("REQ FILE:", req.file);
        if (!req.body || !req.file) {
            return res.status(400).json({ message: "Missing fields or image in form-data." });
        }
        const { username, email, password } = req.body;
        const image = req.file.path;

        console.log("Admin Register Request", req.body);
        console.log("Image Path", image);
        console.log("Admin Register", username, email, password);
        const existingAdmin = await AdminModel.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }
        const existingUsername = await AdminModel.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username is already taken" });
        }

       const profileImage = await cloudinary.uploader.upload(image, {

            folder: "blog",
            use_filename: true,
        });
        const profileImageUrl = profileImage.secure_url;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new AdminModel({ username, email, password: hashedPassword,
            //  profileImage: profileImageUrl 
            });
        console.log("New Admin", newAdmin);
        await newAdmin.save();
        const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        console.log("Admin registered successfully", newAdmin);
        console.log("Token", token);
        res.status(201).json({ message: "Admin registered successfully", token });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error : error.message });
    }
}

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;


        const admin = await AdminModel
            .findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: "Admin Not Found" });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        console.log("Admin logged in successfully", admin);
        
        res.status(200).json({ message: "Admin logged in successfully", token });
    }

    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

const adminProfile = async (req, res) => {
    try {
        const {adminId } = req.params;
         // Extracting adminId from request parameters
        console.log("Fetching admin profile for ID:", adminId);
         // Assuming adminID is set in the request by authentication middleware
        if (!adminId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log("Fetching admin profile for ID:", adminId);
        
        const admin = await AdminModel.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

const followUnfollowAdmin = async (req, res) => {
    try {
        const { adminId } = req.params; // Extracting adminId from request parameters
        const userId = req.userID; // Assuming userId is set in the request by authentication middleware
        console.log("followUnfollowAdmin called with adminId:", adminId, "and userId:", userId);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const admin = await AdminModel.findById(adminId);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
       console.log("Admin found:", admin.followers);

        if (admin.followers.includes(userId)) {
            // Unfollow
            admin.followers = admin.followers.filter(id => id.toString() !== userId.toString());
        } else {
            // Follow
            admin.followers.push(userId);
        }

        await admin.save();
        res.status(200).json({ message: "Follow/Unfollow action successful", admin });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}
const updateProfile = async (req, res) => {
    try {
        const { adminId } = req.params;
        const userId = req.userID;

        if (!userId || userId !== adminId) {
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
export { adminRegister, adminLogin, adminProfile,followUnfollowAdmin,updateProfile , getAllAdmins, searchAdminProfiles };
