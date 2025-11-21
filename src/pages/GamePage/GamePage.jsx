import { useState, useRef } from "react";
import { motion } from "framer-motion";
import api from "../../api";
import styles from "./GamePage.module.css";

const GAME_ANGLES = [
  { id: 1, name: "Top Left", x: "25%", y: "35%" },
  { id: 2, name: "Top Center", x: "52%", y: "32%" },
  { id: 3, name: "Top Right", x: "77%", y: "35%" },
  { id: 4, name: "Bottom Left", x: "25%", y: "67%" },
  { id: 5, name: "Bottom Right", x: "77%", y: "67%" },
];

function getInitData(user) {
  const tgData = window.Telegram?.WebApp?.initData;
  if (tgData && tgData.trim() !== "") return tgData;

  if (user?.user?.telegram_id) {
    return "?user=" +
      encodeURIComponent(JSON.stringify({ id: user.user.telegram_id }));
  }

  return "";
}

function Ball({ chosenAngle, isShooting, hitZoneRefs, ballContainerRef, onFinish }) {
  if (!isShooting || !chosenAngle) return null;

  const targetRef = hitZoneRefs.current[chosenAngle];
  const targetRect = targetRef?.getBoundingClientRect();
  const ballRect = ballContainerRef.current?.getBoundingClientRect();
  if (!targetRect || !ballRect) return null;

  const dx =
    targetRect.left + targetRect.width / 2 - ballRect.left - ballRect.width / 2;
  const dy =
    targetRect.top + targetRect.height / 2 - ballRect.top - ballRect.height / 2;

  return (
    <motion.div
      className={styles.ball}
      initial={{ x: 0, y: 0 }}
      animate={{ x: dx, y: dy, rotate: 360 }}
      transition={{ duration: 0.8 }}
      onAnimationComplete={onFinish}
    >
      <img src="/images/ball1.png" alt="М'яч" className={styles.ballImage} />
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
  const [showResult, setShowResult] = useState(false);

  const ballContainerRef = useRef(null);
  const hitZoneRefs = useRef({});

  const handleShoot = async (angleId) => {
    if (!angleId || isShooting) return;

    setShowResult(false);
    setIsShooting(true);
    setChosenAngle(angleId);

    const initData = getInitData(user);

    if (multiplier === 1.0 && !canCashout) {
      try {
        const startRes = await api.post("/api/game/start", { initData, stake });
        if (startRes.data?.balance !== undefined) {
          setUser((prev) => ({
            ...prev,
            user: { ...prev.user, balance: startRes.data.balance },
          }));
        }
      } catch {
        setIsShooting(false);
        alert("Не вдалось почати гру");
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
  };

  const handleRandomShoot = () => {
    const random = GAME_ANGLES[Math.floor(Math.random() * GAME_ANGLES.length)].id;
    handleShoot(random);
  };

  const handleCashout = async () => {
    const initData = getInitData(user);
    try {
      const res = await api.post("/api/game/cashout", { initData });
      alert(`⭐ +${res.data.winnings}`);
      setUser((prev) => ({
        ...prev,
        user: { ...prev.user, balance: res.data.balance },
      }));

      setCanCashout(false);
      setMultiplier(1.0);
      setChosenAngle(null);
      setLastResult(null);
      setShowResult(false);
    } catch {
      alert("Помилка кешауту");
    }
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.infoBar}>
        <p>Множник: <span className={styles.multiplier}>{multiplier.toFixed(2)}x</span></p>
        <p>Ставка: ⭐ {stake}</p>
        <p>Баланс: ⭐ {user?.user?.balance ?? 0}</p>
      </div>

      <div className={styles.field}>
        <div className={styles.goalBackground}>
          <div className={styles.goalFrame}>
            {GAME_ANGLES.map((angle) => (
              <button
                key={angle.id}
                ref={(el) => (hitZoneRefs.current[angle.id] = el)}
                className={`${styles.hitZone} ${chosenAngle === angle.id ? styles.chosenZone : ""}`}
                style={{ left: angle.x, top: angle.y }}
                onClick={() => setChosenAngle(angle.id)}
                disabled={isShooting}
              >
                {showResult && lastResult?.keeperAngleId === angle.id && (
                  <span className={styles.saveMark}>✋</span>
                )}
                {showResult && chosenAngle === angle.id && lastResult?.isGoal && (
                  <span className={styles.goalMark}>⚽</span>
                )}
                {showResult && chosenAngle === angle.id && lastResult && !lastResult.isGoal && (
                  <span className={styles.missMark}>❌</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div ref={ballContainerRef} className={styles.ballContainer}>
          <Ball
            chosenAngle={chosenAngle}
            isShooting={isShooting}
            hitZoneRefs={hitZoneRefs}
            ballContainerRef={ballContainerRef}
            onFinish={() => {
              setIsShooting(false);
              setShowResult(true);
            }}
          />
        </div>
      </div>

      <div className={styles.controls}>
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
          className={styles.stakeInput}
          disabled={canCashout || isShooting || multiplier !== 1.0}
        />

        <button onClick={handleRandomShoot} className={styles.randomButton} disabled={isShooting}>
          Випадково
        </button>

        {canCashout ? (
          <>
            <button onClick={handleCashout} className={styles.cashoutButton}>
              Забрати ⭐ {Math.floor(stake * multiplier)}
            </button>
            <button onClick={() => handleShoot(chosenAngle)} className={styles.shootButton}>
              Наступний удар
            </button>
          </>
        ) : (
          <button onClick={() => handleShoot(chosenAngle)} className={styles.primaryButton}
            disabled={!chosenAngle || isShooting}>
            Ударити
          </button>
        )}
      </div>

      {showResult && lastResult && !isShooting && (
        <p className={lastResult.isGoal ? styles.successMessage : styles.failMessage}>
          {lastResult.isGoal ? "ГОЛ! 🎯" : "ПРОМАХ 😢"}
        </p>
      )}
    </div>
  );
}
