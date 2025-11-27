import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";

export default function HomePage({ user }) {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>
          Football <span>Stars! ⭐</span>
        </h1>
        <p className={styles.subtitle}>
          Перевір свою точність ⚽ Забий пенальті — забери зірки!
        </p>
      </div>

      {user?.user?.balance !== undefined && (
        <div className={styles.balanceCard}>
          ⭐ Баланс: <span>{user.user.balance}</span>
        </div>
      )}

      <div className={styles.rulesCard}>
        <h2>📌 Як грати?</h2>
        <ul>
          <li>⚽ Обираєш напрям удару</li>
          <li>🥅 Воротар вибирає кут випадково</li>
          <li>💎 За гол множник росте</li>
          <li>🔥 Ризикуй або забирай виграш</li>
        </ul>
      </div>

      <button className={styles.startButton} onClick={() => navigate("/game")}>
        Почати гру
      </button>
    </div>
  );
}
