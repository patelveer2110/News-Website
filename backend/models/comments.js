import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    reportedBy: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required : true,
            },
            reason: {
                type: String,
                required: true,
            },
            reportedAt: {
                type: Date,
                default: Date.now,
            },
        }],
}, { timestamps: true });
const CommentModel = mongoose.model.Comment || mongoose.model('Comment', commentSchema);
export default CommentModel;