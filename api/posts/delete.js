import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const postId = req.query.id
    const userId = req.userId

    if (!postId) {
      return res.status(400).json({ message: 'Post ID is required' })
    }

    console.log('Deleting post:', postId, 'by user:', userId)

    // Check if post exists and belongs to user
    const posts = await query(
      'SELECT * FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    )

    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found or unauthorized' })
    }

    // Delete the post
    await query('DELETE FROM posts WHERE id = ?', [postId])

    console.log('Post deleted successfully:', postId)

    res.status(200).json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
