// Middleware to adapt Vercel-style handlers to Express
export function adaptHandler(handler) {
  return async (req, res) => {
    // Add query parameters from params (for dynamic routes like [id])
    req.query = { ...req.query, ...req.params };
    
    try {
      await handler(req, res);
    } catch (error) {
      if (!res.headersSent) {
        console.error('Handler error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };
}
