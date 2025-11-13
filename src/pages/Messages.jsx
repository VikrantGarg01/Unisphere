import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getConversations, getMessages, sendMessage, startConversation } from '../api/messages'
import { getFollowers, getFollowing } from '../api/follow'
import { formatDistanceToNow } from 'date-fns'
import Sidebar from '../components/Sidebar'
import Suggestions from '../components/Suggestions'
import { useAuth } from '../context/AuthContext'

const Messages = () => {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [connections, setConnections] = useState([])
  const [loadingConnections, setLoadingConnections] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (conversationId) {
      loadMessages()
      // Poll for new messages every 3 seconds
      const interval = setInterval(loadMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [conversationId])

  const loadConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const data = await getMessages(conversationId)
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      await sendMessage(conversationId, newMessage)
      setNewMessage('')
      loadMessages()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const loadConnections = async () => {
    if (!user) return
    
    setLoadingConnections(true)
    try {
      const [followersData, followingData] = await Promise.all([
        getFollowers(user.id),
        getFollowing(user.id)
      ])
      
      // Combine and deduplicate followers and following
      const allConnections = [...followersData, ...followingData]
      const uniqueConnections = allConnections.reduce((acc, current) => {
        const exists = acc.find(item => item.id === current.id)
        if (!exists) {
          acc.push(current)
        }
        return acc
      }, [])
      
      setConnections(uniqueConnections)
    } catch (error) {
      console.error('Error loading connections:', error)
    } finally {
      setLoadingConnections(false)
    }
  }

  const handleStartConversation = async (userId) => {
    try {
      const { conversationId } = await startConversation(userId)
      setShowNewMessageModal(false)
      navigate(`/messages/${conversationId}`)
      // Reload conversations to show the new one
      loadConversations()
    } catch (error) {
      console.error('Error starting conversation:', error)
    }
  }

  const filteredConnections = connections.filter(conn =>
    conn.username && conn.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <div className="max-w-6xl mx-auto py-6 px-4">
          <div className="bg-white rounded-lg shadow h-[calc(100vh-8rem)] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold">Messages</h2>
          <button
            onClick={() => {
              setShowNewMessageModal(true)
              loadConnections()
            }}
            className="p-2 text-primary hover:bg-blue-50 rounded-full transition-colors"
            title="New Message"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        <div className="divide-y divide-gray-200">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => navigate(`/messages/${conv.id}`)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  conversationId == conv.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={conv.otherUser.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherUser.username)}&background=4F46E5&color=fff&size=48`}
                    alt={conv.otherUser.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{conv.otherUser.username}</p>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {conversationId ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.isSent
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Send Message */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-primary text-white rounded-full font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
        </div>
      </div>

      {/* Right Sidebar - Suggestions */}
      <Suggestions />

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold">New Message</h3>
              <button
                onClick={() => {
                  setShowNewMessageModal(false)
                  setSearchQuery('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search connections..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loadingConnections ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredConnections.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {searchQuery ? 'No connections found' : 'No followers or following yet'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredConnections.map((connection) => (
                    <div
                      key={connection.id}
                      onClick={() => handleStartConversation(connection.id)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={connection.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(connection.username)}&background=4F46E5&color=fff&size=48`}
                          alt={connection.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{connection.username}</p>
                          {connection.bio && (
                            <p className="text-sm text-gray-500 truncate">{connection.bio}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages
