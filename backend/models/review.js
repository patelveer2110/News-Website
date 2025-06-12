import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    postId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    createdAt : {
        type: Date,
        default: Date.now
    },
    updatedAt : {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const ReviewModel = mongoose.model.Review || mongoose.model('Review', reviewSchema);
export default ReviewModel;

