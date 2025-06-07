import PostModel from "../models/post.js";
import CommentModel from "../models/comments.js";


const createComment = async (req, res) => {
  try {

    const { id } = req.params;
    const { comment } = req.body;
    const userID = req.userID; // Assuming userID is set in the request by authentication middleware
    console.log("addcommentOnPost called with post ID:", id, "and comment:", comment);
    console.log("User ID:", userID);
    if (!userID) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    // Create a new comment object
    const newComment = {
      postId: id,
      userId: userID,
      comment: comment,
    };
    // Create a new CommentModel instance
    const commentDoc = new CommentModel(newComment);
    // Save the comment to the database
    console.log("Saving comment:", commentDoc);

    await commentDoc.save();

    res.status(200).json({ message: "Comment added successfully", post });
  }
  catch (error) {
    console.log("Error in addcommentOnPost:", error);

    res.status(500).json({ message: "Server error", error });
  }
}
const getcommentsByPostId = async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await CommentModel.find({ postId: id })
      .populate('userId', 'username profileImage'); // ✅ Populate correct field with selected fields

    if (!comments || comments.length === 0) {
      return res.status(404).json({ message: "No comments found for this post" });
    }

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// make sure import matches your filename

// Report a comment with reason
const reportComment = async (req, res) => {
  try {
    console.log("erdcftgvhbjnmk");
    
    const { id } = req.params;           // comment ID
    const userId = req.userID;           // logged-in user ID
    const { reason } = req.body;  
    console.log(req.body);
          // report reason from request body
    console.log(reason);
    console.log(id);
    
    if (!reason || reason.trim() === "") {
      return res.status(400).json({ msg: "Reason for report is required." });
    }

    const comment = await CommentModel.findById(id);
    console.log(comment);
    
    if (!comment) return res.status(404).json({ msg: "Comment not found" });

    // Check if user already reported this comment
    console.log("UserId reporting:", userId);
console.log("ReportedBy user IDs:", comment.reportedBy.map(r => r.user?.toString()));

const alreadyReported = comment.reportedBy.find(
  report => report?.user?.toString?.() === userId.toString()
);

if (alreadyReported) {
  console.log(alreadyReported);
  
  return res.status(400).json({ msg: "You have already reported this comment" });
}


console.log("Already reported?", alreadyReported);

  console.log(alreadyReported);
  

    if (alreadyReported) {
      return res.status(400).json({ msg: "You have already reported this comment" });
    }
    console.log('dcfgvbhjnmk,');
    

    // Add the report entry
    comment.reportedBy.push({ user: userId, reason, reportedAt: new Date() });
    await comment.save();

    res.status(200).json({ msg: "Comment reported successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all reported comments (for admin) with reporter info and reason
const getreportedComment = async (req, res) => {
  try {
    const adminID = req.adminID;
    console.log("Admin ID:", adminID);

    // Fetch reported comments with all needed fields populated
    const reportedComments = await CommentModel.find({
      "reportedBy.0": { $exists: true }
    })
      .populate("userId", "username profileImage")
      .populate("postId", "createdBy title")  // createdBy = admin who created the post
      .populate("reportedBy.user", "username profileImage");

    // Filter only those where the post's createdBy === adminID
    const filteredComments = reportedComments.filter(comment => {
      return comment.postId && comment.postId.createdBy?.toString() === adminID.toString();
    });

    res.status(200).json(filteredComments);
  } catch (error) {
    console.error("Error fetching reported comments:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export { createComment, getcommentsByPostId, reportComment, getreportedComment };
