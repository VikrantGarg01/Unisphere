import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit
    const userId = req.userId || 0

    console.log('Getting feed for user:', userId)

    // Get posts from user's own posts and followed users' posts
    const posts = await query(
      `SELECT p.*, u.username, u.email, u.profile_image
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ? 
          OR p.user_id IN (SELECT following_id FROM followers WHERE follower_id = ?)
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, userId, limit, offset]
    )

    console.log('Found posts:', posts.length)

    // Debug: Log first post to see what data we have
    if (posts.length > 0) {
      console.log('First post user data:', {
        username: posts[0].username,
        email: posts[0].email,
        profile_image: posts[0].profile_image
      })
    }

    // Format posts
    const formattedPosts = posts.map(post => ({
      id: post.id,
      caption: post.caption,
      image_url: post.image_url,
      created_at: post.created_at,
      user: {
        id: post.user_id,
        username: post.username,
        email: post.email,
        profile_image: post.profile_image
      }
    }))

    res.status(200).json({
      posts: formattedPosts,
      page,
      hasMore: posts.length === limit
    })
  } catch (error) {
    console.error('Get feed error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
