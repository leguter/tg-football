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
  return (
    window.Telegram?.WebApp?.initData?.trim() ||
    (user?.user?.telegram_id
      ? "?user=" +
        encodeURIComponent(JSON.stringify({ id: user.user.telegram_id }))
      : "")
  );
}

function Ball({ chosenAngle, isShooting, hitZoneRefs, ballContainerRef, lastResult }) {
  if (!isShooting || !chosenAngle) return null;

  const targetRef = hitZoneRefs.current[chosenAngle];
  const targetRect = targetRef?.getBoundingClientRect();
  const ballRect = ballContainerRef.current?.getBoundingClientRect();
  if (!targetRect || !ballRect) return null;

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
      initial={{ x: 0, y: 0 }}
      animate={{ x: dx, y: dy, rotate: 360 }}
      transition={{ duration: 0.8 }}
      onAnimationComplete={() => {
        if (!isGoal) {
          ballContainerRef.current?.animate(
            [
              { transform: "translateY(0px)" },
              { transform: "translateY(-25px)" },
              { transform: "translateY(0px)" },
            ],
            { duration: 400 }
          );
        }
      }}
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

  const sendRequest = async (url, data, cb) => {
    try {
      const res = await api.post(url, data);
      cb?.(res.data);
      return true;
    } catch (err) {
      alert(err.response?.data?.message || "Сталася помилка 🫠");
      return false;
    }
  };

  const handleShoot = async (angleId) => {
    if (!angleId || isShooting) return;

    setIsShooting(true);
    setChosenAngle(angleId);

    const initData = getInitData(user);

    if (multiplier === 1.0 && !canCashout) {
      const ok = await sendRequest("/api/game/start", { stake, initData }, (data) => {
        setUser((prev) => ({
          ...prev,
          user: { ...prev.user, balance: data.balance },
        }));
      });

      if (!ok) {
        setIsShooting(false);
        return;
      }
    }

    await sendRequest("/api/game/shoot", { angleId, initData }, (data) => {
      setLastResult(data);
      setMultiplier(data.multiplier);
      setCanCashout(data.isGoal);
    });

    setTimeout(() => setIsShooting(false), 800);
  };

  const handleCashout = async () => {
    const initData = getInitData(user);

    await sendRequest("/api/game/cashout", { initData }, (data) => {
      alert(`⭐ Забрано ${data.winnings} зірок!`);

      setUser((prev) => ({
        ...prev,
        user: { ...prev.user, balance: data.balance },
      }));

      setMultiplier(1.0);
      setChosenAngle(null);
      setLastResult(null);
      setCanCashout(false);
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
        <div className={styles.goalFrame}>
          {GAME_ANGLES.map(({ id, x, y }) => (
            <button
              key={id}
              ref={(el) => (hitZoneRefs.current[id] = el)}
              className={`${styles.hitZone} ${chosenAngle === id ? styles.chosenZone : ""}`}
              style={{ left: x, top: y }}
              onClick={() => handleShoot(id)}
              disabled={isShooting}
            />
          ))}
        </div>

        <div ref={ballContainerRef} className={styles.ballContainer}>
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
          min="1"
          value={stake}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (!isNaN(val)) setStake(Math.max(1, val));
          }}
          className={styles.stakeInput}
          disabled={isShooting || multiplier !== 1.0}
        />

        {canCashout ? (
          <button className={styles.cashoutButton} onClick={handleCashout}>
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

      {lastResult && !isShooting && (
        <p className={lastResult.isGoal ? styles.successMessage : styles.failMessage}>
          {lastResult.isGoal ? "ГОЛ! 🎯" : "ПРОМАХ 😢"}
        </p>
      )}
    </div>
  );
}
