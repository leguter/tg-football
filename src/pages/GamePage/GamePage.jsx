// import { useState, useRef } from "react";
// import { motion } from "framer-motion";
// import api from "../../api";
// import styles from "./GamePage.module.css";

// const GAME_ANGLES = [
  // { id: 1, name: "Top Left", x: "25%", y: "35%" },
  // { id: 2, name: "Top Center", x: "52%", y: "32%" },
  // { id: 3, name: "Top Right", x: "77%", y: "35%" },
  // { id: 4, name: "Bottom Left", x: "25%", y: "67%" },
  // { id: 5, name: "Bottom Right", x: "77%", y: "67%" },
// ];

// // === Отримуємо initData з Telegram (або фейковий для локалу) ===
// function getInitData(user) {
//   const tgData = window.Telegram?.WebApp?.initData;
//   if (tgData && tgData.trim() !== "") return tgData;

//   if (user?.user?.telegram_id) {
//     return (
//       "?user=" +
//       encodeURIComponent(JSON.stringify({ id: user.user.telegram_id }))
//     );
//   }

//   return "";
// }

// // === М'яч з анімацією ===
// function Ball({ chosenAngle, isShooting, hitZoneRefs, ballContainerRef, lastResult }) {
//   if (!isShooting || !chosenAngle) return null;

//   const targetRef = hitZoneRefs.current[chosenAngle];
//   const targetRect = targetRef?.getBoundingClientRect();
//   const ballRect = ballContainerRef.current?.getBoundingClientRect();
//   if (!targetRect || !ballRect) return null;

//   const dx =
//     targetRect.left +
//     targetRect.width / 2 -
//     ballRect.left -
//     ballRect.width / 2;
//   const dy =
//     targetRect.top +
//     targetRect.height / 2 -
//     ballRect.top -
//     ballRect.height / 2;

//   return (
//     <motion.div
//       className={styles.ball}
//       initial={{ x: 0, y: 0, scale: 1 }}
//       animate={{ x: dx, y: dy, rotate: 360, transition: { duration: 0.8 } }}
//     >
//       <img src="/images/ball1.png" alt="М'яч" className={styles.ballImage} />
//     </motion.div>
//   );
// }

// // === Сторінка гри (СТАРИЙ ВИГЛЯД, НОВА ЛОГІКА) ===
// export default function GamePage({ user, setUser }) {
//   const [stake, setStake] = useState(100);
//   const [multiplier, setMultiplier] = useState(1.0);
//   const [chosenAngle, setChosenAngle] = useState(null);
//   const [lastResult, setLastResult] = useState(null);
//   const [isShooting, setIsShooting] = useState(false);
//   const [canCashout, setCanCashout] = useState(false);

//   const ballContainerRef = useRef(null);
//   const hitZoneRefs = useRef({});

//   // === Удар ===
//   const handleShoot = async (angleId) => {
//     if (!angleId || isShooting) return;

//     setIsShooting(true);
//     setChosenAngle(angleId);

//     const initData = getInitData(user);

//     // 1) Перший удар → старт гри (списання ставки)
//     if (multiplier === 1.0 && !canCashout) {
//       try {
//         const startRes = await api.post("/api/game/start", { initData, stake });

//         // оновлюємо баланс тільки якщо є setUser
//         if (typeof setUser === "function" && startRes.data?.balance !== undefined) {
//           setUser((prev) => ({
//             ...prev,
//             user: { ...prev.user, balance: startRes.data.balance },
//           }));
//         }
//       } catch (err) {
//         console.error("Start game error:", err);
//         alert(err?.response?.data?.message || "Не вдалось почати гру");
//         setIsShooting(false);
//         return;
//       }
//     }

//     // 2) Сам удар
//     try {
//       const res = await api.post("/api/game/shoot", { initData, angleId });
//       setLastResult(res.data);
//       setMultiplier(res.data.multiplier);
//       setCanCashout(res.data.isGoal);
//     } catch (err) {
//       console.error("Shoot error:", err);
//       alert(err?.response?.data?.message || "Помилка удару");
//     }

//     setTimeout(() => setIsShooting(false), 800);
//   };

//   // === Випадковий удар (кнопка "Випадково") ===
//   const handleRandomShoot = () => {
//     const randomAngle = GAME_ANGLES[Math.floor(Math.random() * GAME_ANGLES.length)].id;
//     handleShoot(randomAngle);
//   };

//   // === Кешаут ===
//   const handleCashout = async () => {
//     const initData = getInitData(user);
//     try {
//       const res = await api.post("/api/game/cashout", { initData });
//       alert(`⭐ Ви забрали ${res.data.winnings} зірок!`);

//       if (typeof setUser === "function" && res.data?.balance !== undefined) {
//         setUser((prev) => ({
//           ...prev,
//           user: { ...prev.user, balance: res.data.balance },
//         }));
//       }

//       setCanCashout(false);
//       setMultiplier(1.0);
//       setChosenAngle(null);
//       setLastResult(null);
//     } catch (err) {
//       console.error("Cashout error:", err);
//       alert(err?.response?.data?.message || "Помилка кешауту");
//     }
//   };

//   return (
//     <div className={styles.gameContainer}>
//       <div className={styles.infoBar}>
//         <p>
//           Множник:{" "}
//           <span className={styles.multiplier}>{multiplier.toFixed(2)}x</span>
//         </p>
//         <p>Ставка: ⭐ {stake}</p>
//         <p>Баланс: ⭐ {user?.user?.balance ?? 0}</p>
//       </div>

//       <div className={styles.field}>
//         <div className={styles.goalBackground}>
//           <div className={styles.goalFrame}>
//             {GAME_ANGLES.map((angle) => (
//               <button
//                 key={angle.id}
//                 ref={(el) => (hitZoneRefs.current[angle.id] = el)}
//                 className={`${styles.hitZone} ${
//                   chosenAngle === angle.id ? styles.chosenZone : ""
//                 }`}
//                 style={{ left: angle.x, top: angle.y }}
//                 onClick={() => setChosenAngle(angle.id)}
//                 disabled={isShooting}
//               >
//                 {lastResult?.keeperAngleId === angle.id && (
//                   <span className={styles.saveMark}>✋</span>
//                 )}
//                 {chosenAngle === angle.id && lastResult?.isGoal && (
//                   <span className={styles.goalMark}>⚽</span>
//                 )}
//                 {chosenAngle === angle.id && lastResult && !lastResult.isGoal && (
//                   <span className={styles.missMark}>❌</span>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className={styles.ballContainer} ref={ballContainerRef}>
//           <Ball
//             chosenAngle={chosenAngle}
//             isShooting={isShooting}
//             hitZoneRefs={hitZoneRefs}
//             ballContainerRef={ballContainerRef}
//             lastResult={lastResult}
//           />
//         </div>
//       </div>

//       <div className={styles.controls}>
//         <input
//           type="number"
//           value={stake}
//           onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
//           className={styles.stakeInput}
//           disabled={canCashout || isShooting || multiplier !== 1.0}
//         />

//         <button
//           onClick={handleRandomShoot}
//           className={styles.randomButton}
//           disabled={isShooting}
//         >
//           Випадково
//         </button>

//         {canCashout ? (
//           <>
//             <button onClick={handleCashout} className={styles.cashoutButton}>
//               Забрати ⭐ {Math.floor(stake * multiplier)}
//             </button>
//             <button
//               onClick={() => handleShoot(chosenAngle)}
//               className={styles.shootButton}
//             >
//               Наступний удар
//             </button>
//           </>
//         ) : (
//           <button
//             onClick={() => handleShoot(chosenAngle)}
//             className={styles.primaryButton}
//             disabled={!chosenAngle || isShooting}
//           >
//             Ударити
//           </button>
//         )}
//       </div>

//       {lastResult && !isShooting && (
//         <p
//           className={
//             lastResult.isGoal ? styles.successMessage : styles.failMessage
//           }
//         >
//           {lastResult.isGoal ? "ГОЛ! 🎯" : "ПРОМАХ 😢"}
//         </p>
//       )}
//     </div>
//   );
// }


import { useState, useRef,useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../api";
import styles from "./GamePage.module.css";

const GAME_ANGLES = [
  { id: 1, name: "Top Left", x: "10%", y: "37%" },
  { id: 2, name: "Top Center", x: "51%", y: "37%" },
  { id: 3, name: "Top Right", x: "92%", y: "37%" },
  { id: 4, name: "Bottom Left", x: "10%", y: "65%" },
  { id: 5, name: "Bottom Right", x: "92%", y: "65%" },
];

function getInitData(user) {
  const tgData = window.Telegram?.WebApp?.initData;
  if (tgData && tgData.trim() !== "") return tgData;

  if (user?.user?.telegram_id) {
    return "?user=" + encodeURIComponent(JSON.stringify({ id: user.user.telegram_id }));
  }

  return "";
}

function Ball({ chosenAngle, isShooting, hitZoneRefs, ballContainerRef }) {
  if (!isShooting || !chosenAngle) return null;

  const targetRef = hitZoneRefs.current[chosenAngle];
  const targetRect = targetRef?.getBoundingClientRect();
  const ballRect = ballContainerRef.current?.getBoundingClientRect();
  if (!targetRect || !ballRect) return null;

  const dx = targetRect.left + targetRect.width / 2 - ballRect.left - ballRect.width / 2;
  const dy = targetRect.top + targetRect.height / 2 - ballRect.top - ballRect.height / 2;

  return (
    <motion.div
      className={styles.ball}
      initial={{ x: 0, y: 0, scale: 1 }}
      animate={{ x: dx, y: dy, rotate: 360, transition: { duration: 0.8 } }}
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
// Після обробки кешауту або старту гри
useEffect(() => {
  // викликає rerender при зміні балансу
}, [user?.user?.balance]);

  const handleShoot = async (angleId) => {
    if (!angleId || isShooting) return;

    setIsShooting(true);
    setChosenAngle(angleId);
    setShowResult(false);

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
      } catch (err) {
        alert(err?.response?.data?.message || "Не вдалось почати гру");
        setIsShooting(false);
        return;
      }
    }

    try {
      const res = await api.post("/api/game/shoot", { initData, angleId });
      setLastResult(res.data);
      setMultiplier(res.data.multiplier);
      setCanCashout(res.data.isGoal);
    } catch (err) {
      alert(err?.response?.data?.message || "Помилка удару");
    }

    setTimeout(() => {
      setIsShooting(false);
      setShowResult(true);
    }, 800);
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
      setShowResult(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Помилка кешауту");
    }
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.infoBar}>
  <p>
    Умножитель: <span className={styles.multiplier}>{multiplier.toFixed(2)}x</span>
  </p>

  <p>
    Ставка: <span className={styles.infoBarStar}>⭐</span> {stake}
  </p>

  <p>
    Баланс: <span className={styles.infoBarStar}>⭐</span> {user?.user?.balance ?? 0}
  </p>
</div>

       
      <div className={styles.field}>
        {multiplier > 1.0 && (
  <motion.div
    className={styles.multiplierDisplay}
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    {multiplier.toFixed(2)}x 🔥
  </motion.div>
)}

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

        <div className={styles.ballContainer} ref={ballContainerRef}>
          <Ball
            chosenAngle={chosenAngle}
            isShooting={isShooting}
            hitZoneRefs={hitZoneRefs}
            ballContainerRef={ballContainerRef}
            lastResult={lastResult}
          />
        </div>
          {showResult && lastResult && !isShooting && (
    <div
      className={`${styles.shotResult} ${
        lastResult.isGoal ? styles.goal : styles.miss
      }`}
    >
      {lastResult.isGoal ? "ГОЛ! 🎯" : "ПРОМАХ 😢"}
    </div>
  )}
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
              Забрать ⭐ {Math.floor(stake * multiplier)}
            </button>
            <button onClick={() => handleShoot(chosenAngle)} className={styles.shootButton}>
              Следующий удар
            </button>
          </>
        ) : (
          <button
            onClick={() => handleShoot(chosenAngle)}
            className={styles.primaryButton}
            disabled={!chosenAngle || isShooting}
          >
            Ударить
          </button>
        )}
      </div>

      {/* {showResult && lastResult && !isShooting && (
        <p className={lastResult.isGoal ? styles.successMessage : styles.failMessage}>
          {lastResult.isGoal ? "ГОЛ! 🎯" : "ПРОМАХ 😢"}
        </p>
      )} */}
    </div>
  );
}
