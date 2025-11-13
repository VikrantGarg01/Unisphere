import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Suggestions from '../components/Suggestions'
import api from '../api'

const Connections = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('following') // 'followers' or 'following'
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    followersCount: 0,
    followingCount: 0
  })

  const fetchConnections = async () => {
    try {
      setLoading(true)
      
      // Fetch followers
      const followersResponse = await api.get(`/followers/${user.id}`)
      setFollowers(Array.isArray(followersResponse.data) ? followersResponse.data : [])
      
      // Fetch following
      const followingResponse = await api.get(`/following/${user.id}`)
      setFollowing(Array.isArray(followingResponse.data) ? followingResponse.data : [])
      
      // Fetch stats
      const statsResponse = await api.get(`/follow/stats/${user.id}`)
      setStats({
        followersCount: statsResponse.data.followersCount || 0,
        followingCount: statsResponse.data.followingCount || 0
      })
    } catch (error) {
      console.error('Error fetching connections:', error)
      setFollowers([])
      setFollowing([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchConnections()
    }
  }, [user])

  const handleFollowToggle = async (userId, currentlyFollowing) => {
    try {
      await api.post(`/follow/${userId}`)
      
      // Refresh connections
      fetchConnections()
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  const followersCount = stats.followersCount
  const followingCount = stats.followingCount

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto flex">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 border-x border-gray-200 bg-white min-h-screen">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
            <p className="text-sm text-gray-500 mt-2">Manage your followers and following</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 px-8 py-8">
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-5xl font-bold text-primary mb-2">{followersCount}</div>
              <div className="text-sm text-gray-600 font-medium">Followers</div>
            </div>
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-5xl font-bold text-green-600 mb-2">{followingCount}</div>
              <div className="text-sm text-gray-600 font-medium">Following</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-8">
            <button
              onClick={() => setActiveTab('followers')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === 'followers'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>Followers ({followersCount})</span>
              </span>
              {activeTab === 'followers' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === 'following'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Following ({followingCount})</span>
              </span>
              {activeTab === 'following' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t"></div>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {activeTab === 'followers' && (
              <>
                {followersCount === 0 ? (
                  <div className="text-center py-20 px-4">
                    <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No followers yet</h3>
                    <p className="text-gray-500">When people follow you, they'll appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {followers.map((follower) => (
                      <div key={follower.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-lg">
                              {follower.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 text-lg truncate">{follower.username}</p>
                              <p className="text-sm text-gray-500 truncate">{follower.handle}</p>
                              {follower.affiliation && (
                                <p className="text-xs text-gray-400 mt-1 flex items-center">
                                  <span>{follower.affiliation}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleFollowToggle(follower.id, follower.isFollowing)}
                            className={`ml-4 px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors flex-shrink-0 flex items-center space-x-2 ${
                              follower.isFollowing 
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                                : 'bg-primary text-white hover:bg-primary-dark'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                            </svg>
                            <span>{follower.isFollowing ? 'Following' : 'Follow Back'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'following' && (
              <>
                {followingCount === 0 ? (
                  <div className="text-center py-20 px-4">
                    <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Not following anyone yet</h3>
                    <p className="text-gray-500">Start exploring and follow people to see their posts</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {following.map((person) => (
                      <div key={person.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-gray-200 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-200">
                              <img 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(person.username)}&background=random&size=64&bold=true`}
                                alt={person.username}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-base mb-1">{person.username}</h3>
                              <p className="text-sm text-gray-500 mb-2">@{person.username}</p>
                              {person.bio && (
                                <p className="text-sm text-gray-600 line-clamp-1">{person.bio}</p>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleFollowToggle(person.id, true)}
                            className="ml-4 px-6 py-2.5 text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex-shrink-0"
                          >
                            Unfollow
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Right Sidebar - Suggestions */}
        <aside className="w-80 flex-shrink-0 bg-gray-50">
          <div className="sticky top-0 p-4">
            <Suggestions />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Connections
