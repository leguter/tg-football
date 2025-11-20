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
  return (
    window.Telegram?.WebApp?.initData?.trim() ||
    (user?.user?.telegram_id
      ? "?user=" +
        encodeURIComponent(JSON.stringify({ id: user.user.telegram_id }))
      : "")
  );
}

const Ball = ({ chosenAngle, isShooting, hitZoneRefs, ballContainerRef, lastResult }) => {
  if (!chosenAngle || !isShooting) return null;

  const targetRef = hitZoneRefs.current[chosenAngle];
  if (!targetRef?.current || !ballContainerRef?.current) return null;

  const targetRect = targetRef.current.getBoundingClientRect();
  const ballRect = ballContainerRef.current.getBoundingClientRect();

  const dx =
    targetRect.left +
    targetRect.width / 2 -
    ballRect.left -
    ballRect.width / 2;
  const dy =
    targetRect.top +
    targetRect.height / 2 -
    ballRect.top -
    ballRect.height / 2;

  const isGoal = lastResult?.isGoal;

  return (
    <motion.div
      className={styles.ball}
      initial={{ x: 0, y: 0, scale: 1 }}
      animate={{
        x: dx,
        y: dy,
        rotate: 360,
        transition: { duration: 0.8 },
      }}
      onAnimationComplete={() => {
        if (!isGoal) {
          ballContainerRef.current?.animate(
            [
              { transform: "translateY(0)" },
              { transform: "translateY(-25px)" },
              { transform: "translateY(0)" },
            ],
            { duration: 400 }
          );
        }
      }}
    >
      <img src="/images/ball1.png" alt="ball" className={styles.ballImage} />
    </motion.div>
  );
};

export default function GamePage({ user, setUser }) {
  const [stake, setStake] = useState(100);
  const [multiplier, setMultiplier] = useState(1.0);
  const [chosenAngle, setChosenAngle] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [isShooting, setIsShooting] = useState(false);
  const [canCashout, setCanCashout] = useState(false);

  const ballContainerRef = useRef(null);
  const hitZoneRefs = useRef({});

  const request = async (url, data, cb) => {
    try {
      const res = await api.post(url, data);
      cb?.(res.data);
      return true;
    } catch (err) {
      alert(err.response?.data?.message || "Сталася помилка");
      return false;
    }
  };

  const handleShoot = async (angleId) => {
    if (!angleId || isShooting) return;
    setIsShooting(true);
    setChosenAngle(angleId);

    const initData = getInitData(user);

    // Старт гри зі списанням ставки
    if (multiplier === 1.0 && !canCashout) {
      const ok = await request("/api/game/start", { initData, stake }, (data) =>
        setUser((prev) => ({
          ...prev,
          user: { ...prev.user, balance: data.balance },
        }))
      );

      if (!ok) return setIsShooting(false);
    }

    // Удар
    await request("/api/game/shoot", { initData, angleId }, (data) => {
      setLastResult(data);
      setMultiplier(data.multiplier);
      setCanCashout(data.isGoal);
    });

    setTimeout(() => setIsShooting(false), 800);
  };

  const handleCashout = async () => {
    const initData = getInitData(user);

    await request("/api/game/cashout", { initData }, (data) => {
      alert(`⭐ Ви забрали ${data.winnings} зірок!`);
      setUser((prev) => ({
        ...prev,
        user: { ...prev.user, balance: data.balance },
      }));
      setMultiplier(1.0);
      setCanCashout(false);
      setChosenAngle(null);
      setLastResult(null);
    });
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
                ref={(el) => (hitZoneRefs.current[angle.id] = { current: el })}
                className={`${styles.hitZone} ${
                  chosenAngle === angle.id ? styles.chosenZone : ""
                }`}
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
                {chosenAngle === angle.id && lastResult && !lastResult.isGoal && (
                  <span className={styles.missMark}>❌</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.ballContainer} ref={ballContainerRef}>
          <Ball
            chosenAngle={chosenAngle}
            isShooting={isShooting}
            hitZoneRefs={hitZoneRefs.current}
            ballContainerRef={ballContainerRef}
            lastResult={lastResult}
          />
        </div>
      </div>

      <div className={styles.controls}>
        <input
          type="number"
          value={stake}
          min="1"
          onChange={(e) => {
            const val = Number(e.target.value);
            if (!isNaN(val)) setStake(Math.max(1, val));
          }}
          className={styles.stakeInput}
          disabled={isShooting || multiplier !== 1.0}
        />

        {canCashout ? (
          <button
            onClick={handleCashout}
            className={styles.cashoutButton}
          >
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

      {lastResult && !isShooting && (
        <p className={lastResult.isGoal ? styles.successMessage : styles.failMessage}>
          {lastResult.isGoal ? "ГОЛ! 🎯" : "ПРОМАХ 😢"}
        </p>
      )}
    </div>
  );
}
