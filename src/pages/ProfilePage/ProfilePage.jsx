// src/pages/ProfilePage/ProfilePage.jsx
import { useState } from 'react';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const [balance, setBalance] = useState(1500);
  const [history, setHistory] = useState([
    { id: 1, type: 'Win', amount: 350, date: '2025-10-30', multiplier: 'x1.4' },
    { id: 2, type: 'Loss', amount: 100, date: '2025-10-30', multiplier: 'x1.0' },
  ]);

  // useEffect для завантаження балансу та історії з API (api.getBalance)
  // ...

  return (
    <div className={styles.profileContainer}>
      <h1>👤 Ваш Профіль</h1>
      <div className={styles.balanceCard}>
        <h2>Баланс:</h2>
        <p className={styles.balanceAmount}>⭐ {balance}</p>
      </div>

      <h2 className={styles.historyTitle}>Історія ігор</h2>
      <ul className={styles.historyList}>
        {history.map(item => (
          <li key={item.id} className={item.type === 'Win' ? styles.winItem : styles.lossItem}>
            <span className={styles.type}>{item.type === 'Win' ? '✅ ВИГРАШ' : '❌ ПРОГРАШ'}</span>
            <span className={styles.details}>
              {item.type === 'Win' ? `+${item.amount} (${item.multiplier})` : `-${item.amount}`} зірок
            </span>
            <span className={styles.date}>{item.date}</span>
          </li>
        ))}
      </ul>
      <p className={styles.note}>Примітка: Логіка автентифікації користувача Telegram повинна бути реалізована в App.jsx.</p>
    </div>
  );
}