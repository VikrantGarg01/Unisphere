import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export const authMiddleware = (handler) => {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      
      if (!token) {
        return res.status(401).json({ message: 'No token provided' })
      }

      const decoded = verifyToken(token)
      
      if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' })
      }

      req.userId = decoded.userId
      return handler(req, res)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({ message: 'Authentication error' })
    }
  }
}
