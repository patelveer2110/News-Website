// Title, Content, Category, Tags, Banner Image
import { create } from "domain";
import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: function() {
    return this.status !== 'drafted'; // only required if not a draft
  }
    },
    content: {
        type: String,
        required: function() {
    return this.status !== 'drafted'; // only required if not a draft
  }
    },
    category: {
        type: String,
        required: function() {
    return this.status !== 'drafted'; // only required if not a draft
  },
        index: true,
    },
    tags: {
        type: [String],
        index: true,
    },
    bannerImage: {
        type: String,
        required: function() {
    return this.status !== 'drafted'; // only required if not a draft
  }
    },
    views: {
        type: Number,
        default: 0,
    },
    likesCount: {
        type: Number,
        default: 0,
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId], // array of userIds
        ref: 'User',
        default: [],
    },
    seenBy: {
        type: [mongoose.Schema.Types.ObjectId], // array of userIds
        ref: 'User',
        default: [],
    },
    rating: {
  average: { type: Number, default: 0 },
  count: { type: Number, default: 0 }
},

    status: {
        type: String,
        enum: ['drafted', 'scheduled', 'published', 'unpublished'],
        default: 'drafted'
    },
    scheduledAt: {
        type: Date,
        default: null,
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
    publishedAt: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
});
const PostModel = mongoose.model.Post || mongoose.model('Post', postSchema);

export default PostModel;