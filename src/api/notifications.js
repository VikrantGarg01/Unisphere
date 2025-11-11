import api from './index'

export const getNotifications = async () => {
  const response = await api.get('/notifications')
  return response.data
}

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count')
  return response.data
}

export const markAsRead = async (notificationIds) => {
  const response = await api.post('/notifications/read', { notificationIds })
  return response.data
}
