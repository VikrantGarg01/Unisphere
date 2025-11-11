import { useState, useEffect } from 'react'
import { getFeed } from '../api/posts'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import Sidebar from '../components/Sidebar'
import Suggestions from '../components/Suggestions'

const Feed = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadFeed()
  }, [page])

  // Refetch feed when window regains focus (catches profile updates)
  useEffect(() => {
    const handleFocus = () => {
      loadFeed()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const loadFeed = async () => {
    try {
      const data = await getFeed(page)
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error loading feed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 mr-80">
        <div className="max-w-2xl mx-auto py-6 px-4">
          <CreatePost onPostCreated={loadFeed} />
          
          <div className="space-y-4 mt-6">
            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No posts yet. Be the first to share something!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} onUpdate={loadFeed} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Suggestions */}
      <Suggestions />
    </div>
  )
}

export default Feed
