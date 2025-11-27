import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import ballIcon from "../../../public/images/ball.jpg"; // добавь иконку мяча
import starIcon from "../../assets/star_big.png";

export default function HomePage({ user }) {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <img src={ballIcon} alt="ball" className={styles.ball} />
        <h1 className={styles.title}>
          Football <span>Stars!</span>
        </h1>
        <p className={styles.subtitle}>
          Покажи свою точность ⚽ Забей пенальти — забери звезды ⭐
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
          <li>⚽ Выбирай направление удара</li>
          <li>🥅 Вратарь угадывает случайно</li>
          <li>💎 Каждый гол умножает выигрыш</li>
          <li>🔥 Риск или выводишь звезды!</li>
        </ul>
      </div>

      <button className={styles.startButton} onClick={() => navigate("/game")}>
        Начать игру
      </button>
    </div>
  );
}
