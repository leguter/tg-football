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
          Проверь свою точность ⚽ Забей пенальти — забери звезды!
        </p>
      </div>

      {user?.user?.balance !== undefined && (
        <div className={styles.balanceCard}>
          ⭐ Баланс: <span>{user.user.balance}</span>
        </div>
      )}

      <div className={styles.rulesCard}>
        <h2>📌 Как играть?</h2>
        <ul>
          <li>⚽ Выбираешь направление удара</li>
          <li>🥅 Вратарь выбирает угол случайно</li>
          <li>💎 За гол множитель растет</li>
          <li>🔥 Рискуй или забирай выигрыш</li>
        </ul>
      </div>

      <button className={styles.startButton} onClick={() => navigate("/game")}>
        Начать игру
      </button>
    </div>
  );
}
