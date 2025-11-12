import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    // Check if conversation already exists
    const existingConv = await query(
      `SELECT id FROM conversations 
       WHERE (user_one_id = ? AND user_two_id = ?) 
       OR (user_one_id = ? AND user_two_id = ?)`,
      [req.userId, userId, userId, req.userId]
    )

    if (existingConv.length > 0) {
      return res.status(200).json({ conversationId: existingConv[0].id })
    }

    // Create new conversation
    const result = await query(
      'INSERT INTO conversations (user_one_id, user_two_id, created_at) VALUES (?, ?, NOW())',
      [Math.min(req.userId, userId), Math.max(req.userId, userId)]
    )

    res.status(201).json({ conversationId: result.insertId })
  } catch (error) {
    console.error('Start conversation error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
