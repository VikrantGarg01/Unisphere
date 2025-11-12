import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { username, bio, profile_image, university, department } = req.body
    const userId = req.userId

    // Validate username if provided
    if (username) {
      if (username.length < 3 || username.length > 50) {
        return res.status(400).json({ message: 'Username must be between 3 and 50 characters' })
      }

      // Check if username is already taken by another user
      const existingUser = await query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      )

      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Username is already taken' })
      }
    }

    // Build update query dynamically
    const updates = []
    const values = []

    if (username !== undefined) {
      updates.push('username = ?')
      values.push(username)
    }

    if (bio !== undefined) {
      updates.push('bio = ?')
      values.push(bio)
    }

    if (profile_image !== undefined) {
      updates.push('profile_image = ?')
      values.push(profile_image)
    }

    if (university !== undefined) {
      updates.push('university = ?')
      values.push(university)
    }

    if (department !== undefined) {
      updates.push('department = ?')
      values.push(department)
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' })
    }

    values.push(userId)

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    // Fetch updated user data
    const [updatedUser] = await query(
      'SELECT id, username, email, bio, profile_image, university, department, created_at FROM users WHERE id = ?',
      [userId]
    )

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export default authMiddleware(handler)
