import ReviewModel from "../models/review.js";
import PostModel from "../models/post.js";

// Utility to recalculate average rating
const updatePostRating = async (postId) => {
  const reviews = await ReviewModel.find({ postId });

  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const average = reviews.length > 0 ? total / reviews.length : 0;

  await PostModel.findByIdAndUpdate(postId, {
    "rating.average": average.toFixed(1),
    "rating.count": reviews.length
  });
};

// Create or update review
const addOrUpdateReview = async (req, res) => {
  try {
    const { postId, rating } = req.body;
    const userId = req.userID; // from auth middleware
    console.log("Received review data:", { postId, rating, userId });
    

    if (!postId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid post or rating" });
    }

    const existingReview = await ReviewModel.findOne({ postId, userId });

    if (existingReview) {
      existingReview.rating = rating;
      await existingReview.save();
    } else {
      await ReviewModel.create({ postId, userId, rating });
    }

    await updatePostRating(postId);

    return res.status(200).json({ message: "Review saved successfully" });
  } catch (error) {
    console.error("Review error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const fetchReviews = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const reviews = await ReviewModel.find({ postId }).populate("userId", "name profilePicture");

    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export { addOrUpdateReview, fetchReviews };