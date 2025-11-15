
# 🌐 Unisphere - Student Social Media Platform

A modern, full-featured student social media platform built with React, Vite, Tailwind CSS, Vercel Serverless Functions, and MySQL (PlanetScale).

## ✨ Features

- **Authentication**: Secure JWT-based login, registration, and password reset with OTP (Chitkara email required; OTPs are delivered automatically via the Bravo web service to the user’s email)
- **Profile**: View and edit profile, upload profile image, set bio, see stats (posts, followers, following)
- **Posts**: Create, edit, delete, like, and comment on posts with image support
- **Feed**: Personalized feed from followed users and self
- **Explore**: Discover posts from non-followed users
- **Social**: Follow/unfollow users, view followers/following, user suggestions
- **Direct Messaging**: One-on-one chat with real-time updates (Coming Soon)
- **Notifications**: Get notified about new followers
- **Responsive Design**: Modern UI built with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: MySQL (Railway)
- **Authentication**: JWT + bcrypt

## 📋 Prerequisites

- Node.js 18+ and npm
- Railway account (or any MySQL database)


## 🚀 Getting Started

> **Note:** OTPs for authentication are sent automatically to your email via the Bravo web service. No installation or manual setup is required.

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Unisphere
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

1. Create a PlanetScale database
2. Run the schema from `database/schema.sql`
3. Get your connection string

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=mysql://username:password@host/database
JWT_SECRET=your_super_secret_jwt_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📦 Deployment

## 📦 Deployment

### Frontend: Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel (https://vercel.com/)
3. Set environment variables in the Vercel dashboard
4. Deploy!

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy (optional, via CLI)
vercel
```

### Backend & Database: Deploy to Railway

1. Push your backend code to GitHub
2. Go to [Railway](https://railway.app/) and create a new project
3. Connect your GitHub repo and deploy the backend (Node.js serverless functions)
4. Set up a MySQL database in Railway (or connect to PlanetScale)
5. Add all required environment variables in Railway (see above)
6. Deploy!

> **Note:**
> - Make sure your frontend (Vercel) points to the correct Railway backend API URL.
> - You can use Railway for both backend and database, or connect Railway backend to a PlanetScale database.

## 📁 Project Structure

```text
Unisphere/
├── _api/                      # Serverless API endpoints (auth, posts, messages, notifications, follow, users, lib)
├── src/
│   ├── api/                 # Frontend API client
│   ├── components/          # React components
│   ├── context/             # React Context (Auth)
│   ├── pages/               # Page components
│   └── utils/               # Utility functions
├── database/
│   └── schema.sql           # Database schema
└── public/                  # Static assets
```

## 🔌 API Endpoints (Key)

### Authentication
- `POST /api/auth/register` - Register new user (OTP required)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP

### Posts
- `POST /api/posts/create` - Create post
- `PUT /api/posts/update?id=POST_ID` - Update post
- `DELETE /api/posts/delete?id=POST_ID` - Delete post
- `GET /api/posts/feed` - Get personalized feed
- `GET /api/posts/explore` - Get explore posts
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment
- `GET /api/posts/:id/comment` - Get comments

### Follow System
- `POST /api/follow/:id` - Follow/unfollow user
- `GET /api/followers/:id` - Get followers
- `GET /api/follow/following?id=USER_ID` - Get following
- `GET /api/follow/stats/:id` - Get user stats (followers, following, posts, isFollowing)

### Users
- `GET /api/users/:username` - Get user profile by username
- `PUT /api/users/update-profile` - Update profile
- `GET /api/users/suggestions` - Get user suggestions
- `GET /api/users/:id/posts` - Get posts by user

### Direct Messages
- `GET /api/messages/conversations` - Get conversations
- `POST /api/messages/start` - Start conversation
- `GET /api/messages/:conversationId` - Get messages
- `POST /api/messages/:conversationId/send` - Send message
- `POST /api/messages/:conversationId/read` - Mark as read

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/read` - Mark as read
- `GET /api/notifications/unread-count` - Get unread count

## 🎨 Color Scheme

- Primary: `#2563EB` (Blue)
- Accent: `#F59E0B` (Amber)
- Background: `#F9FAFB`
- Text: `#111827`

## 📝 Database Schema

The database includes these main tables:
- `users` - User accounts
- `posts` - User posts
- `followers` - Follow relationships
- `conversations` - DM conversations
- `messages` - DM messages
- `notifications` - System notifications
- `otp_verifications` - OTP for auth flowsgit add README.md

See `database/schema.sql` for the complete schema.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👥 Team Roles

- **Frontend Dev 1**: Auth + Profile UI
- **Frontend Dev 2**: Feed + Post system
- **Frontend Dev 3**: Messaging module
- **Backend Dev 1**: API endpoints + DB
- **Backend Dev 2**: Auth + Notifications
- **QA/Tester**: Testing + Debugging

## 🐛 Known Issues

- Messages use polling (3s interval) - will be upgraded to WebSockets

## 🔮 Future Enhancements

- Real-time messaging with Pusher/Ably
- Story feature
- Video posts
- Advanced search and explore
- Dark mode
- Mobile app (React Native)

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ by the Unisphere Team
