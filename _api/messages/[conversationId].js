import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  const { conversationId } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Verify user is part of conversation
    const [conversation] = await query(
      'SELECT * FROM conversations WHERE id = ? AND (user_one_id = ? OR user_two_id = ?)',
      [conversationId, req.userId, req.userId]
    )

    if (!conversation) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    // Get messages
    const messages = await query(
      `SELECT m.*, u.username, u.profile_image
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [conversationId]
    )

    const formattedMessages = messages.map(msg => ({
      ...msg,
      isSent: msg.sender_id === req.userId
    }))

    res.status(200).json(formattedMessages)
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
