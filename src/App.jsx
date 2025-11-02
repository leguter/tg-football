import { useEffect, useState } from "react";
import GamePage from "./pages/GamePage/GamePage";
import api from "./api"; // Your configured axios instance
import { Route, Router, Routes } from "react-router-dom";

export default function App() {
const [userData, setUserData] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    // Функція для реєстрації реферала
    const registerReferral = async (referrerId) => {
      try {
        // Цей запит тепер буде мати правильний 'authToken'
        await api.post('/api/user/referral/register', { referrerId });
        console.log('✅ Referral registered successfully!');
      } catch (err) {
        console.warn('Referral registration failed (this is often OK):', err.response?.data?.message);
      }
    };

    const waitForInitData = async () => {
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
        // console.log("📤 Відправляємо initData:", tg.initData);

        // 1. АВТЕНТИФІКАЦІЯ
        const res = await api.post(
          "/api/auth",
          { initData: tg.initData }
        );
        
        // console.log("✅ Отримано userData:", res.data);
        localStorage.setItem("authToken", res.data.token);
        
        // 2. ❗️ РЕФАКТОРИНГ ЛОГІКИ РЕЄСТРАЦІЇ РЕФЕРАЛА ❗️
        
        // Створюємо об'єкт для роботи з параметрами URL
        const params = new URLSearchParams(window.location.search);
        
        // Дістаємо 'referrer_id' з URL (https://...app?referrer_id=12345)
        // Це той 'referrer_id', який ваш bot.py успішно додає!
        const referrerId = params.get('referrer_id'); 
  
        // console.log(`Перевірка referrer_id (з URL): ${referrerId || 'НЕ ЗНАЙДЕНО'}`);
  
        // ❗️ Ми більше не перевіряємо ненадійний 'start_param'.
        // Ми перевіряємо 'referrerId' з URL.
        if (referrerId) {
          await registerReferral(referrerId);
        }

        // 3. ВСТАНОВЛЕННЯ ДАНИХ
        setUserData(res.data);

      } catch (err) {
        const errorMessage = err.response ? err.response.data.message : "Помилка автентифікації";
        console.error("❌ Помилка під час авторизації:", errorMessage);
        setUserData({ error: true });
      }
    };

    waitForInitData();
  }, []); // Пустий масив гарантує, що це виконається один раз

  if (userData === null) {
    return <div>Завантаження...</div>; // Або ваш компонент завантажувача
  }

  if (userData?.error) {
    return <div>Запустіть додаток через Telegram для авторизації</div>;
  } // Empty array ensures this runs once

  if (userData === null) {
    return <div>Завантаження...</div>; // Or your loader component
  }

  if (userData?.error) {
    return <div>Запустіть додаток через Telegram для авторизації</div>;
  }

  // When authorized — show GamePage
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="game" element={<GamePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
