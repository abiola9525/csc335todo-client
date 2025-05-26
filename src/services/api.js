import axios from "axios"

// const API_BASE_URL = "http://127.0.0.1:8000/api"
const API_BASE_URL = "https://api-csc335todo.up.railway.app/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Set content type for FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"] // Let browser set it automatically for FormData
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem("refresh_token")
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/account/login/refresh/`, {
            refresh: refreshToken,
          })

          const { access } = response.data
          localStorage.setItem("access_token", access)

          return api(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          window.location.href = "/signin"
        }
      }
    }

    return Promise.reject(error)
  },
)

// Auth API functions
export const authAPI = {
  register: (userData) => api.post("/account/register/", userData),
  login: (credentials) => api.post("/account/login/", credentials),
  refreshToken: (refreshToken) => api.post("/account/login/refresh/", { refresh: refreshToken }),
  getProfile: () => api.get("/account/"),
  updateProfile: (userData) => api.put("/account/", userData),
  changePassword: (passwordData) => api.post("/account/change-password/", passwordData),
}

// Task Status API functions
export const statusAPI = {
  getAll: () => api.get("/status/"),
  create: (statusData) => api.post("/status/", statusData),
  getById: (id) => api.get(`/status/${id}/`),
  update: (id, statusData) => api.put(`/status/${id}/`, statusData),
  delete: (id) => api.delete(`/status/${id}/`),
}

// Task Priority API functions
export const priorityAPI = {
  getAll: () => api.get("/priority/"),
  create: (priorityData) => api.post("/priority/", priorityData),
  getById: (id) => api.get(`/priority/${id}/`),
  update: (id, priorityData) => api.put(`/priority/${id}/`, priorityData),
  delete: (id) => api.delete(`/priority/${id}/`),
}

// Todos API functions
export const todosAPI = {
  getAll: () => api.get("/todos/"),
  create: (todoData) => {
    // Handle both FormData and regular objects
    if (todoData instanceof FormData) {
      return api.post("/todos/", todoData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    }
    return api.post("/todos/", todoData)
  },
  getById: (id) => api.get(`/todos/${id}/`),
  update: (id, todoData) => {
    // Handle both FormData and regular objects
    if (todoData instanceof FormData) {
      return api.put(`/todos/${id}/`, todoData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    }
    // For regular JSON updates, ensure proper content type
    return api.put(`/todos/${id}/`, todoData, {
      headers: {
        "Content-Type": "application/json",
      },
    })
  },
  delete: (id) => api.delete(`/todos/${id}/`),
}

export default api
