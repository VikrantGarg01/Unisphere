import { useState, useRef } from 'react'
import { createPost } from '../api/posts'
import { useAuth } from '../context/AuthContext'

const CreatePost = ({ onPostCreated }) => {
  const [caption, setCaption] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)
  const { user } = useAuth()

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImageToCloudinary = async (file) => {
    // Compress and convert image to base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Resize if too large (max 1200px width/height)
          const maxSize = 1200
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize
              width = maxSize
            } else {
              width = (width / height) * maxSize
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to JPEG with quality 0.8 (80%)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
          resolve(compressedDataUrl)
        }
        img.onerror = reject
        img.src = e.target.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!caption.trim() && !imageFile && !imageUrl) {
      alert('Please add some text or an image')
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      let finalImageUrl = imageUrl

      // Upload image if file is selected
      if (imageFile) {
        setUploadProgress(30)
        finalImageUrl = await uploadImageToCloudinary(imageFile)
        setUploadProgress(60)
      }

      setUploadProgress(80)
      const result = await createPost({ caption: caption.trim() || null, image_url: finalImageUrl || null })
      
      setUploadProgress(100)
      
      // Reset form
      setCaption('')
      setImageUrl('')
      setImageFile(null)
      setImagePreview(null)
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Small delay to show completion
      setTimeout(() => {
        setUploadProgress(0)
        if (onPostCreated) onPostCreated()
      }, 500)
    } catch (error) {
      console.error('Error creating post:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create post'
      alert(`Failed to create post: ${errorMsg}`)
      setUploadProgress(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <img 
            src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.username}&background=3b82f6&color=fff&size=48`}
            alt={user?.username}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full border-none resize-none focus:outline-none text-gray-700 placeholder-gray-400"
              rows="2"
            />
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3 relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-64 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 text-white rounded-full p-1.5 hover:bg-opacity-90"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Upload Progress */}
            {isSubmitting && uploadProgress > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Photo</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting || (!caption.trim() && !imageFile && !imageUrl)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePost
