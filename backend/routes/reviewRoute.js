import mongoose from "mongoose";
import { addOrUpdateReview } from "../controllers/reviewController.js";
import { userAuth } from "../middleware/userAuth.js";

import express from "express";
const reviewRouter = express.Router();


// Route to add or update a review
reviewRouter.post("/add-or-update", userAuth, addOrUpdateReview);
// Route to fetch reviews for a post
reviewRouter.get("/fetch/:postId", addOrUpdateReview);


// Export the review router
export default reviewRouter;