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
  if (tgData?.trim()) return tgData;

  if (user?.user?.telegram_id) {
    return (
      "?user=" +
      encodeURIComponent(JSON.stringify({ id: user.user.telegram_id }))
    );
  }

  return "";
}

// ⚽ Ball with post-animation logic
function Ball({
  chosenAngle,
  isShooting,
  hitZoneRefs,
  ballContainerRef,
  pendingResult,
  setPendingResult,
  setLastResult,
  setMultiplier,
  setCanCashout,
  setIsShooting,
  setGoalShake,
  setKeeperDir,
}) {
  if (!isShooting || !chosenAngle) return null;

  const targetRef = hitZoneRefs.current[chosenAngle];
  const targetRect = targetRef?.getBoundingClientRect();
  const ballRect = ballContainerRef.current?.getBoundingClientRect();
  if (!targetRect || !ballRect) return null;

  const dx = targetRect.left + targetRect.width / 2 - ballRect.left - ballRect.width / 2;
  const dy = targetRect.top + targetRect.height / 2 - ballRect.top - ballRect.height / 2;

  const speed = 0.6 + Math.random() * 0.4; // randomized speed

  return (
    <motion.div
      className={styles.ball}
      initial={{ x: 0, y: 0 }}
      animate={{
        x: dx,
        y: dy,
        rotate: 360,
        transition: { duration: speed },
      }}
      onAnimationComplete={() => {
        if (!pendingResult) return;

        const { isGoal, multiplier } = pendingResult;

        setLastResult(pendingResult);
        setMultiplier(multiplier);
        setCanCashout(isGoal);

        if (isGoal) setGoalShake(true);
        else setKeeperDir(chosenAngle);

        setTimeout(() => {
          setGoalShake(false);
          setKeeperDir(null);
        }, 800);

        setPendingResult(null);
        setIsShooting(false);
      }}
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
  const [pendingResult, setPendingResult] = useState(null);
  const [isShooting, setIsShooting] = useState(false);
  const [canCashout, setCanCashout] = useState(false);
  const [goalShake, setGoalShake] = useState(false);
  const [keeperDir, setKeeperDir] = useState(null);

  const ballContainerRef = useRef(null);
  const hitZoneRefs = useRef({});

  const handleShoot = async (angleId) => {
    if (!angleId || isShooting) return;
    setIsShooting(true);
    setChosenAngle(angleId);

    const initData = getInitData(user);

    if (multiplier === 1.0 && !canCashout) {
      try {
        const startRes = await api.post("/api/game/start", { initData, stake });
        if (typeof setUser === "function" && startRes.data?.balance !== undefined) {
          setUser((prev) => ({
            ...prev,
            user: { ...prev.user, balance: startRes.data.balance },
          }));
        }
      } catch {
        alert("Не вдалось почати гру");
        setIsShooting(false);
        return;
      }
    }

    try {
      const res = await api.post("/api/game/shoot", { initData, angleId });
      setPendingResult(res.data);
    } catch {
      alert("Помилка удару");
      setIsShooting(false);
    }
  };

  const handleRandomShoot = () => {
    const randomAngle = GAME_ANGLES[Math.floor(Math.random() * GAME_ANGLES.length)].id;
    handleShoot(randomAngle);
  };

  const handleCashout = async () => {
    const initData = getInitData(user);
    try {
      const res = await api.post("/api/game/cashout", { initData });
      alert(`⭐ Ви забрали ${res.data.winnings} зірок!`);
      if (typeof setUser === "function" && res.data?.balance !== undefined) {
        setUser((prev) => ({
          ...prev,
          user: { ...prev.user, balance: res.data.balance },
        }));
      }
      setCanCashout(false);
      setMultiplier(1.0);
      setChosenAngle(null);
      setLastResult(null);
    } catch {
      alert("Помилка кешауту");
    }
  };

  return (
    <div className={styles.gameContainer}>
      {/* Info bar */}
      <div className={styles.infoBar}>
        <p>Множник: <span className={styles.multiplier}>{multiplier.toFixed(2)}x</span></p>
        <p>Ставка: ⭐ {stake}</p>
        <p>Баланс: ⭐ {user?.user?.balance ?? 0}</p>
      </div>

      {/* Field */}
      <div className={`${styles.field} ${goalShake ? styles.shake : ""}`}>
        <div className={styles.goalBackground}>
          <div className={styles.goalFrame}>
            {GAME_ANGLES.map((angle) => (
              <button
                key={angle.id}
                ref={(el) => (hitZoneRefs.current[angle.id] = el)}
                className={`${styles.hitZone} ${
                  chosenAngle === angle.id ? styles.chosenZone : ""
                }`}
                style={{ left: angle.x, top: angle.y }}
                onClick={() => setChosenAngle(angle.id)}
                disabled={isShooting}
              />
            ))}

            {/* Goalie animation */}
            {keeperDir && (
              <motion.div
                className={styles.keeper}
                initial={{ x: 0 }}
                animate={{
                  x: keeperDir === 1 || keeperDir === 4 ? -50 :
                     keeperDir === 3 || keeperDir === 5 ? 50 : 0,
                }}
                transition={{ duration: 0.4 }}
              />
            )}
          </div>
        </div>

        <div ref={ballContainerRef} className={styles.ballContainer}>
          <Ball
            chosenAngle={chosenAngle}
            isShooting={isShooting}
            hitZoneRefs={hitZoneRefs}
            ballContainerRef={ballContainerRef}
            pendingResult={pendingResult}
            setPendingResult={setPendingResult}
            setLastResult={setLastResult}
            setMultiplier={setMultiplier}
            setCanCashout={setCanCashout}
            setIsShooting={setIsShooting}
            setGoalShake={setGoalShake}
            setKeeperDir={setKeeperDir}
          />
        </div>
      </div>

      {/* Controls */}
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
            <button className={styles.cashoutButton} onClick={handleCashout}>
              Забрати ⭐ {Math.floor(stake * multiplier)}
            </button>
            <button className={styles.shootButton} onClick={() => handleShoot(chosenAngle)}>
              Наступний удар
            </button>
          </>
        ) : (
          <button className={styles.primaryButton} onClick={() => handleShoot(chosenAngle)} disabled={!chosenAngle || isShooting}>
            Ударити
          </button>
        )}
      </div>

      {/* Result */}
      {lastResult && !isShooting && (
        <p className={lastResult.isGoal ? styles.successMessage : styles.failMessage}>
          {lastResult.isGoal ? "ГОЛ! 🎯" : "ПРОМАХ 😢"}
        </p>
      )}
    </div>
  );
}
