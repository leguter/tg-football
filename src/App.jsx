import { useEffect, useState } from "react";
import GamePage from "./pages/GamePage/GamePage";
import api from "./api"; // Your configured axios instance
// import { Route, Router, Routes } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage/HomePage';
// import GamePage from './pages/GamePage/GamePage';
import ProfilePage from './pages/ProfilePage/ProfilePage';


export default function App() {
const [userData, setUserData] = useState(null);
const [authError, setAuthError] = useState(false);

useEffect(() => {
  const tg = window.Telegram?.WebApp;

  if (!tg) {
    setAuthError(true);
    return;
  }

  tg.ready();

  let cancelled = false;

  const waitForInitData = async () => {
    let attempts = 0;

    while (!tg.initData && attempts < 20) {
      await new Promise(res => setTimeout(res, 300));
      attempts++;
    }

    if (!tg.initData || cancelled) {
      console.error("❌ initData не отримано");
      setAuthError(true);
      return;
    }

    try {
      const res = await api.post("/api/auth", {
        initData: tg.initData,
      });

      localStorage.setItem("authToken", res.data.token);
      setUserData(res.data.user);
    } catch (err) {
      console.error(
        "❌ Auth error:",
        err.response?.data?.message || err.message
      );
      setAuthError(true);
    }
  };

  waitForInitData();

  return () => {
    cancelled = true;
  };
}, []);
 // Пустий масив гарантує, що це виконається один раз
if (userData === null && !authError) {
  return <div>Загрузка...</div>;
}

if (authError) {
  return <div>Запустите приложение через Telegram для авторизации</div>;
}

// ✅ якщо дійшли сюди — користувач авторизований
  // When authorized — show GamePage
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="game" element={<GamePage user={userData} />} />
          <Route path="profile" element={<ProfilePage user={userData} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
