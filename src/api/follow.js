import api from './index'

export const followUser = async (userId) => {
  const response = await api.post(`/follow/${userId}`)
  return response.data
}

export const getFollowers = async (userId) => {
  const response = await api.get(`/followers/${userId}`)
  return response.data
}

export const getFollowing = async (userId) => {
  const response = await api.get(`/follow/following?id=${userId}`)
  return response.data
}
