import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const limit = parseInt(req.query.limit) || 5

    // Get users that the current user is NOT following
    // Exclude the current user and users already followed
    const suggestions = await query(
      `SELECT u.id, u.username, u.profile_image, u.bio
       FROM users u
       WHERE u.id != ?
       AND u.id NOT IN (
         SELECT following_id 
         FROM followers 
         WHERE follower_id = ?
       )
       ORDER BY u.created_at DESC
       LIMIT ?`,
      [req.userId, req.userId, limit]
    )

    res.status(200).json(suggestions)
  } catch (error) {
    console.error('Get suggestions error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
