// src/pages/HomePage/HomePage.jsx
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className={styles.homeContainer}>
      <h1>Ласкаво просимо до Football Stars! ⭐</h1>
      <p>Перевір свою удачу! Вгадай кут, куди полетить м'яч, щоб обіграти воротаря і збільшити свій виграш!</p>
      <div className={styles.infoBlock}>
        <h2>Правила гри</h2>
        <ul>
          <li>Ставиш зірки та обираєш кут.</li>
          <li>Воротар випадково обирає кут.</li>
          <li>Якщо забиваєш — отримуєш множник і можеш продовжити або забрати виграш.</li>
          <li>Кожен наступний удар складніший!</li>
        </ul>
      </div>
      <button className={styles.startButton} onClick={() => navigate('/game')}>
        Почати гру
      </button>
    </div>
  );
}