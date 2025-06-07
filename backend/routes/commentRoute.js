import express from 'express';
import { createComment, getcommentsByPostId,getreportedComment,reportComment } from '../controllers/commentController.js';
import { userAuth } from '../middleware/userAuth.js';
import { adminAuth } from '../middleware/adminAuth.js';

const commentRoute = express.Router();
// Create a new comment on a post
commentRoute.get('/reported',adminAuth,getreportedComment);
commentRoute.put('/addcomment/:id', userAuth, createComment);
// Get comments by post ID
commentRoute.get('/comments/:id', getcommentsByPostId);


commentRoute.post('/report/:id',userAuth,reportComment);
export default commentRoute;