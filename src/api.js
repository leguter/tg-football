import axios from "axios";

const api = axios.create({
  baseURL: "https://football-back-4jkg.onrender.com",
  headers: { "Content-Type": "application/json" },
});

// 🔐 додаємо Telegram initData до кожного запиту
api.interceptors.request.use((config) => {
  const tg = window.Telegram?.WebApp;
  if (tg?.initData) {
    config.data = { ...(config.data || {}), initData: tg.initData };
  }
  return config;
});

export default api;
