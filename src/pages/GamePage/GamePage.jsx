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
  const tgData = window.Telegram?.WebApp?.initData;
  if (tgData && tgData.trim() !== "") return tgData;

  if (user?.user?.telegram_id) {
    return (
      "?user=" +
      encodeURIComponent(JSON.stringify({ id: user.user.telegram_id }))
    );
  }
  return "";
}

function Ball({ isShooting, chosenAngle, hitZoneRefs, ballContainerRef, onFinish, lastResult }) {
  if (!isShooting || !chosenAngle) return null;

  const targetRef = hitZoneRefs.current[chosenAngle];
  const ballRect = ballContainerRef.current?.getBoundingClientRect();
  const targetRect = targetRef?.getBoundingClientRect();

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
      onAnimationComplete={() => {
        if (!lastResult?.isGoal) {
          ballContainerRef.current?.animate(
            [
              { transform: "translateY(0px)" },
              { transform: "translateY(-25px)" },
              { transform: "translateY(0px)" },
            ],
            { duration: 400 }
          );
        }
        onFinish();
      }}
    >
      <img src="/images/ball1.png" alt="Мяч" className={styles.ballImage} />
    </motion.div>
  );
}

export default function GamePage({ user, setUser }) {
  const [stake, setStake] = useState(100);
  const [multiplier, setMultiplier] = useState(1.0);
  const [pendingResult, setPendingResult] = useState(null);
  const [endingResult, setEndingResult] = useState(null);
  const [chosenAngle, setChosenAngle] = useState(null);
  const [isShooting, setIsShooting] = useState(false);
  const [controlsBlocked, setControlsBlocked] = useState(false);

  const ballContainerRef = useRef(null);
  const hitZoneRefs = useRef({});

  const handleShoot = async (angleId) => {
    if (!angleId || controlsBlocked) return;

    setChosenAngle(angleId);
    setIsShooting(true);
    setControlsBlocked(true);
    setEndingResult(null);

    const initData = getInitData(user);

    try {
      if (multiplier === 1.0 && !pendingResult) {
        const startRes = await api.post("/api/game/start", { initData, stake });
        setUser((prev) => ({
          ...prev,
          user: { ...prev.user, balance: startRes.data.balance },
        }));
      }

      const res = await api.post("/api/game/shoot", { initData, angleId });
      setPendingResult(res.data);
      setMultiplier(res.data.multiplier);
    } catch (err) {
      alert(err.response?.data?.message || "Помилка удару");
      reset();
    }
  };

  const finishAnimation = () => {
    if (!pendingResult) return reset();

    setEndingResult(pendingResult);
    setIsShooting(false);

    if (!pendingResult.isGoal) {
      setMultiplier(1.0);
      setPendingResult(null);
    }

    setControlsBlocked(false);
  };

  const cashout = async () => {
    const initData = getInitData(user);

    try {
      const res = await api.post("/api/game/cashout", { initData });
      alert(`⭐ Ви забрали ${res.data.winnings}`);

      setUser((prev) => ({
        ...prev,
        user: { ...prev.user, balance: res.data.balance },
      }));

      reset();
    } catch (err) {
      alert("Помилка кешауту");
    }
  };

  const reset = () => {
    setIsShooting(false);
    setControlsBlocked(false);
    setChosenAngle(null);
    setPendingResult(null);
    setEndingResult(null);
    setMultiplier(1.0);
  };

  const randomShoot = () =>
    handleShoot(GAME_ANGLES[Math.floor(Math.random() * GAME_ANGLES.length)].id);

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
            {GAME_ANGLES.map(({ id, x, y }) => (
              <button
                key={id}
                ref={(el) => (hitZoneRefs.current[id] = el)}
                className={`${styles.hitZone} ${chosenAngle === id ? styles.chosenZone : ""}`}
                style={{ left: x, top: y }}
                onClick={() => setChosenAngle(id)}
                disabled={controlsBlocked}
              >
                {endingResult?.keeperAngleId === id && <span className={styles.saveMark}>✋</span>}
                {endingResult?.chosenAngleId === id &&
                  (endingResult?.isGoal ? (
                    <span className={styles.goalMark}>⚽</span>
                  ) : (
                    <span className={styles.missMark}>❌</span>
                  ))}
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
            lastResult={pendingResult}
            onFinish={finishAnimation}
          />
        </div>
      </div>

      <div className={styles.controls}>
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(Math.max(1, +e.target.value))}
          className={styles.stakeInput}
          disabled={controlsBlocked || multiplier !== 1.0}
        />

        <button onClick={randomShoot} disabled={controlsBlocked}>Випадково</button>

        {pendingResult ? (
          <>
            <button onClick={() => handleShoot(chosenAngle)} disabled={controlsBlocked}>
              Наступний удар
            </button>
            <button onClick={cashout} disabled={controlsBlocked}>
              Забрати ⭐ {Math.floor(stake * multiplier)}
            </button>
          </>
        ) : (
          <button
            onClick={() => handleShoot(chosenAngle)}
            disabled={!chosenAngle || controlsBlocked}
          >
            Ударити
          </button>
        )}
      </div>

      {endingResult && !isShooting && (
        <p className={endingResult.isGoal ? styles.successMessage : styles.failMessage}>
          {endingResult.isGoal ? "ГОЛ! 🎯" : "ПРОМАХ 😢"}
        </p>
      )}
    </div>
  );
}
