import { query } from '../lib/db.js'
import { generateOTP, sendOTPEmail } from '../lib/email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    // Validation
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // Check if email is from Chitkara domain
    if (!email.endsWith('@chitkara.edu.in')) {
      return res.status(403).json({ 
        message: 'Only @chitkara.edu.in email addresses are allowed' 
      })
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete any existing unused OTPs for this email
    await query(
      'DELETE FROM otp_verifications WHERE email = ? AND is_used = 0',
      [email]
    )

    // Store OTP in database
    await query(
      'INSERT INTO otp_verifications (email, otp, expires_at, created_at) VALUES (?, ?, ?, NOW())',
      [email, otp, expiresAt]
    )

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp)

    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP email' })
    }

    res.status(200).json({ 
      message: emailResult.devMode 
        ? 'OTP sent successfully (check server console in dev mode)' 
        : 'OTP sent successfully to your email',
      expiresIn: 600, // seconds
      devMode: emailResult.devMode || false
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
