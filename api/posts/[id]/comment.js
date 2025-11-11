import { authMiddleware } from '../../lib/auth.js'
import { query } from '../../lib/db.js'

async function handler(req, res) {
  const { id } = req.params

  if (req.method === 'GET') {
    try {
      const comments = await query(
        `SELECT c.*, u.username, u.profile_image
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ?
         ORDER BY c.created_at DESC`,
        [id]
      )

      res.status(200).json(comments)
    } catch (error) {
      console.error('Get comments error:', error)
      res.status(500).json({ message: 'Server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const { content } = req.body

      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Content is required' })
      }

      const result = await query(
        'INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())',
        [id, req.userId, content]
      )

      // Create notification
      const [post] = await query('SELECT user_id FROM posts WHERE id = ?', [id])
      
      if (post && post.user_id !== req.userId) {
        await query(
          'INSERT INTO notifications (user_id, type, source_id, created_at) VALUES (?, ?, ?, NOW())',
          [post.user_id, 'comment', id]
        )
      }

      const [comment] = await query(
        `SELECT c.*, u.username, u.profile_image
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`,
        [result.insertId]
      )

      res.status(201).json(comment)
    } catch (error) {
      console.error('Add comment error:', error)
      res.status(500).json({ message: 'Server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default authMiddleware(handler)
