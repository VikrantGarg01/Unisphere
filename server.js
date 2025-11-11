import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Import API routes
import registerRoute from './api/auth/register.js';
import loginRoute from './api/auth/login.js';
import meRoute from './api/auth/me.js';
import sendOtpRoute from './api/auth/send-otp.js';
import verifyOtpRoute from './api/auth/verify-otp.js';
import forgotPasswordRoute from './api/auth/forgot-password.js';
import resetPasswordRoute from './api/auth/reset-password.js';

// Import posts routes
import createPostRoute from './api/posts/create.js';
import feedRoute from './api/posts/feed.js';
import exploreRoute from './api/posts/explore.js';
import deletePostRoute from './api/posts/delete.js';
import updatePostRoute from './api/posts/update.js';

// Import follow routes (use existing Express-compatible handlers)
import followToggleRoute from './api/follow/[id].js';
import followersRoute from './api/followers/[id].js';
import followingRoute from './api/follow/following.js';
import followStatsRoute from './api/follow/stats.js';

// Import user routes
import suggestionsRoute from './api/users/suggestions.js';
import updateProfileRoute from './api/users/update-profile.js';
import userPostsRoute from './api/users/[id]/posts.js';

// Import messages routes
import conversationsRoute from './api/messages/conversations.js';
import startConversationRoute from './api/messages/start.js';
import getMessagesRoute from './api/messages/[conversationId].js';
import sendMessageRoute from './api/messages/[conversationId]/send.js';
import markAsReadRoute from './api/messages/[conversationId]/read.js';

// Import notifications routes
import notificationsRoute from './api/notifications/index.js';
import readNotificationRoute from './api/notifications/read.js';
import unreadCountRoute from './api/notifications/unread-count.js';

// Auth routes
app.post('/api/auth/register', registerRoute);
app.post('/api/auth/login', loginRoute);
app.get('/api/auth/me', meRoute);
app.post('/api/auth/send-otp', sendOtpRoute);
app.post('/api/auth/verify-otp', verifyOtpRoute);
app.post('/api/auth/forgot-password', forgotPasswordRoute);
app.post('/api/auth/reset-password', resetPasswordRoute);

// Posts routes
app.post('/api/posts/create', createPostRoute);
app.get('/api/posts/feed', feedRoute);
app.get('/api/posts/explore', exploreRoute);
app.delete('/api/posts/delete', deletePostRoute);
app.put('/api/posts/update', updatePostRoute);

// Follow routes
app.post('/api/follow/:id', followToggleRoute);
app.get('/api/followers/:id', followersRoute);
app.get('/api/follow/following', followingRoute);
app.get('/api/stats/:id', followStatsRoute);

// User routes
app.get('/api/users/suggestions', suggestionsRoute);
app.put('/api/users/profile', updateProfileRoute);
app.get('/api/users/:id/posts', userPostsRoute);

// Messages routes
app.get('/api/messages/conversations', conversationsRoute);
app.post('/api/messages/start', startConversationRoute);
app.get('/api/messages/:conversationId', getMessagesRoute);
app.post('/api/messages/:conversationId/send', sendMessageRoute);
app.post('/api/messages/:conversationId/read', markAsReadRoute);

// Notifications routes
app.get('/api/notifications', notificationsRoute);
app.post('/api/notifications/read', readNotificationRoute);
app.get('/api/notifications/unread-count', unreadCountRoute);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Unisphere API'
  })
})

// TODO: Add like and comment routes if needed later

app.listen(PORT, () => {
  console.log(`\n✅ API Server running on http://localhost:${PORT}`);
  console.log(`📧 SMTP configured: ${process.env.SMTP_USER || 'Development mode (console only)'}\n`);
});
