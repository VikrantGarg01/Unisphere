import api from './index'

export const sendOTP = async (email) => {
  const response = await api.post('/auth/send-otp', { email })
  return response.data
}

export const verifyOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-otp', { email, otp })
  return response.data
}
