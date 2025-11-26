// src/pages/HomePage/HomePage.jsx
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className={styles.homeContainer}>
           <h1>Добро пожаловать в Football Stars! ⭐</h1>
      <p>Проверь свою удачу! Угадай угол, куда полетит мяч, чтобы обыграть вратаря и увеличить свой выигрыш!</p>
      <div className={styles.infoBlock}>
        <h2>Правила игры</h2>
        <ul>
          <li>Ставишь звезды и выбираешь угол.</li>
          <li>Вратарь случайно выбирает угол.</li>
          <li>Если забиваешь — получаешь множитель и можешь продолжить или забрать выигрыш.</li>
          <li>Каждый следующий удар сложнее!</li>
        </ul>
      </div>
      <button className={styles.startButton} onClick={() => navigate('/game')}>
       Начать игру
      </button>
    </div>
  );
}