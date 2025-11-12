import { query } from '../lib/db.js'
import { sendOTPEmail } from '../lib/email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // Check if email ends with @chitkara.edu.in
    if (!email.endsWith('@chitkara.edu.in')) {
      return res.status(400).json({ message: 'Only @chitkara.edu.in emails are allowed' })
    }

    // Check if user exists
    const users = await query('SELECT id FROM users WHERE email = ?', [email])
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No account found with this email' })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete any existing OTPs for this email
    await query('DELETE FROM otp_verifications WHERE email = ?', [email])

    // Store OTP in database
    await query(
      'INSERT INTO otp_verifications (email, otp, expires_at, created_at) VALUES (?, ?, ?, NOW())',
      [email, otp, expiresAt]
    )

    // Send OTP via email
    await sendOTPEmail(email, otp)

    res.status(200).json({ 
      message: 'OTP sent successfully to your email',
      email 
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
