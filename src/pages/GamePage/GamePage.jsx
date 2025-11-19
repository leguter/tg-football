// import { useEffect, useState, useRef } from "react";
// import { motion } from "framer-motion";
// import api from "../../api";
// import styles from "./GamePage.module.css";

// const GAME_ANGLES = [
//   { id: 1, name: 'Top Left', x: '25%', y: '35%' },
//   { id: 2, name: 'Top Center', x: '52%', y: '32%' },
//   { id: 3, name: 'Top Right', x: '77%', y: '35%' },
//   { id: 4, name: 'Bottom Left', x: '25%', y: '67%' },
//   { id: 5, name: 'Bottom Right', x: '77%', y: '67%' },
// ];

// export default function GamePage({ user }) {
//   const [stake, setStake] = useState(100);
//   const [multiplier, setMultiplier] = useState(1.0);
//   const [chosenAngle, setChosenAngle] = useState(null);
//   const [lastResult, setLastResult] = useState(null);
//   const [isShooting, setIsShooting] = useState(false);
//   const [canCashout, setCanCashout] = useState(false);

//   const ballContainerRef = useRef(null);
//   const hitZoneRefs = useRef({});
//   useEffect(() => {
//     GAME_ANGLES.forEach(a => (hitZoneRefs.current[a.id] = { current: null }));

//     // 🔹 Запускаємо гру при старті
//     const startGame = async () => {
//       try {
//         const res = await api.post("/api/game/start", { stake });
//         setMultiplier(res.data.multiplier);
//       } catch (err) {
//         console.error("Start game error:", err.response?.data || err.message);
//       }
//     };
//     startGame();
//   }, []);

//   const handleShoot = async (angleId) => {
//     if (isShooting) return;
//     setIsShooting(true);
//     setChosenAngle(angleId);

//     try {
//       const res = await api.post("/api/game/shoot", { angleId });
//       setLastResult(res.data);
//       setMultiplier(res.data.multiplier);
//       setCanCashout(res.data.isGoal);
//     } catch (err) {
//       console.error("Shoot error:", err.response?.data || err.message);
//     } finally {
//       setTimeout(() => setIsShooting(false), 1000);
//     }
//   };

//   const handleCashout = async () => {
//     try {
//       const res = await api.post("/api/game/cashout");
//       alert(`⭐ Ви забрали ${res.data.winnings} зірок!`);
//       setCanCashout(false);
//       setMultiplier(1.0);
//       setChosenAngle(null);
//       setLastResult(null);
//     } catch (err) {
//       console.error("Cashout error:", err.response?.data || err.message);
//     }
//   };

//   return (
//     <div className={styles.gameContainer}>
//       <div className={styles.infoBar}>
//         <p>
//           Множник: <span className={styles.multiplier}>{multiplier.toFixed(2)}x</span>
//         </p>
//         <p>Ставка: ⭐ {stake}</p>
//       </div>

//       <div className={styles.field}>
//         <div className={styles.goalBackground}>
//           <div className={styles.goalFrame}>
//             {GAME_ANGLES.map(angle => (
//               <button
//                 key={angle.id}
//                 ref={hitZoneRefs.current[angle.id]}
//                 className={`${styles.hitZone} ${chosenAngle === angle.id ? styles.chosenZone : ''}`}
//                 style={{ left: angle.x, top: angle.y }}
//                 onClick={() => setChosenAngle(angle.id)}
//                 disabled={isShooting}
//               >
//                 {lastResult?.keeperAngleId === angle.id && <span className={styles.saveMark}>✋</span>}
//                 {chosenAngle === angle.id && lastResult?.isGoal && <span className={styles.goalMark}>⚽</span>}
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
//             hitZoneRefs={hitZoneRefs.current}
//             ballContainerRef={ballContainerRef}
//             lastResult={lastResult}
//           />
//         </div>
//       </div>

//       <div className={styles.controls}>
//         <input
//           type="number"
//           value={stake}
//           onChange={e => setGame(prev => ({ ...prev, stake: Math.max(1, Number(e.target.value)) }))}
//           className={styles.stakeInput}
//           disabled={canCashout || isShooting || multiplier !== 1.0}
//         />
//         <button onClick={handleRandomShoot} className={styles.randomButton} disabled={isShooting}>
//           Випадково
//         </button>

//         {canCashout ? (
//           <>
//             <button onClick={handleCashout} className={styles.cashoutButton}>
//               Забрати ⭐ {Math.floor(stake * multiplier)}
//             </button>
//             <button onClick={() => handleShoot(chosenAngle)} className={styles.shootButton}>
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
//         <p className={lastResult.isGoal ? styles.successMessage : styles.failMessage}>
//           {lastResult.isGoal ? 'ГОЛ! 🎯' : 'ПРОМАХ 😢'}
//         </p>
//       )}
//     </div>
//   );
// }
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

// ⚽ М’яч з анімацією
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
      initial={{ x: 0, y: 0, scale: 1 }}
      animate={{
        x: dx,
        y: dy,
        rotate: 360,
        transition: { duration: 0.8, ease: [0.42, 0, 0.58, 1] },
      }}
      onAnimationComplete={() => {
        if (!isGoal) {
          ballContainerRef.current?.animate(
            [
              { transform: "translateY(0)" },
              { transform: "translateY(-25px)" },
              { transform: "translateY(0)" },
            ],
            { duration: 400, easing: "ease-out" }
          );
        }
      }}
    >
      <img src="/images/ball1.png" alt="М'яч" className={styles.ballImage} />
    </motion.div>
  );
}

// 🎯 Основна сторінка гри
export default function GamePage({ user, setUser }) {
  const [stake, setStake] = useState(100);
  const [multiplier, setMultiplier] = useState(1.0);
  const [chosenAngle, setChosenAngle] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [isShooting, setIsShooting] = useState(false);
  const [canCashout, setCanCashout] = useState(false);

  const ballContainerRef = useRef(null);
  const hitZoneRefs = useRef({});

  // ✅ Удар
  // const handleShoot = async (angleId) => {
  //   if (isShooting || !angleId) return;
  //   setIsShooting(true);
  //   setChosenAngle(angleId);

    // try {
    //   const initData =
    //     window.Telegram?.WebApp?.initData ||
    //     "?user=" +
    //       encodeURIComponent(JSON.stringify({ id: user?.user?.telegram_id || 6880150992 }));

    //   // 🟢 Перший удар (списання ставки)
    //   if (multiplier === 1.0 && !canCashout) {
    //     const startRes = await api.post("/api/game/start", { stake, initData });
    //     if (startRes.data.balance !== undefined) {
    //       setUser((prev) => ({
    //         ...prev,
    //         user: { ...prev.user, balance: startRes.data.balance },
    //       }));
    //     }
    //   }

  //     // 🟢 Сам удар
  //     const res = await api.post("/api/game/shoot", { angleId, initData });
  //     setLastResult(res.data);
  //     setMultiplier(res.data.multiplier);
  //     setCanCashout(res.data.isGoal);
  //   } catch (err) {
  //     console.error("Shoot error:", err.response?.data || err.message);
  //     alert(err.response?.data?.message || "Помилка удару");
  //   } finally {
  //     setTimeout(() => setIsShooting(false), 1000);
  //   }
  // };
  // const handleShoot = async (angleId) => {
  //   if (isShooting || !angleId) return;
  //   setIsShooting(true);
  //   setChosenAngle(angleId);

  //   try {
  //     const initData = window.Telegram?.WebApp?.initData || "";

  //     // Якщо це перший удар — запускаємо гру (списання ставки)
  //     if (multiplier === 1.0 && !canCashout) {
  //       try {
          
  //         const startRes = await api.post("/api/game/start", { stake, initData });

  //         if (startRes.data.balance !== undefined) {
  //           setUser((prev) => ({
  //             ...prev,
  //             user: { ...prev.user, balance: startRes.data.balance },
  //           }));
  //         }
  //       } catch (err) {
  //         console.error("Start game error:", err.response?.data || err.message);
  //         alert(err.response?.data?.message || "Не вдалось почати гру");
  //         setIsShooting(false);
  //         return;
  //       }
  //     }
  //     // Тепер робимо удар
  //     const res = await api.post("/api/game/shoot", { angleId, initData });
  //     setLastResult(res.data);
  //     setMultiplier(res.data.multiplier);
  //     setCanCashout(res.data.isGoal);

  //   } catch (err) {
  //     console.error("❌ Shoot error:", err.response?.data || err.message);
  //     console.error("Shoot error:", err.response?.data || err.message);
  //   } finally {
  //     setTimeout(() => setIsShooting(false), 1000);
  //   }
  // };

  const handleShoot = async (angleId) => {
    if (isShooting || !angleId) return;
    setIsShooting(true);
    setChosenAngle(angleId);
  
    try {
      const initData =
        window.Telegram?.WebApp?.initData?.trim() ||
        (user?.user?.telegram_id
          ? "?user=" + encodeURIComponent(JSON.stringify({ id: user.user.telegram_id }))
          : "");
  
      // 🟢 Перший удар — старт гри
      if (multiplier === 1.0 && !canCashout) {
        try {
            console.log(initData)
          
          const startRes = await api.post("/api/game/start", { stake, initData });
        
          if (startRes.data.balance !== undefined) {
            setUser((prev) => ({
              ...prev,
              user: { ...prev.user, balance: startRes.data.balance },
            }));
          }
        } catch (err) {
          console.error("Start game error:", err.response?.data || err.message);
          alert(err.response?.data?.message || "Не вдалось почати гру");
          setIsShooting(false);
          return;
        }
      }

      // Тепер робимо удар
      const res = await api.post("/api/game/shoot", { angleId, initData });
      setLastResult(res.data);
      setMultiplier(res.data.multiplier);
      setCanCashout(res.data.isGoal);
    } catch (err) {
      console.error("Shoot error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Помилка удару");
    } finally {
      setTimeout(() => setIsShooting(false), 1000);
    }
  };
  
  // 💰 Кешаут
  const handleCashout = async () => {
    try {
      const initData =
        window.Telegram?.WebApp?.initData ||
        "?user=" +
          encodeURIComponent(JSON.stringify({ id: user?.user?.telegram_id || 6880150992 }));

      const res = await api.post("/api/game/cashout", { initData });
      alert(`⭐ Ви забрали ${res.data.winnings} зірок!`);

      setCanCashout(false);
      setMultiplier(1.0);
      setChosenAngle(null);
      setLastResult(null);

      if (res.data.balance !== undefined) {
        setUser((prev) => ({
          ...prev,
          user: { ...prev.user, balance: res.data.balance },
        }));
      }
    } catch (err) {
      console.error("Cashout error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Помилка кешауту");
    }
  };

  // 🎲 Випадковий удар
  const handleRandomShoot = () => {
    const randomAngle =
      GAME_ANGLES[Math.floor(Math.random() * GAME_ANGLES.length)].id;
    handleShoot(randomAngle);
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.infoBar}>
        <p>
          Множник: <span className={styles.multiplier}>{multiplier.toFixed(2)}x</span>
        </p>
        <p>Ставка: ⭐ {stake}</p>
        <p>Баланс: ⭐ {user?.user?.balance ?? 0}</p>
      </div>

      <div className={styles.field}>
        <div className={styles.goalBackground}>
          <div className={styles.goalFrame}>
            {GAME_ANGLES.map((angle) => (
              <button
                key={angle.id}
                ref={(el) => (hitZoneRefs.current[angle.id] = el)} // ✅ callback-ref
                className={`${styles.hitZone} ${
                  chosenAngle === angle.id ? styles.chosenZone : ""
                }`}
                style={{ left: angle.x, top: angle.y }}
               onClick={() => setChosenAngle(angle.id)} // ✅ одразу стріляє
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
          disabled={isShooting || multiplier !== 1.0}
        />
        <button
          onClick={handleRandomShoot}
          className={styles.randomButton}
          disabled={isShooting}
        >
          Випадково
        </button>

        {canCashout ? (
          <>
            <button onClick={handleCashout} className={styles.cashoutButton}>
              Забрати ⭐ {Math.floor(stake * multiplier)}
            </button>
            <button
              onClick={() => handleShoot(chosenAngle)}
              className={styles.shootButton}
            >
              Наступний удар
            </button>
          </>
        ) : (
          <button
            onClick={() => handleShoot(chosenAngle)}
            className={styles.primaryButton}
            disabled={!chosenAngle || isShooting}
          >
            {multiplier > 1.0 ? "Наступний удар" : "Ударити"}
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