import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const followers = await query(
      `SELECT u.id, u.username, u.profile_image, u.bio,
       (SELECT COUNT(*) FROM followers WHERE follower_id = ? AND following_id = u.id) as isFollowing
       FROM followers f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ?`,
      [req.userId, id]
    )

    res.status(200).json(followers)
  } catch (error) {
    console.error('Get followers error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
