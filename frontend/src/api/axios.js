import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
});

// ── Request interceptor — attach access token + device ID ─────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (deviceId) config.headers['X-Device-Id'] = deviceId;
    return config;
});

// ── Response interceptor — auto-refresh on 401 ────────────────────────────
let isRefreshing = false;
let failedQueue = [];   // requests waiting while we refresh

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,  // pass through successful responses
    async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh for 401 errors that haven't been retried yet
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('login/')   // never retry login itself
        ) {
            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                // No refresh token — log out
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Another refresh is already in flight — queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(
                    (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/') + 'token/refresh/',
                    { refresh: refreshToken }
                );
                const newAccessToken = response.data.access;
                localStorage.setItem('token', newAccessToken);
                api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Refresh failed — force logout
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
