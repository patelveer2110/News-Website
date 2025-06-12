import PostModel from "../models/post.js";
import CommentModel from "../models/comments.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import UserModel from "../models/user.js";
import AdminModel from "../models/admin.js";
import { v2 as cloudinary } from "cloudinary";
import { log } from "console";


const createPost = async (req, res) => {
    try {
        const { title, content, category, tags, status, scheduledAt } = req.body;
        const adminID = req.adminID;
        console.log("bgfvds");
        
        if (!adminID) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Only enforce required fields if not saving as draft
        if (status !== "drafted") {
            if (!title || !content || !category) {
                return res.status(400).json({ message: "Title, content, and category are required for published or scheduled posts." });
            }

            if (status === "scheduled" && !scheduledAt) {
                return res.status(400).json({ message: "Scheduled date is required for scheduled posts." });
            }

            if (!req.file) {
                return res.status(400).json({ message: "Banner image is required for published or scheduled posts." });
            }
        }

        // Upload banner image to Cloudinary if provided
        let bannerImage = "";
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "blog",
                use_filename: true,
            });
            bannerImage = result.secure_url;
        }
console.log("gfds");

        const processedTags =
            typeof tags === "string"
                ? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
                : tags;

        const newPost = new PostModel({
            title: title || "", // use empty string if not provided for draft
            content: content || "",
            category: category || "",
            tags: processedTags || [],
            bannerImage,
            views: 0,
            likesCount: 0,
            likes: [],
            status: status || "drafted",
            scheduledAt: status === "scheduled" ? new Date(scheduledAt) : null,
            publishedAt: status === "published" ? new Date() : null,
            createdAt: new Date(),
            createdBy: adminID,
        });
        console.log(newPost);
        
        await newPost.save();
          console.log("Post saved successfully!");
        
        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;

    // console.log("Update post called with ID:", id);
    // console.log("Request body:", req.body);

    // Build update object dynamically
    const updateFields = {
      title,
      content,
      category,
      tags,
    };

    if (req.file && req.file.path) {
      updateFields.bannerImage = req.file.path;
    }

    const updatedPost = await PostModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Error in updatePost:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPost = await PostModel.findByIdAndDelete(id);
        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}


const updatePostStatus = async (req, res) => {
  try {
    console.log("hgtrfedsa");
    
    const { id } = req.params;
    const { status } = req.body;

    
    const updatedPost = await PostModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ status: updatedPost.status });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getPosts = async (req, res) => {
  try {
    const {
      category,
      page = 1,
      limit = 10,
      sort = "latest",
      userId
    } = req.query;

    const skip = (page - 1) * limit;
    const now = new Date();

    // Define sort logic
    let sortField = "publishedAt";
    let sortObject = { [sortField]: -1 };

    if (sort === "liked") sortObject = { likesCount: -1 };
    else if (sort === "viewed") sortObject = { viewCount: -1 };
    else if (sort === "rated") sortObject = { "rating.average": -1 };

    // Base filter
    const baseFilter = {
      status: "published",
      publishedAt: { $lte: now },
      ...(category && category !== "All" ? { category } : {})
    };

    let followedIds = [];
    let userObjectId = null;

    if (userId) {
      const user = await UserModel.findById(userId).select("following");
      followedIds = user?.following.map(id => id.toString()) || [];
      userObjectId = new mongoose.Types.ObjectId(userId);
    }

    const followedSet = new Set(followedIds);

    // Fetch posts
    const allPosts = await PostModel.find(baseFilter)
      .populate("createdBy", "username profileImage")
      .sort(sortObject);

    let paginated = [];
    let label = "No posts found";

    if (sort === "latest") {
      const grouped = {
        unseen_followed: [],
        unseen_unfollowed: [],
        seen_followed: [],
        seen_unfollowed: [],
      };

      allPosts.forEach((post) => {
        const createdById = post.createdBy._id.toString();
        const isFollowed = followedSet.has(createdById);
        const isSeen = post.seenBy?.some((id) => id.toString() === userId);

        if (!isSeen && isFollowed) grouped.unseen_followed.push(post);
        else if (!isSeen && !isFollowed) grouped.unseen_unfollowed.push(post);
        else if (isSeen && isFollowed) grouped.seen_followed.push(post);
        else grouped.seen_unfollowed.push(post);
      });

      const mergedPosts = [
        ...grouped.unseen_followed,
        ...grouped.unseen_unfollowed,
        ...grouped.seen_followed,
        ...grouped.seen_unfollowed,
      ];

      paginated = mergedPosts.slice(skip, skip + parseInt(limit));

      if (grouped.unseen_followed.length) label = "Unseen posts from people you follow";
      else if (grouped.unseen_unfollowed.length) label = "Unseen posts from others";
      else if (grouped.seen_followed.length) label = "Posts you've already seen from people you follow";
      else if (grouped.seen_unfollowed.length) label = "Posts you've already seen from others";

    } else {
      // Regular sorting, no grouping
      paginated = allPosts.slice(skip, skip + parseInt(limit));
      label = `Sorted by ${sort}`;
    }

    return res.status(200).json({
      label,
      posts: paginated
    });

  } catch (error) {
    console.error("Error in getPosts:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



const getPostById = async (req, res) => {
  try {
    // console.log("getPostById called");

    const { id } = req.params;
    const { view, userId } = req.query;
    console.log(req.query);
    
    const post = await PostModel.findById(id).populate("createdBy", "username profileImage");
console.log(userId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (view === "true") {
      post.views += 1;

      if (userId && !post.seenBy.includes(userId)) {
        post.seenBy.push(userId);
        console.log(post.seenBy);
        
      }

      await post.save();
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in getPostById:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userID = req.userID; // Assuming userID is set in the request by authentication middleware
        if (!userID) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const post = await PostModel.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        // Check if the user has already liked the post
        if (post.likes.includes(userID)) {
            // User has already liked the post, remove the like
            post.likes = post.likes.filter(like => !like.equals(userID));
            post.likesCount = post.likes.length;
        } else {
            // User has not liked the post, add the like
            post.likes.push(userID);
            post.likesCount = post.likes.length;
        }
        await post.save();
        const updatedPost = await PostModel.findById(id).populate('createdBy', 'username profileImage');
        res.status(200).json({ message: "Post liked successfully", post: updatedPost });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

// const getPostsByCategory = async (req, res) => {
//     try {
//         const { category } = req.params;
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;
//         const now = new Date();
//         const posts = await PostModel.find({
//             category,
//             status: 'published',
//             publishedAt: { $lte: now }
//         })
//             .skip(skip)
//             .limit(limit)
//             .sort({ publishedAt: -1 });
//         if (!posts || posts.length === 0) {
//             return res.status(404).json({ message: "No more posts found" });
//         }
//         res.status(200).json(posts);
//     } catch (error) {
//         res.status(500).json({ message: "Server error", error });
//     }
// }
const getPostsByTag = async (req, res) => {
    try {
        const { tag } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const now = new Date();

        // Build the query object
        const query = {
            tags: tag,
            status: 'published',
            publishedAt: { $lte: now }
        };

        // Add category filter if present and not "All"
        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }

        const posts = await PostModel.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ publishedAt: -1 });

        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: "No more posts found" });
        }
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

const getPostByAdminId = async (req, res) => {
    try {
        const {id} = req.params ;
        const adminID =id// Assuming adminID is set in the request by authentication middleware
        console.log("getPostByAdminId called with adminID:", adminID);
        if (!adminID) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        log("getPostByAdminId called with adminID:", adminID);
        const posts = await PostModel.find({ 
            createdBy: adminID,
        }).populate("createdBy", "username profileImage");
        // if (!posts || posts.length === 0) {
        //   console.log("No posts found for this admin:", adminID);
          
        //     return res.status(404).json({ message: "No posts found for this admin" });
        // }
        console.log("Posts found:", posts.length);
        
        res.status(200).json(posts);
    } catch (error) {
      console.log("Error in getPostByAdminId:", error);
      
        res.status(500).json({ message: "Server error", error });
    }
}

const getDraftPosts = async (req, res) => {

    adminID = req.adminID;

    const posts = await PostModel.find({ status: 'draft', createdBy: adminID });
    if (!posts) {
        return res.status(404).json({ message: "No draft posts found" });
    }
    res.status(200).json(posts);
};


const getScheduledPosts = async (req, res) => {
    adminID = req.adminID;
    const posts = await PostModel.find({
        status: 'scheduled',
        scheduledAt: { $gt: new Date() },
        createdBy: adminID
    });
    res.status(200).json(posts);
};

const getPublishedPosts = async (req, res) => {
    adminID = req.adminID;
    const posts = await PostModel.find({
        status: 'published',
        publishedAt: { $lte: new Date() },
        createdBy: adminID
    });
    res.status(200).json(posts);
}

const reportPost = async (req, res) => {
  try {
    const { id } = req.params;      // post ID
    const userId = req.userID;      // logged-in user ID
    const { reason } = req.body;    // report reason
console.log(id);
console.log(reason);
console.log(userId.toString());



    if (!reason || reason.trim() === "") {
      return res.status(400).json({ msg: "Reason for report is required." });
    }

    console.log("uyjhgtrfed");
    
    const post = await PostModel.findById(id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const alreadyReported = post.reportedBy.find(
      (report) => report?.user?.toString() === userId.toString()
    );
console.log("jyhtgfrds");

    if (alreadyReported) {
      return res.status(400).json({ msg: "You have already reported this post" });
    }

    post.reportedBy.push({ user: userId, reason, reportedAt: new Date() });
    await post.save();

    res.status(200).json({ msg: "Post reported successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
const getReportedPosts = async (req, res) => {
  try {
    // Find posts with at least one report
    // Populate userId for author and reportedBy.user for reporter info
    const adminID = req.adminID
    console.log(adminID);
    
    const posts = await PostModel.find({ 'reportedBy.0': { $exists: true } , createdBy :adminID })
      .populate('createdBy', 'username') // get author's username
      .populate('reportedBy.user', 'username') // get reporters' usernames
      .select('title content category tags bannerImage reportedBy') // select needed fields
      .lean();
console.log(posts);
    console.log();
    
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching reported posts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
export {
    createPost,
    updatePost,
    deletePost,
    getPosts,
    getPostById,
    likePost,
    // getPostsByCategory,
    getPostsByTag,
    getDraftPosts,
    getScheduledPosts,
    getPublishedPosts,
    getPostByAdminId,
    updatePostStatus,
    reportPost,
    getReportedPosts
}