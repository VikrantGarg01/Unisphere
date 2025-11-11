import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const notifications = await query(
      `SELECT n.*, 
       CASE 
         WHEN n.type = 'follow' THEN (SELECT username FROM users WHERE id = n.source_id)
         WHEN n.type = 'message' THEN (SELECT username FROM users u JOIN messages m ON m.conversation_id = n.source_id WHERE m.sender_id = u.id LIMIT 1)
       END as username
       FROM notifications n
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.userId]
    )

    const formattedNotifications = notifications.map(notif => ({
      ...notif,
      message: getNotificationMessage(notif.type)
    }))

    res.status(200).json(formattedNotifications)
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

function getNotificationMessage(type) {
  switch (type) {
    case 'follow':
      return 'started following you'
    case 'message':
      return 'sent you a message'
    default:
      return 'interacted with you'
  }
}

export default authMiddleware(handler)
