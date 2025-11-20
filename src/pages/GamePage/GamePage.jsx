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

function getInitData(user) {
  return window.Telegram?.WebApp?.initData ||
    "?user=" + encodeURIComponent(JSON.stringify({
      id: user?.user?.telegram_id
    }));
}

function Ball({ chosenAngle, isShooting, hitZoneRefs, ballContainerRef, lastResult }) {
  if (!isShooting || !chosenAngle) return null;

  const targetRef = hitZoneRefs.current[chosenAngle];
  const targetRect = targetRef?.getBoundingClientRect();
  const ballRect = ballContainerRef.current?.getBoundingClientRect();
  if (!targetRect || !ballRect) return null;

  const dx = targetRect.left + targetRect.width / 2 - ballRect.left - ballRect.width / 2;
  const dy = targetRect.top + targetRect.height / 2 - ballRect.top - ballRect.height / 2;

  const isGoal = lastResult?.isGoal;

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
  const [isShooting, setIsShooting] = useState(false);
  const [canCashout, setCanCashout] = useState(false);

  const ballContainerRef = useRef(null);
  const hitZoneRefs = useRef({});

  const handleShoot = async (angleId) => {
    if (!angleId || isShooting) return;

    const initData = getInitData(user);
    setIsShooting(true);
    setChosenAngle(angleId);

    // First shot -> start game & subtract stake
    if (multiplier === 1.0 && !canCashout) {
      const startRes = await api.post("/api/game/start", { initData, stake }).catch(err => {
        alert(err.response?.data?.message || "Не вдалось почати гру");
        setIsShooting(false);
      });

      if (!startRes?.data) return;

      setUser((prev) => ({
        ...prev,
        user: { ...prev.user, balance: startRes.data.balance },
      }));
    }

    try {
      const res = await api.post("/api/game/shoot", { initData, angleId });
      setLastResult(res.data);
      setMultiplier(res.data.multiplier);
      setCanCashout(res.data.isGoal);
    } catch (err) {
      alert("Помилка удару");
    }

    setTimeout(() => setIsShooting(false), 800);
  };

  const handleCashout = async () => {
    const initData = getInitData(user);

    api.post("/api/game/cashout", { initData })
      .then((res) => {
        alert(`⭐ Забрано ${res.data.winnings}`);
        setUser((prev) => ({
          ...prev,
          user: { ...prev.user, balance: res.data.balance },
        }));
        setMultiplier(1.0);
        setCanCashout(false);
        setChosenAngle(null);
        setLastResult(null);
      })
      .catch(() => alert("Помилка кешауту"));
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.infoBar}>
        <p>Множник: <span className={styles.multiplier}>{multiplier.toFixed(2)}x</span></p>
        <p>Ставка: ⭐ {stake}</p>
      </div>

      <div className={styles.field}>
        <div className={styles.goalBackground}>
          <div className={styles.goalFrame}>
            {GAME_ANGLES.map(angle => (
              <button
                key={angle.id}
                ref={(el) => hitZoneRefs.current[angle.id] = el}
                className={`${styles.hitZone} ${chosenAngle === angle.id ? styles.chosenZone : ''}`}
                style={{ left: angle.x, top: angle.y }}
                onClick={() => handleShoot(angle.id)}
                disabled={isShooting}
              >
                {lastResult?.keeperAngleId === angle.id && (
                  <span className={styles.saveMark}>✋</span>
                )}
                {chosenAngle === angle.id && lastResult?.isGoal && (
                  <span className={styles.goalMark}>⚽</span>
                )}
              </button>
            ))}
          </div>
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
          onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
          className={styles.stakeInput}
          disabled={multiplier !== 1.0 || isShooting}
        />

        {canCashout ? (
          <button onClick={handleCashout} className={styles.cashoutButton}>
            Забрати ⭐ {Math.floor(stake * multiplier)}
          </button>
        ) : (
          <button
            onClick={() => handleShoot(chosenAngle)}
            className={styles.primaryButton}
            disabled={!chosenAngle || isShooting}
          >
            Ударити
          </button>
        )}
      </div>
    </div>
  );
}
