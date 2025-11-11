import api from './index'

export const getConversations = async () => {
  const response = await api.get('/messages/conversations')
  return response.data
}

export const startConversation = async (userId) => {
  const response = await api.post('/messages/start', { userId })
  return response.data
}

export const getMessages = async (conversationId) => {
  const response = await api.get(`/messages/${conversationId}`)
  return response.data
}

export const sendMessage = async (conversationId, content, imageUrl = null) => {
  const response = await api.post(`/messages/${conversationId}/send`, {
    content,
    imageUrl
  })
  return response.data
}

export const markAsRead = async (conversationId) => {
  const response = await api.post(`/messages/${conversationId}/read`)
  return response.data
}
