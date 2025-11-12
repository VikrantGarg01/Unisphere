import { authMiddleware } from '../lib/auth.js'
import { query } from '../lib/db.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { caption, image_url } = req.body
    const userId = req.userId

    console.log('[Create Post] Request:', { 
      userId, 
      hasCaption: !!caption, 
      hasImage: !!image_url,
      captionLength: caption?.length || 0
    })

    if (!caption && !image_url) {
      console.log('[Create Post] Validation failed: No caption or image')
      return res.status(400).json({ message: 'Caption or image is required' })
    }

    const result = await query(
      'INSERT INTO posts (user_id, caption, image_url, created_at) VALUES (?, ?, ?, NOW())',
      [userId, caption || null, image_url || null]
    )

    const postId = result.insertId
    console.log('[Create Post] Post created:', { postId, userId })

    // Get the created post with user info
    const posts = await query(
      `SELECT p.*, u.username, u.profile_image
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [postId]
    )

    if (posts.length === 0) {
      throw new Error('Post created but could not be retrieved')
    }

    const post = posts[0]

    const responseData = {
      ...post,
      user: {
        id: post.user_id,
        username: post.username,
        profile_image: post.profile_image
      }
    }

    console.log('[Create Post] Success:', { postId, username: post.username })
    res.status(201).json(responseData)
  } catch (error) {
    console.error('[Create Post] Error:', {
      message: error.message,
      stack: error.stack,
      userId: req.userId
    })
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

export default authMiddleware(handler)
 