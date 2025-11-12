import { query } from '../lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, otp } = req.body

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' })
    }

    // Find valid OTP
    const otpRecords = await query(
      `SELECT * FROM otp_verifications 
       WHERE email = ? AND otp = ? AND is_used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    )

    if (otpRecords.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    // Don't mark as used yet - let the registration endpoint do that
    // Just verify the OTP is valid
    res.status(200).json({ 
      message: 'OTP verified successfully',
      verified: true
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
