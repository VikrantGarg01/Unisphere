import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const conversations = await query(
      `SELECT DISTINCT c.id, c.created_at,
       CASE 
         WHEN c.user_one_id = ? THEN c.user_two_id 
         ELSE c.user_one_id 
       END as other_user_id,
       u.username, u.profile_image,
       (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as lastMessage,
       (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) as unreadCount
       FROM conversations c
       JOIN users u ON u.id = CASE 
         WHEN c.user_one_id = ? THEN c.user_two_id 
         ELSE c.user_one_id 
       END
       WHERE c.user_one_id = ? OR c.user_two_id = ?
       ORDER BY c.created_at DESC`,
      [req.userId, req.userId, req.userId, req.userId, req.userId]
    )

    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      otherUser: {
        id: conv.other_user_id,
        username: conv.username,
        profile_image: conv.profile_image
      },
      lastMessage: conv.lastMessage,
      unreadCount: conv.unreadCount,
      created_at: conv.created_at
    }))

    res.status(200).json(formattedConversations)
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
