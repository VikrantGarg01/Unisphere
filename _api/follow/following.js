import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  const { id } = req.params

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const following = await query(
      `SELECT u.id, u.username, u.profile_image, u.bio,
       1 as isFollowing
       FROM followers f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = ?`,
      [id]
    )

    res.status(200).json(following)
  } catch (error) {
    console.error('Get following error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
