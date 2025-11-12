import { authMiddleware } from '../../lib/auth.js'
import { query } from '../../lib/db.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { id } = req.params
    const userId = req.userId || 0

    console.log('Getting posts for user:', id)

    // Get posts from specific user
    const posts = await query(
      `SELECT 
        p.*,
        u.username,
        u.email,
        u.profile_image
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      GROUP BY p.id, u.username, u.email, u.profile_image
      ORDER BY p.created_at DESC`,
      [id]
    )

    console.log('Found posts:', posts.length)

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

    res.status(200).json(formattedPosts)
  } catch (error) {
    console.error('Get user posts error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
