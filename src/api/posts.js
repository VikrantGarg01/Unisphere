import api from './index'

export const getFeed = async (page = 1, limit = 20) => {
  const response = await api.get(`/posts/feed?page=${page}&limit=${limit}`)
  return response.data
}

export const getExplorePosts = async (page = 1, limit = 20) => {
  const response = await api.get(`/posts/explore?page=${page}&limit=${limit}`)
  return response.data
}

export const createPost = async (postData) => {
  const response = await api.post('/posts/create', postData)
  return response.data
}

export const updatePost = async (postId, postData) => {
  const response = await api.put(`/posts/update?id=${postId}`, postData)
  return response.data
}

export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/delete?id=${postId}`)
  return response.data
}
