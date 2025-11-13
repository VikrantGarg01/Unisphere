import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  // Get id from route params (Express :id parameter)
  const id = req.params?.id || req.query?.id

  console.log('[Follow] User ID to follow/unfollow:', id)
  console.log('[Follow] Current user ID:', req.userId)

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' })
  }

  try {
    // Check if already following
    const existingFollow = await query(
      'SELECT id FROM followers WHERE follower_id = ? AND following_id = ?',
      [req.userId, id]
    )

    if (existingFollow.length > 0) {
      // Unfollow
      await query(
        'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
        [req.userId, id]
      )
      return res.status(200).json({ following: false })
    } else {
      // Follow
      await query(
        'INSERT INTO followers (follower_id, following_id, created_at) VALUES (?, ?, NOW())',
        [req.userId, id]
      )

      // Create notification
      await query(
        'INSERT INTO notifications (user_id, type, source_id, created_at) VALUES (?, ?, ?, NOW())',
        [id, 'follow', req.userId]
      )

      return res.status(200).json({ following: true })
    }
  } catch (error) {
    console.error('Follow user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
