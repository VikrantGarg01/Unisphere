import { query } from '../lib/db.js'
import { verifyToken } from '../lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Verify the requesting user is authenticated
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const decoded = verifyToken(token)
    const currentUserId = decoded.userId

    // Get username from Express route parameter
    const username = req.params.username

    console.log('[Get User Profile] Looking for username:', username)

    // Fetch user data by username
    const users = await query(
      'SELECT id, username, email, bio, profile_image, created_at FROM users WHERE username = ?',
      [username]
    )

    console.log('[Get User Profile] Found users:', users.length)

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = users[0]

    // Get user stats
    const [postsCount] = await query(
      'SELECT COUNT(*) as count FROM posts WHERE user_id = ?',
      [user.id]
    )

    const [followersCount] = await query(
      'SELECT COUNT(*) as count FROM followers WHERE following_id = ?',
      [user.id]
    )

    const [followingCount] = await query(
      'SELECT COUNT(*) as count FROM followers WHERE follower_id = ?',
      [user.id]
    )

    // Check if current user is following this user
    const [isFollowingResult] = await query(
      'SELECT COUNT(*) as count FROM followers WHERE follower_id = ? AND following_id = ?',
      [currentUserId, user.id]
    )

    console.log('[Get User Profile] Returning profile for:', user.username)

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profile_image: user.profile_image,
      university: user.university || 'Chitkara University',
      department: user.department || 'CSE',
      stats: {
        postsCount: postsCount.count,
        followersCount: followersCount.count,
        followingCount: followingCount.count
      },
      isFollowing: isFollowingResult.count > 0,
      isOwnProfile: user.id === currentUserId
    })
  } catch (error) {
    console.error('Get user profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}