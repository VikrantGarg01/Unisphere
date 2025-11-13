import { useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePost, updatePost } from '../api/posts'
import { useAuth } from '../context/AuthContext'

const PostCard = ({ post, onUpdate }) => {
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedCaption, setEditedCaption] = useState(post.caption || '')

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post.id)
        console.log('Post deleted successfully')
        if (onUpdate) onUpdate()
      } catch (error) {
        console.error('Error deleting post:', error)
        alert('Failed to delete post. Please try again.')
      }
    }
    setShowMenu(false)
  }

  const handleEditPost = () => {
    setIsEditing(true)
    setShowMenu(false)
  }

  const handleSaveEdit = async () => {
    try {
      await updatePost(post.id, {
        caption: editedCaption,
        image_url: post.image_url
      })
      console.log('Post updated successfully')
      setIsEditing(false)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post. Please try again.')
    }
  }

  const handleCancelEdit = () => {
    setEditedCaption(post.caption || '')
    setIsEditing(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <Link 
          to={`/profile/${post.user.username}`}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <img 
            src={post.user.profile_image || `https://ui-avatars.com/api/?name=${post.user.username}&background=3b82f6&color=fff&size=48`}
            alt={post.user.username}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0 cursor-pointer"
          />
          <div>
            <p className="font-semibold text-gray-900 hover:underline">{post.user.username}</p>
          </div>
        </Link>
        {user.id === post.user.id && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={handleEditPost}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Post</span>
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Post</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Caption */}
      {post.caption && !isEditing && (
        <div className="px-4 pb-3">
          <p className="text-gray-900 whitespace-pre-wrap">{post.caption}</p>
        </div>
      )}

      {/* Edit Caption */}
      {isEditing && (
        <div className="px-4 pb-3">
          <textarea
            value={editedCaption}
            onChange={(e) => setEditedCaption(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows="3"
            placeholder="What's on your mind?"
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-1.5 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-1.5 text-sm text-white bg-primary hover:bg-primary-dark rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Post Image */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post"
          className="w-full max-h-96 object-cover"
        />
      )}
    </div>
  )
}

export default PostCard
