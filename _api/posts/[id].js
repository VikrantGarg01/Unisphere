import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'DELETE') {
    try {
      // Check if post belongs to user
      const [post] = await query('SELECT user_id FROM posts WHERE id = ?', [id])

      if (!post) {
        return res.status(404).json({ message: 'Post not found' })
      }

      if (post.user_id !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' })
      }

      await query('DELETE FROM posts WHERE id = ?', [id])
      res.status(200).json({ message: 'Post deleted' })
    } catch (error) {
      console.error('Delete post error:', error)
      res.status(500).json({ message: 'Server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default authMiddleware(handler)
