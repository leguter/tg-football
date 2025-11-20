import { useState, useRef } from "react";
import { motion } from "framer-motion";
import api from "../../api";
import styles from "./GamePage.module.css";

const GAME_ANGLES = [
  { id: 1, x: "25%", y: "35%" },
  { id: 2, x: "52%", y: "32%" },
  { id: 3, x: "77%", y: "35%" },
  { id: 4, x: "25%", y: "67%" },
  { id: 5, x: "77%", y: "67%" },
];

function getInitData(user) {
  return window.Telegram?.WebApp?.initData?.trim() ||
    "?user=" + encodeURIComponent(JSON.stringify({
      id: user?.user?.telegram_id
    }));
}

function Ball({ chosenAngle, isShooting, hitZoneRefs, ballContainerRef, lastResult }) {
  if (!isShooting || !chosenAngle) return null;

  const targetRect = hitZoneRefs.current[chosenAngle]?.getBoundingClientRect();
  const ballRect = ballContainerRef.current?.getBoundingClientRect();
  if (!targetRect || !ballRect) return null;

  const dx = targetRect.left + targetRect.width / 2 - ballRect.left - ballRect.width / 2;
  const dy = targetRect.top + targetRect.height / 2 - ballRect.top - ballRect.height / 2;

  return (
    <motion.div
      className={styles.ball}
      initial={{ x: 0, y: 0 }}
      animate={{ x: dx, y: dy, rotate: 360, transition: { duration: 0.8 } }}
    >
      <img src="/images/ball1.png" alt="ball" className={styles.ballImage} />
    </motion.div>
  );
}

export default function GamePage({ user, setUser }) {
  const [stake, setStake] = useState(100);
  const [multiplier, setMultiplier] = useState(1.0);
  const [chosenAngle, setChosenAngle] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [canCashout, setCanCashout] = useState(false);
  const [isShooting, setIsShooting] = useState(false);

  const hitZoneRefs = useRef({});
  const ballContainerRef = useRef(null);

  const handleShoot = async (angleId) => {
    if (!angleId || isShooting) return;
    setIsShooting(true);
    setChosenAngle(angleId);

    const initData = getInitData(user);

    if (multiplier === 1.0 && !canCashout) {
      try {
        const startRes = await api.post("/api/game/start", { initData, stake });
        setUser(prev => ({
          ...prev,
          user: { ...prev.user, balance: startRes.data.balance }
        }));
      } catch {
        alert("Не вдалось почати гру");
        setIsShooting(false);
        return;
      }
    }

    try {
      const res = await api.post("/api/game/shoot", { initData, angleId });
      setLastResult(res.data);
      setMultiplier(res.data.multiplier);
      setCanCashout(res.data.isGoal);
    } catch {
      alert("Помилка удару");
    }

    setTimeout(() => setIsShooting(false), 800);
  };

  const handleRandomShoot = () => {
    const rnd = GAME_ANGLES[Math.floor(Math.random() * GAME_ANGLES.length)].id;
    handleShoot(rnd);
  };

  const handleCashout = async () => {
    const initData = getInitData(user);
    try {
      const res = await api.post("/api/game/cashout", { initData });
      alert(`⭐ Забрав ${res.data.winnings}`);
      setUser(prev => ({
        ...prev,
        user: { ...prev.user, balance: res.data.balance }
      }));
      setMultiplier(1.0);
      setCanCashout(false);
      setChosenAngle(null);
      setLastResult(null);
    } catch {
      alert("Помилка кешауту");
    }
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.infoBar}>
        <p>Множник: <span className={styles.multiplier}>{multiplier.toFixed(2)}x</span></p>
        <p>Ставка: ⭐ {stake}</p>
      </div>

      <div className={styles.field}>
        <div className={styles.goalFrame}>
          {GAME_ANGLES.map(({ id, x, y }) => (
            <button
              key={id}
              ref={el => hitZoneRefs.current[id] = el}
              className={`${styles.hitZone} ${chosenAngle === id ? styles.chosenZone : ""}`}
              style={{ left: x, top: y }}
              onClick={() => setChosenAngle(id)}
              disabled={isShooting}
            />
          ))}
        </div>

        <div className={styles.ballContainer} ref={ballContainerRef}>
          <Ball
            chosenAngle={chosenAngle}
            isShooting={isShooting}
            hitZoneRefs={hitZoneRefs}
            ballContainerRef={ballContainerRef}
            lastResult={lastResult}
          />
        </div>
      </div>

      <div className={styles.controls}>
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(Math.max(1, +e.target.value))}
          className={styles.stakeInput}
          disabled={isShooting || multiplier !== 1.0}
        />

        <button onClick={handleRandomShoot} className={styles.randomButton} disabled={isShooting}>
          Випадково
        </button>

        {canCashout ? (
          <button onClick={handleCashout} className={styles.cashoutButton}>
            Забрати ⭐ {Math.floor(stake * multiplier)}
          </button>
        ) : (
          <button
            className={styles.primaryButton}
            onClick={() => handleShoot(chosenAngle)}
            disabled={!chosenAngle || isShooting}
          >
            Ударити
          </button>
        )}
      </div>
    </div>
  );
}
