import { useEffect, useState } from "react";
import GamePage from "./pages/GamePage/GamePage";
import api from "./api"; // axios інстанс, який ми налаштували

export default function App() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const init = async () => {
      // 1️⃣ Перевірка Telegram WebApp
      if (!window.Telegram || !window.Telegram.WebApp) {
        console.warn("⚠️ Telegram WebApp не знайдено. Відкрий додаток через Telegram.");
        setUserData({ error: true });
        return;
      }

      const tg = window.Telegram.WebApp;
      console.log("window.Telegram =", window.Telegram);
console.log("window.Telegram?.WebApp =", window.Telegram?.WebApp);

      tg.ready();

      // 2️⃣ Очікування initData від Telegram
      let attempts = 0;
      while (!tg.initData && attempts < 10) {
        await new Promise(res => setTimeout(res, 300));
        attempts++;
      }

      if (!tg.initData) {
        console.error("❌ Не отримано initData від Telegram");
        setUserData({ error: true });
        return;
      }

      try {
        // 3️⃣ Надсилаємо initData на бекенд для авторизації
        const res = await api.post("/api/auth", { initData: tg.initData });

        // 4️⃣ Зберігаємо userId як токен
        localStorage.setItem("authToken", res.data.id);
        setUserData(res.data);

        // 5️⃣ Якщо є реферал у URL
        const params = new URLSearchParams(window.location.search);
        const referrerId = params.get("referrer_id");
        if (referrerId) {
          try {
            await api.post("/api/user/referral/register", { referrerId });
            console.log("✅ Referral registered successfully");
          } catch (err) {
            console.warn("Referral registration failed:", err.response?.data?.message);
          }
        }

      } catch (err) {
        console.error("❌ Помилка авторизації:", err.response?.data || err.message);
        setUserData({ error: true });
      }
    };

    init();
  }, []);

  // 6️⃣ UI
  if (!userData) return <div>🔄 Завантаження...</div>;
  if (userData.error) return <div>❌ Відкрийте додаток через Telegram</div>;

  // 7️⃣ Коли авторизований — відображаємо GamePage
  return <GamePage user={userData} />;
}
