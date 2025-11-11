import bcrypt from 'bcryptjs'
import { query } from '../lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Verify OTP
    const otpRecords = await query(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND is_used = FALSE AND expires_at > NOW()',
      [email, otp]
    )

    if (otpRecords.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    // Check if user exists
    const users = await query('SELECT id FROM users WHERE email = ?', [email])
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password
    await query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    )

    // Mark OTP as used
    await query(
      'UPDATE otp_verifications SET is_used = TRUE WHERE email = ? AND otp = ?',
      [email, otp]
    )

    res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
