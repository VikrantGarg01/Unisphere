import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Suggestions from '../components/Suggestions'
import EditProfileModal from '../components/EditProfileModal'
import PostCard from '../components/PostCard'
import api from '../api'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const { username } = useParams()
  const [activeTab, setActiveTab] = useState('posts')
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [stats, setStats] = useState({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0
  })
  const [errorMsg, setErrorMsg] = useState(null)

  // Check if viewing own profile - case insensitive comparison
  const isOwnProfile = !username || 
                       username.toLowerCase() === user?.username?.toLowerCase() ||
                       profileData?.id === user?.id

  const fetchUserPosts = async (userId) => {
    try {
      setPostsLoading(true)
      const response = await api.get(`/users/${userId}/posts`)
      setPosts(response.data)
      
      // Also refresh stats to update posts count
      const statsResponse = await api.get(`/stats/${userId}`)
      setStats({
        postsCount: statsResponse.data.postsCount,
        followersCount: statsResponse.data.followersCount,
        followingCount: statsResponse.data.followingCount
      })
    } catch (error) {
      console.error('Error fetching user posts:', error)
      setPosts([])
    } finally {
      setPostsLoading(false)
    }
  }

  const fetchProfileData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    console.log('[Profile] fetchProfileData start', { username, userId: user?.id })

    try {
      setLoading(true)
      
      // Set basic profile data first
      setProfileData({
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio || 'I am passionate, self-learner',
        university: 'Chitkara University',
        department: 'CSE',
        profile_image: user.profile_image || ''
      })

      // If viewing own profile or no username provided, use current user
      const isOwn = !username || username === user.username
      const userId = isOwn ? user.id : null
      
      if (userId) {
        try {
          // Fetch stats for the user
          console.log('[Profile] Fetching stats for userId:', userId)
          const statsResponse = await api.get(`/stats/${userId}`)
          console.log('[Profile] statsResponse', statsResponse.data)
          setStats({
            postsCount: statsResponse.data.postsCount,
            followersCount: statsResponse.data.followersCount,
            followingCount: statsResponse.data.followingCount
          })
          setIsFollowing(statsResponse.data.isFollowing)
        } catch (statsError) {
          console.error('Error fetching stats:', statsError)
          setErrorMsg('Could not load profile stats')
          // Keep default stats (0, 0, 0)
        }

        // Fetch user's posts
        await fetchUserPosts(userId)
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
      setErrorMsg('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchProfileData()
    } else {
      setLoading(false)
    }
  }, [username])

  // Fetch posts whenever profileData changes and has an id
  useEffect(() => {
    if (profileData?.id) {
      console.log('[Profile] useEffect triggered, fetching posts for id:', profileData.id)
      fetchUserPosts(profileData.id)
    }
  }, [profileData?.id])

  const handleProfileUpdate = (updatedUser) => {
    // Update local profile data - preserve the id
    setProfileData({
      id: profileData.id,
      username: updatedUser.username,
      bio: updatedUser.bio,
      profile_image: updatedUser.profile_image,
      email: updatedUser.email || profileData.email,
      university: updatedUser.university || profileData.university,
      department: updatedUser.department || profileData.department
    })

    // Update auth context user data
    updateUser(updatedUser)
    
    // Close the modal
    setIsEditModalOpen(false)
    
    // Refetch posts with the current user id
    if (profileData.id) {
      fetchUserPosts(profileData.id)
    }
  }

  const handleFollowToggle = async () => {
    if (isOwnProfile) return

    try {
      const response = await api.post(`/follow/${profileData.id}`)
      setIsFollowing(response.data.following)
      
      // Update follower count
      setStats(prev => ({
        ...prev,
        followersCount: response.data.following 
          ? prev.followersCount + 1 
          : prev.followersCount - 1
      }))
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto flex">
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>

        <main className="flex-1 border-x border-gray-200 bg-white min-h-screen">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-3 mx-8 mt-6 rounded">
              {errorMsg}
            </div>
          )}
          <div className="bg-white mb-6">
            <div className="px-8 py-6">
              <div className="flex items-start justify-between mb-6">
                {/* Profile Picture on Left */}
                <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-white shadow-xl overflow-hidden flex-shrink-0">
                  {profileData.profile_image ? (
                    <img 
                      src={profileData.profile_image}
                      alt={profileData.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.username)}&background=4F46E5&color=fff&size=128&bold=true`}
                      alt={profileData.username}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Edit Profile Button on Right */}
                {isOwnProfile ? (
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-5 py-2.5 bg-white text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center space-x-2 shadow-md border border-gray-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="text-gray-500">Not your profile</div>
                )}
              </div>

              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{profileData.username}</h1>
                <p className="text-gray-500 font-medium">{profileData.email}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  <span className="text-sm font-medium">{profileData.university}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  <span className="text-sm font-medium">{profileData.department}</span>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{profileData.bio}</p>

              <div className="flex items-center space-x-12 bg-gray-50 rounded-xl p-4 inline-flex">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.postsCount}</p>
                  <p className="text-sm text-gray-500 font-medium">Posts</p>
                </div>
                <div className="h-10 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.followersCount}</p>
                  <p className="text-sm text-gray-500 font-medium">Followers</p>
                </div>
                <div className="h-10 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.followingCount}</p>
                  <p className="text-sm text-gray-500 font-medium">Following</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex px-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-6 font-semibold text-sm transition-colors relative ${
                  activeTab === 'posts' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Posts
                {activeTab === 'posts' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-6 font-semibold text-sm transition-colors relative ${
                  activeTab === 'about' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                About
                {activeTab === 'about' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t"></div>
                )}
              </button>
            </div>
          </div>

          <div className="px-8 py-12">
            {activeTab === 'posts' && (
              <div>
                {postsLoading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-20">
                    <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                      <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                      <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-500">Posts will appear here when they're created</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} onUpdate={() => fetchUserPosts(profileData.id)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">About</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">University</p>
                    <p className="text-gray-900 font-medium">{profileData.university}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Department</p>
                    <p className="text-gray-900 font-medium">{profileData.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bio</p>
                    <p className="text-gray-900">{profileData.bio}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="w-80 flex-shrink-0 bg-gray-50">
          <div className="sticky top-0 p-4">
            <Suggestions />
          </div>
        </aside>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={profileData}
        onUpdate={handleProfileUpdate}
      />
    </div>
  )
}

export default Profile