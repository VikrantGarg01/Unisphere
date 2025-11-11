import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    const userId = req.userId || 0

    console.log('Getting explore posts for user:', userId)

    // Get random posts from users that the current user is NOT following and NOT their own posts
    // This is for the Explore page to discover new content
    const posts = await query(
      `SELECT 
        p.*,
        u.username,
        u.email,
        u.profile_image,
        u.bio
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id != ?
        AND p.user_id NOT IN (SELECT following_id FROM followers WHERE follower_id = ?)
      GROUP BY p.id, u.username, u.email, u.profile_image, u.bio
      ORDER BY RAND(), p.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, userId, parseInt(limit), parseInt(offset)]
    )

    console.log('Found explore posts:', posts.length)

    // Format posts with user data
    const formattedPosts = posts.map(post => ({
      id: post.id,
      caption: post.caption,
      image_url: post.image_url,
      created_at: post.created_at,
      user: {
        id: post.user_id,
        username: post.username,
        email: post.email,
        profile_image: post.profile_image,
        bio: post.bio
      }
    }))

    res.status(200).json({
      posts: formattedPosts,
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: formattedPosts.length === parseInt(limit)
    })
  } catch (error) {
    console.error('Explore feed error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
