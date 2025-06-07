
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectdb from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import './cron/scheduler.js'; // Import the scheduler
import userRoute from './routes/userRoute.js';
import adminRoute from './routes/adminRoute.js';
import postRoute from './routes/postRoute.js';
import commentRoute from './routes/commentRoute.js';
// Importing the required modules
import PostModel from './models/post.js';
import CommentModel from './models/comments.js';


const app = express();
dotenv.config();


app.use(cors());
app.use(express.json());
connectdb();
connectCloudinary();


const PORT = process.env.PORT || 5000;

const postsWithBadLikes = await PostModel.find({ likes: { $type: "int" } });

for (const post of postsWithBadLikes) {
  console.log(`Fixing post with ID: ${post._id}`);
  
  post.likes = []; // reset to array
  post.likesCount = 0;
  await post.save();
}

// Import routes
// const resetAllReportedBy = async (req, res) => {
//   try {
//     const result = await CommentModel.updateMany(
//       {}, // match all documents
//       { $set: { reportedBy: [] } }
//     );

//     // res.status(200).json({
//     //   msg: "All reportedBy fields have been reset to empty arrays.",
//     //   modifiedCount: result.modifiedCount,
//     // });
//   } catch (error) {
//     // console.error("Error resetting reportedBy fields:", error);
//     // res.status(500).json({ msg: "Server error", error });
//   }

// }
// resetAllReportedBy();
app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/post', postRoute);
app.use('/api/comment', commentRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Export the app for testing

export default app;
