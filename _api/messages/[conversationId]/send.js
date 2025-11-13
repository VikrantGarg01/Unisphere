import { authMiddleware } from '../../lib/auth.js'
import { query } from '../../lib/db.js'

async function handler(req, res) {
  const { conversationId } = req.query

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { content, imageUrl } = req.body

    if (!content && !imageUrl) {
      return res.status(400).json({ message: 'Content or image is required' })
    }

    // Verify user is part of conversation
    const [conversation] = await query(
      'SELECT * FROM conversations WHERE id = ? AND (user_one_id = ? OR user_two_id = ?)',
      [conversationId, req.userId, req.userId]
    )

    if (!conversation) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    // Send message
    const result = await query(
      'INSERT INTO messages (conversation_id, sender_id, content, image_url, created_at) VALUES (?, ?, ?, ?, NOW())',
      [conversationId, req.userId, content, imageUrl || null]
    )

    // Create notification for receiver
    const receiverId = conversation.user_one_id === req.userId 
      ? conversation.user_two_id 
      : conversation.user_one_id

    await query(
      'INSERT INTO notifications (user_id, type, source_id, created_at) VALUES (?, ?, ?, NOW())',
      [receiverId, 'message', conversationId]
    )

    const [message] = await query(
      `SELECT m.*, u.username, u.profile_image
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [result.insertId]
    )

    res.status(201).json(message)
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
