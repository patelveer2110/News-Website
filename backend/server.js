
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
import reviewRoute from './routes/reviewRoute.js'; // Importing the review route
// Importing the required modules
import PostModel from './models/post.js';
import CommentModel from './models/comments.js';
import AdminModel from './models/admin.js';
import UserModel from './models/user.js';
const app = express();
dotenv.config();


app.use(cors());
app.use(express.json());
connectdb();
connectCloudinary();


const PORT = process.env.PORT || 5000;



app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/post', postRoute);
app.use('/api/comment', commentRoute);
app.use('/api/review', reviewRoute); // Using the review route

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Export the app for testing

export default app;
