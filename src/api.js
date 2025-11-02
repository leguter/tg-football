import axios from 'axios';

const api = axios.create({
  baseURL: 'https://football-back-4jkg.onrender.com',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['X-Telegram-User'] = token; // 👈 зручно замість JWT
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
