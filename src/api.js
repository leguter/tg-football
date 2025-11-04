import axios from "axios";

const api = axios.create({
  baseURL: "https://football-back-4jkg.onrender.com",
  withCredentials: true,
});

// 🔹 Кожен запит буде мати Telegram header (для бекенду)
const tg = window.Telegram?.WebApp;
if (tg?.initDataUnsafe?.user) {
  api.defaults.headers.common["x-telegram-user"] = JSON.stringify(tg.initDataUnsafe.user);
}

// 🔹 Автоматично додаємо токен, якщо він збережений
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;