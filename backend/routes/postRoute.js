import { createPost, getPosts, getPostById, updatePost, deletePost,reportPost, getReportedPosts,updatePostStatus, likePost, getPostsByTag, getDraftPosts, getPublishedPosts, getScheduledPosts,getPostByAdminId } from "../controllers/postcontroller.js";
import express from "express";  
import fileUpload from "../middleware/multer.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { userAuth } from "../middleware/userAuth.js";

const postRoute = express.Router();

// Create a new post
postRoute.post("/create", adminAuth, fileUpload.single("banner"), createPost);

// Get all posts
postRoute.get("/", getPosts);

// Get posts by category
// postRoute.get("/category/:category", getPostsByCategory);

// Get posts by tag
postRoute.get("/tag/:tag", getPostsByTag);

// Get posts by admin ID
postRoute.get("/admin/:id", getPostByAdminId);
// Like a post
postRoute.put("/like/:id", userAuth, likePost);

postRoute.get("/reported", adminAuth, getReportedPosts);
// Get a post by ID (put this after all above fixed routes)
postRoute.get("/:id", getPostById);

// Update a post
postRoute.put("/update/:id", adminAuth,fileUpload.single("banner"), updatePost);
postRoute.put("/update/status/:id", adminAuth, updatePostStatus);

// Delete a post
postRoute.delete("/delete/:id", adminAuth, deletePost);

postRoute.post("/report/:id", userAuth, reportPost);


// Get draft posts
postRoute.get("/drafts", adminAuth, getDraftPosts);
// Get scheduled posts
postRoute.get("/scheduled", adminAuth, getScheduledPosts);
// Get published posts
postRoute.get("/published", adminAuth, getPublishedPosts);

export default postRoute;
