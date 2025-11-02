import { useEffect, useState } from "react";
import api from "./api";
import GamePage from "./pages/GamePage/GamePage";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    const init = async () => {
      try {
        // Авторизація через бекенд
        const res = await api.post("/api/auth", { initData: tg.initData });
        setUser(res.data);

        // ✅ якщо є реферал
        const params = new URLSearchParams(window.location.search);
        const referrerId = params.get("referrer_id");
        if (referrerId) {
          await api.post("/api/user/referral/register", { referrerId });
        }
      } catch (err) {
        console.error("Auth error:", err.response?.data || err.message);
      }
    };

    init();
  }, []);

  if (!user) return <p>⏳ Авторизація через Telegram...</p>;

  return <GamePage user={user} />;
}
