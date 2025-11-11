import { authMiddleware } from '../../lib/auth.js'
import { query } from '../../lib/db.js'

async function handler(req, res) {
  const { id } = req.params

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Check if already liked
    const existingLike = await query(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
      [id, req.userId]
    )

    if (existingLike.length > 0) {
      // Unlike
      await query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [id, req.userId])
      return res.status(200).json({ liked: false })
    } else {
      // Like
      await query(
        'INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, NOW())',
        [id, req.userId]
      )

      // Create notification
      const [post] = await query('SELECT user_id FROM posts WHERE id = ?', [id])
      
      if (post && post.user_id !== req.userId) {
        await query(
          'INSERT INTO notifications (user_id, type, source_id, created_at) VALUES (?, ?, ?, NOW())',
          [post.user_id, 'like', id]
        )
      }

      return res.status(200).json({ liked: true })
    }
  } catch (error) {
    console.error('Like post error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
