import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  const { id } = req.params
  
  console.log('[Stats] Request for user:', id, 'from user:', req.userId)

  if (!id || id === 'undefined') {
    return res.status(400).json({ message: 'User ID is required' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get followers count
    const followersResult = await query(
      'SELECT COUNT(*) as count FROM followers WHERE following_id = ?',
      [id]
    )

    // Get following count
    const followingResult = await query(
      'SELECT COUNT(*) as count FROM followers WHERE follower_id = ?',
      [id]
    )

    // Get posts count
    const postsResult = await query(
      'SELECT COUNT(*) as count FROM posts WHERE user_id = ?',
      [id]
    )

    // Check if current user is following this user
    const isFollowingResult = await query(
      'SELECT COUNT(*) as count FROM followers WHERE follower_id = ? AND following_id = ?',
      [req.userId, id]
    )

    res.status(200).json({
      followersCount: followersResult[0].count,
      followingCount: followingResult[0].count,
      postsCount: postsResult[0].count,
      isFollowing: isFollowingResult[0].count > 0
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
