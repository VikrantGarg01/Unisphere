import bcrypt from 'bcryptjs'
import { query } from '../lib/db.js'
import { generateToken } from '../lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Check if email is from Chitkara domain
    if (!email.endsWith('@chitkara.edu.in')) {
      return res.status(403).json({ 
        message: 'Only @chitkara.edu.in email addresses are allowed' 
      })
    }

    // Find user
    const users = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check if user is verified
    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email first' })
    }

    // Generate token
    const token = generateToken(user.id)

    // Remove password from response
    delete user.password

    res.status(200).json({
      user,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
