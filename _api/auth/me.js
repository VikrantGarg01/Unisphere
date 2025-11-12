import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const [user] = await query(
      'SELECT id, username, email, bio, profile_image, created_at FROM users WHERE id = ?',
      [req.userId]
    )

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
