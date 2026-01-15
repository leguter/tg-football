import axios from "axios";

const api = axios.create({
  baseURL: "https://football-back-4jkg.onrender.com",
  withCredentials: true,
});

// 🔹 Автоматично додаємо токен авторизації до кожного запиту
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;