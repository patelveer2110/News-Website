// cron/scheduler.js
import cron from 'node-cron';
import PostModel from '../models/post.js';

cron.schedule('* * * * *', async () => {
  const now = new Date();
  console.log('Running scheduled task to publish posts...');
  const scheduledPosts = await PostModel.find({
    status: 'scheduled',
    scheduledAt: { $lte: now },
  });

  for (const post of scheduledPosts) {
    post.status = 'published';
    post.publishedAt = now;
    await post.save();
    console.log(`Published scheduled post: ${post.title}`);
  }
});
