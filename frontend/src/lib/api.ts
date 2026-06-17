import axios from 'axios'

export const api = axios.create({
    baseURL: '/api/v1',
    timeout: 30000,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('momentum_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('momentum_token')
            localStorage.removeItem('momentum_role')
            localStorage.removeItem('momentum_username')
            window.dispatchEvent(new Event('momentum-auth'))
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)
