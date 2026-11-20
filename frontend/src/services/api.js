
import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Attach access token to requests
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('hrgenius_access')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

// Refresh expired access token
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('hrgenius_refresh')

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh/`,
            { refresh: refreshToken }
          )

          const newAccessToken = response.data.access

          localStorage.setItem('hrgenius_access', newAccessToken)

          if (response.data.refresh) {
            localStorage.setItem(
              'hrgenius_refresh',
              response.data.refresh
            )
          }

          originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`

          return api(originalRequest)

        } catch (refreshError) {
          localStorage.removeItem('hrgenius_access')
          localStorage.removeItem('hrgenius_refresh')

          window.location.href = '/login'

          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api
