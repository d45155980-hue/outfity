import axios from 'axios';
import { API_BASE_URL } from './constants';

const TOKEN_KEY = 'outfity_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (response.data?.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
    }
    return response;
  },
  async (error) => {
    if (error.response?.data?.token) {
      localStorage.setItem(TOKEN_KEY, error.response.data.token);
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token || token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && !window.location.pathname.startsWith('/forgot-password') && !window.location.pathname.startsWith('/reset-password')) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      } else {
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && !window.location.pathname.startsWith('/forgot-password') && !window.location.pathname.startsWith('/reset-password')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const clearAuthToken = () => localStorage.removeItem(TOKEN_KEY);
export default api;
