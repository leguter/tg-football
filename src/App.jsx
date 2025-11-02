import { useEffect, useState } from "react";
import api from "./api"; // твій axios

export default function App() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const init = async () => {
      // ✅ Перевіряємо, чи ми всередині Telegram
      if (!window.Telegram || !window.Telegram.WebApp) {
        console.warn("⚠️ Telegram WebApp API недоступне. Мабуть, ти відкрив сторінку не через Telegram.");
        setUserData({ error: true });
        return;
      }

      const tg = window.Telegram.WebApp;
      tg.ready();

      // Чекаємо initData
      let attempts = 0;
      while (!tg.initData && attempts < 10) {
        await new Promise(res => setTimeout(res, 300));
        attempts++;
      }

      if (!tg.initData) {
        console.error("❌ Не знайдено initData навіть після очікування");
        setUserData({ error: true });
        return;
      }

      try {
        // Надсилаємо initData на бекенд
        const res = await api.post('/api/auth', { initData: tg.initData });
        localStorage.setItem("authToken", res.data.id); // 👈 зберігаємо user.id замість JWT
        setUserData(res.data);
      } catch (err) {
        console.error("❌ Помилка при авторизації:", err);
        setUserData({ error: true });
      }
    };

    init();
  }, []);

  if (!userData) return <div>🔄 Завантаження...</div>;
  if (userData.error) return <div>❌ Telegram WebApp не знайдено</div>;

  return (
    <div>
      <h2>👋 Привіт, {userData.first_name}!</h2>
    </div>
  );
}
