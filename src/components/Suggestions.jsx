import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { followUser } from '../api/follow'
import api from '../api'

const Suggestions = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [followingIds, setFollowingIds] = useState(new Set())

  useEffect(() => {
    fetchSuggestions()
  }, [])

  // Refetch suggestions when window regains focus (catches profile updates)
  useEffect(() => {
    const handleFocus = () => {
      fetchSuggestions()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/users/suggestions?limit=5')
      setSuggestedUsers(response.data)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (userId) => {
    try {
      const response = await followUser(userId)
      console.log('Follow response:', response)
      setFollowingIds(prev => new Set([...prev, userId]))
      // Remove the user from suggestions after following
      setSuggestedUsers(prev => prev.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Error following user:', error)
      alert('Failed to follow user. Please try again.')
    }
  }

  const getInitials = (username) => {
    return username ? username.substring(0, 2).toUpperCase() : '??'
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 fixed right-0 top-0 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Suggested For You */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Suggested For You</h3>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              See all
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : suggestedUsers.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">No suggestions available</p>
              </div>
            ) : (
              suggestedUsers.map((user) => (
                <div key={user.id} className="py-3 flex items-center justify-between">
                  <Link 
                    to={`/profile/${user.username}`}
                    className="flex items-center space-x-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0 text-white font-semibold">
                      {user.profile_image ? (
                        <img src={user.profile_image} alt={user.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-sm">{getInitials(user.username)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate hover:underline">{user.username}</p>
                      <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                    </div>
                  </Link>
                  <button 
                    onClick={() => handleFollow(user.id)}
                    disabled={followingIds.has(user.id)}
                    className="ml-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-md flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>✨</span>
                    <span>{followingIds.has(user.id) ? 'Following' : 'Follow'}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trending Topics */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xl">📈</span>
            <h3 className="font-semibold text-gray-900">Trending Topics</h3>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Coming Soon</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-700">About</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-700">Help Center</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-700">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-700">Terms</a>
          </div>
          <p className="text-xs text-gray-400 mt-2">&copy; 2025 Unisphere</p>
        </div>
      </div>
    </div>
  )
}

export default Suggestions
