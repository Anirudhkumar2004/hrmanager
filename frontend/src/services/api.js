import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://hrmanager-hepg.onrender.com/api',
})

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('hrgenius_access')
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('hrgenius_refresh')

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'https://hrmanager-hepg.onrender.com'}/auth/refresh/`,
            { refresh: refreshToken },
          )
          localStorage.setItem('hrgenius_access', response.data.access)
          if (response.data.refresh) {
            localStorage.setItem('hrgenius_refresh', response.data.refresh)
      
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('hrgenius_access')
          localStorage.removeItem('hrgenius_refresh')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api
