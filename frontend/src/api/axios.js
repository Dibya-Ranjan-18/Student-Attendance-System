import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (deviceId) {
        config.headers['X-Device-Id'] = deviceId;
    }
    return config;
});

export default api;
