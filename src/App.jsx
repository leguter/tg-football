import { useEffect, useState } from "react";
import GamePage from "./pages/GamePage/GamePage";
import api from "./api"; // Your configured axios instance

export default function App() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    const waitForInitData = async () => {
      let attempts = 0;
      while (!tg.initData && attempts < 10) {
        await new Promise(res => setTimeout(res, 300));
        attempts++;
      }

      if (!tg.initData) {
        console.error("❌ initData not found even after waiting");
        setUserData({ error: true });
        return;
      }

      try {
        // 1. Get the referrer_id from the URL
        // (e.g., https://...app?referrer_id=12345)
        const params = new URLSearchParams(window.location.search);
        const referrerId = params.get('referrer_id');
        
        // console.log(`Referrer ID from URL: ${referrerId || 'NONE'}`);

        // 2. AUTHENTICATION
        // Send initData AND the referrerId to the backend in one request
        const res = await api.post(
          "/api/auth",
          { 
            initData: tg.initData,
            referrerId: referrerId // Pass the ID to the backend
          }
        );
        
        // console.log("✅ Received userData:", res.data);
        localStorage.setItem("authToken", res.data.token);
        
        // 3. SET DATA
        // No second API call needed, backend handled the referral!
        setUserData(res.data);

      } catch (err) {
        const errorMessage = err.response ? err.response.data.message : "Authentication error";
        console.error("❌ Error during authorization:", errorMessage);
        setUserData({ error: true });
      }
    };

    waitForInitData();
  }, []); // Empty array ensures this runs once

  if (userData === null) {
    return <div>Завантаження...</div>; // Or your loader component
  }

  if (userData?.error) {
    return <div>Запустіть додаток через Telegram для авторизації</div>;
  }

  // When authorized — show GamePage
  return <GamePage user={userData} />;
}
