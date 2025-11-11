import bcrypt from 'bcryptjs'
import { query } from '../lib/db.js'
import { generateToken } from '../lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { username, email, password, otp } = req.body

    // Validation
    if (!username || !email || !password || !otp) {
      return res.status(400).json({ message: 'All fields including OTP are required' })
    }

    // Check if email is from Chitkara domain
    if (!email.endsWith('@chitkara.edu.in')) {
      return res.status(403).json({ 
        message: 'Only @chitkara.edu.in email addresses are allowed' 
      })
    }

    // Verify OTP
    const otpRecords = await query(
      `SELECT * FROM otp_verifications 
       WHERE email = ? AND otp = ? AND is_used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    )

    if (otpRecords.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    )

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Mark OTP as used
    await query(
      'UPDATE otp_verifications SET is_used = 1 WHERE id = ?',
      [otpRecords[0].id]
    )

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with verified status
    const result = await query(
      'INSERT INTO users (username, email, password, is_verified, created_at) VALUES (?, ?, ?, 1, NOW())',
      [username, email, hashedPassword]
    )

    const userId = result.insertId

    // Get created user
    const [user] = await query(
      'SELECT id, username, email, bio, profile_image, created_at FROM users WHERE id = ?',
      [userId]
    )

    // Generate token
    const token = generateToken(userId)

    res.status(201).json({
      user,
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
