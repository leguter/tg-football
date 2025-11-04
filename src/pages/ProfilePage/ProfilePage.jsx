import { useState } from 'react';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const [balance, setBalance] = useState(1500);
  const [history, setHistory] = useState([
    { id: 1, type: 'Win', amount: 350, date: '2025-10-30', multiplier: 'x1.4' },
    { id: 2, type: 'Loss', amount: 100, date: '2025-10-30', multiplier: 'x1.0' },
  ]);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(100);

  const starOptions = [100, 250, 500, 1000];

  const handleDeposit = () => {
    setBalance(prev => prev + selectedAmount);
    setShowDepositModal(false);
    setHistory(prev => [
      { id: Date.now(), type: 'Deposit', amount: selectedAmount, date: new Date().toISOString().slice(0, 10), multiplier: '-' },
      ...prev,
    ]);
  };

  const handleWithdraw = () => {
    if (balance < selectedAmount) {
      alert('Недостатньо зірок для виводу!');
      return;
    }
    setBalance(prev => prev - selectedAmount);
    setShowWithdrawModal(false);
    setHistory(prev => [
      { id: Date.now(), type: 'Withdraw', amount: selectedAmount, date: new Date().toISOString().slice(0, 10), multiplier: '-' },
      ...prev,
    ]);
  };

  return (
    <div className={styles.profileContainer}>
      <h1>👤 Ваш Профіль</h1>

      <div className={styles.balanceCard}>
        <h2>Баланс:</h2>
        <p className={styles.balanceAmount}>⭐ {balance}</p>

        <div className={styles.actions}>
          <button onClick={() => setShowDepositModal(true)} className={styles.depositBtn}>Депозит</button>
          <button onClick={() => setShowWithdrawModal(true)} className={styles.withdrawBtn}>Вивід</button>
        </div>
      </div>

      <h2 className={styles.historyTitle}>Історія ігор</h2>
      <ul className={styles.historyList}>
        {history.map(item => (
          <li
            key={item.id}
            className={
              item.type === 'Win'
                ? styles.winItem
                : item.type === 'Loss'
                ? styles.lossItem
                : item.type === 'Deposit'
                ? styles.depositItem
                : styles.withdrawItem
            }
          >
            <span className={styles.type}>
              {item.type === 'Win'
                ? '✅ ВИГРАШ'
                : item.type === 'Loss'
                ? '❌ ПРОГРАШ'
                : item.type === 'Deposit'
                ? '💰 ДЕПОЗИТ'
                : '💸 ВИВІД'}
            </span>
            <span className={styles.details}>
              {item.type === 'Win'
                ? `+${item.amount} (${item.multiplier})`
                : item.type === 'Loss'
                ? `-${item.amount}`
                : item.type === 'Deposit'
                ? `+${item.amount}`
                : `-${item.amount}`} зірок
            </span>
            <span className={styles.date}>{item.date}</span>
          </li>
        ))}
      </ul>

      <p className={styles.note}>
        Примітка: Логіка автентифікації користувача Telegram повинна бути реалізована в App.jsx.
      </p>

      {/* --- Deposit Modal --- */}
      {showDepositModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>💰 Оберіть суму для депозиту</h3>
            <div className={styles.starOptions}>
              {starOptions.map(amount => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`${styles.starOption} ${selectedAmount === amount ? styles.active : ''}`}
                >
                  ⭐ {amount}
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleDeposit} className={styles.confirmBtn}>Підтвердити</button>
              <button onClick={() => setShowDepositModal(false)} className={styles.cancelBtn}>Скасувати</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Withdraw Modal --- */}
      {showWithdrawModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>💸 Оберіть суму для виводу</h3>
            <div className={styles.starOptions}>
              {starOptions.map(amount => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`${styles.starOption} ${selectedAmount === amount ? styles.active : ''}`}
                >
                  ⭐ {amount}
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleWithdraw} className={styles.confirmBtn}>Підтвердити</button>
              <button onClick={() => setShowWithdrawModal(false)} className={styles.cancelBtn}>Скасувати</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
