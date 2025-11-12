import { authMiddleware } from '../../../lib/auth.js'
import { query } from '../../../lib/db.js'

async function handler(req, res) {
  const { conversationId } = req.query

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await query(
      'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?',
      [conversationId, req.userId]
    )

    res.status(200).json({ message: 'Messages marked as read' })
  } catch (error) {
    console.error('Mark as read error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
