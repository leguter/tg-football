import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import api from "../../api";
import styles from "./GamePage.module.css";

const GAME_ANGLES = [
  { id: 1, name: 'Top Left', x: '25%', y: '35%' },
  { id: 2, name: 'Top Center', x: '52%', y: '32%' },
  { id: 3, name: 'Top Right', x: '77%', y: '35%' },
  { id: 4, name: 'Bottom Left', x: '25%', y: '67%' },
  { id: 5, name: 'Bottom Right', x: '77%', y: '67%' },
];

export default function GamePage({ user }) {
  const [stake, setStake] = useState(100);
  const [multiplier, setMultiplier] = useState(1.0);
  const [chosenAngle, setChosenAngle] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [isShooting, setIsShooting] = useState(false);
  const [canCashout, setCanCashout] = useState(false);

  const ballContainerRef = useRef(null);
  const hitZoneRefs = useRef({});

  useEffect(() => {
    GAME_ANGLES.forEach(a => (hitZoneRefs.current[a.id] = { current: null }));

    // 🔹 Запускаємо гру при старті
    const startGame = async () => {
      try {
        const res = await api.post("/api/game/start", { stake });
        setMultiplier(res.data.multiplier);
      } catch (err) {
        console.error("Start game error:", err.response?.data || err.message);
      }
    };
    startGame();
  }, []);

  const handleShoot = async (angleId) => {
    if (isShooting) return;
    setIsShooting(true);
    setChosenAngle(angleId);

    try {
      const res = await api.post("/api/game/shoot", { angleId });
      setLastResult(res.data);
      setMultiplier(res.data.multiplier);
      setCanCashout(res.data.isGoal);
    } catch (err) {
      console.error("Shoot error:", err.response?.data || err.message);
    } finally {
      setTimeout(() => setIsShooting(false), 1000);
    }
  };

  const handleCashout = async () => {
    try {
      const res = await api.post("/api/game/cashout");
      alert(`⭐ Ви забрали ${res.data.winnings} зірок!`);
      setCanCashout(false);
      setMultiplier(1.0);
      setChosenAngle(null);
      setLastResult(null);
    } catch (err) {
      console.error("Cashout error:", err.response?.data || err.message);
    }
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.infoBar}>
        <p>👤 {user.first_name}</p>
        <p>Множник: <span className={styles.multiplier}>{multiplier.toFixed(2)}x</span></p>
        <p>Ставка: ⭐ {stake}</p>
      </div>

      <div className={styles.field}>
        <div className={styles.goalFrame}>
          {GAME_ANGLES.map((angle) => (
            <button
              key={angle.id}
              ref={hitZoneRefs.current[angle.id]}
              className={`${styles.hitZone} ${chosenAngle === angle.id ? styles.chosenZone : ""}`}
              style={{ left: angle.x, top: angle.y }}
              onClick={() => handleShoot(angle.id)}
              disabled={isShooting}
            >
              {lastResult?.keeperAngleId === angle.id && <span>✋</span>}
              {chosenAngle === angle.id && lastResult?.isGoal && <span>⚽</span>}
              {chosenAngle === angle.id && lastResult && !lastResult.isGoal && <span>❌</span>}
            </button>
          ))}
        </div>

        <div className={styles.ballContainer} ref={ballContainerRef}>
          <motion.img
            src="/images/ball1.png"
            className={styles.ballImage}
            animate={isShooting ? { y: -50, rotate: 360 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      <div className={styles.controls}>
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(Number(e.target.value))}
          disabled={multiplier !== 1.0 || isShooting}
        />
        {canCashout ? (
          <button onClick={handleCashout}>Забрати ⭐ {(stake * multiplier).toFixed(0)}</button>
        ) : (
          <button onClick={() => handleShoot(chosenAngle)} disabled={!chosenAngle || isShooting}>
            Ударити
          </button>
        )}
      </div>

      {lastResult && !isShooting && (
        <p className={lastResult.isGoal ? styles.successMessage : styles.failMessage}>
          {lastResult.isGoal ? "ГОООЛ! 🎯" : "Промах 😢"}
        </p>
      )}
    </div>
  );
}
