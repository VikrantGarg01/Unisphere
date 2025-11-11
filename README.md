# 🌐 Unisphere - Student Social Media Platform

A modern, responsive student social media platform built with React, Vercel Serverless Functions, and MySQL (PlanetScale).

## ✨ Features

- **Authentication**: Secure JWT-based login and registration
- **Posts**: Create, view, and share posts with image support
- **Social Features**: Follow/unfollow users, view followers and following
- **Direct Messaging**: One-on-one chat with real-time updates (polling)
- **Notifications**: Get notified about messages and new followers
- **Responsive Design**: Beautiful UI built with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: MySQL (PlanetScale)
- **Authentication**: JWT + bcrypt
- **Image Storage**: Cloudinary (optional)

## 📋 Prerequisites

- Node.js 18+ and npm
- PlanetScale account (or any MySQL database)
- Cloudinary account (optional, for image uploads)

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd Unisphere
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Database

1. Create a PlanetScale database
2. Run the schema from `database/schema.sql`
3. Get your connection string

### 4. Environment Variables

Create a `.env` file in the root directory:

\`\`\`env
DATABASE_URL=mysql://username:password@host/database
JWT_SECRET=your_super_secret_jwt_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## 📦 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
\`\`\`

## 📁 Project Structure

\`\`\`
Unisphere/
├── api/                      # Serverless API endpoints
│   ├── auth/                # Authentication endpoints
│   ├── posts/               # Post-related endpoints
│   ├── messages/            # Direct messaging endpoints
│   ├── notifications/       # Notification endpoints
│   ├── follow/              # Follow system endpoints
│   └── lib/                 # Shared utilities
├── src/
│   ├── api/                 # Frontend API client
│   ├── components/          # React components
│   ├── context/             # React Context (Auth)
│   ├── pages/               # Page components
│   └── utils/               # Utility functions
├── database/
│   └── schema.sql          # Database schema
└── public/                  # Static assets
\`\`\`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Posts
- `POST /api/posts/create` - Create post
- `GET /api/posts/feed` - Get feed
- `DELETE /api/posts/:id` - Delete post

### Follow System
- `POST /api/follow/:id` - Follow/unfollow user
- `GET /api/followers/:id` - Get followers

### Direct Messages
- `GET /api/messages/conversations` - Get conversations
- `POST /api/messages/start` - Start conversation
- `GET /api/messages/:conversationId` - Get messages
- `POST /api/messages/:conversationId/send` - Send message
- `POST /api/messages/:conversationId/read` - Mark as read

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/read` - Mark as read

## 🎨 Color Scheme

- Primary: `#2563EB` (Blue)
- Accent: `#F59E0B` (Amber)
- Background: `#F9FAFB`
- Text: `#111827`

## 🧪 Development Phases

- ✅ **Phase 1**: Auth + Profile + Feed + Posts
## 🧪 Development Phases

- ✅ **Phase 1**: Auth + Profile + Feed + Posts
- ✅ **Phase 2**: Follow system + Direct Messages (polling)
- ✅ **Phase 3**: Notifications
## 📝 Database Schema

The database includes 6 main tables:
- `users` - User accounts
- `posts` - User posts
- `followers` - Follow relationships
- `conversations` - DM conversations
- `messages` - DM messages
- `notifications` - System notifications

See `database/schema.sql` for complete schema.
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
- Image upload to Cloudinary not yet implemented
- Profile editing functionality pending

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
