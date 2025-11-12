import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const postId = req.query.id
    const userId = req.userId
    const { caption, image_url } = req.body

    if (!postId) {
      return res.status(400).json({ message: 'Post ID is required' })
    }

    console.log('Updating post:', postId, 'by user:', userId)

    // Check if post exists and belongs to user
    const posts = await query(
      'SELECT * FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    )

    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found or unauthorized' })
    }

    // Update the post
    await query(
      'UPDATE posts SET caption = ?, image_url = ? WHERE id = ?',
      [caption || '', image_url || '', postId]
    )

    // Get updated post with user info
    const updatedPosts = await query(
      `SELECT p.*, u.username, u.profile_image
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [postId]
    )

    const post = updatedPosts[0]

    console.log('Post updated successfully:', postId)

    res.status(200).json({
      id: post.id,
      caption: post.caption,
      image_url: post.image_url,
      created_at: post.created_at,
      user: {
        id: post.user_id,
        username: post.username,
        profile_image: post.profile_image
      }
    })
  } catch (error) {
    console.error('Update post error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
