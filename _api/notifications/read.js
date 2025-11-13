import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { notificationIds } = req.body

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ message: 'Notification IDs are required' })
    }

    const placeholders = notificationIds.map(() => '?').join(',')
    
    await query(
      `UPDATE notifications SET is_read = 1 
       WHERE id IN (${placeholders}) AND user_id = ?`,
      [...notificationIds, req.userId]
    )

    res.status(200).json({ message: 'Notifications marked as read' })
  } catch (error) {
    console.error('Mark notifications as read error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
