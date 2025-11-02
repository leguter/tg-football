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
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

// --- Початок Заглушок (Mocks) ---
// Оскільки 'api' та 'styles' імпортуються, ми створюємо їх заглушки

/**
 * Заглушка (Mock) для 'api' об'єкта (axios).
 * Імітує відповіді від вашого бекенду.
 */
const api = {
  post: async (url, data) => {
    console.log(`Mock API POST: ${url}`, data);
    await new Promise(res => setTimeout(res, 300)); // Імітація затримки мережі

    if (url === "/api/game/start") {
      return { data: { multiplier: 1.0 } };
    }

    if (url === "/api/game/shoot") {
      const isGoal = Math.random() > 0.3; // 70% шанс голу
      const keeperAngleId = isGoal ? null : [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)];
      return {
        data: {
          isGoal: isGoal,
          multiplier: isGoal ? (data.currentMultiplier * 1.4).toFixed(2) : 1.0,
          keeperAngleId: keeperAngleId,
        },
      };
    }

    if (url === "/api/game/cashout") {
      return { data: { winnings: 150 } };
    }
    
    // Повертаємо помилку, якщо URL невідомий
    throw new Error(`Mock API: Unknown URL ${url}`);
  }
};

/**
 * Заглушка (Mock) для CSS-модуля.
 * Дозволяє 'styles.gameContainer' працювати, не викликаючи помилок.
 */
const styles = new Proxy({}, {
  get(target, name) {
    return name.toString(); // Повертає ім'я класу, напр. "gameContainer"
  }
});

/**
 * Заглушка (Mock) для компонента 'Ball'.
 */
function Ball({ isShooting, chosenAngle, hitZoneRefs, ballContainerRef, lastResult }) {
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isShooting && chosenAngle && hitZoneRefs[chosenAngle]?.current && ballContainerRef.current) {
      // Розрахунок позиції для анімації
      const ballRect = ballContainerRef.current.getBoundingClientRect();
      const targetRect = hitZoneRefs[chosenAngle].current.getBoundingClientRect();
      
      const newX = targetRect.left + (targetRect.width / 2) - ballRect.left - (ballRect.width / 2);
      const newY = targetRect.top + (targetRect.height / 2) - ballRect.top - (ballRect.height / 2);

      setTargetPos({ x: newX, y: newY });
    } else if (!isShooting) {
      // Повернення м'яча у вихідне положення
      setTargetPos({ x: 0, y: 0 });
    }
  }, [isShooting, chosenAngle, hitZoneRefs, ballContainerRef]);

  return (
    <motion.div
      className={styles.ball}
      style={{
        width: '30px',
        height: '30px',
        backgroundColor: 'white',
        borderRadius: '50%',
        position: 'absolute',
        bottom: '10px',
        left: 'calc(50% - 15px)',
        border: '2px solid black'
      }}
      animate={{
        x: targetPos.x,
        y: targetPos.y,
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: isShooting ? 0.5 : 0.8
      }}
    >
      ⚽
    </motion.div>
  );
}

// --- Кінець Заглушок ---


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
  
  // Ініціалізуємо refs для кожної зони воріт
  GAME_ANGLES.forEach(a => {
    hitZoneRefs.current[a.id] = useRef(null);
  });

  useEffect(() => {
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
  }, []); // Порожній масив означає, що це виконається один раз при завантаженні

  const handleShoot = async (angleId) => {
    if (isShooting || !angleId) return;
    
    // Якщо це не "Наступний удар", а початок нової гри,
    // можливо, потрібно скинути 'lastResult'
    if (!canCashout) {
       setLastResult(null);
    }
    
    setIsShooting(true);
    setChosenAngle(angleId);

    try {
      // Передаємо поточний множник, щоб бекенд міг його розрахувати
      const res = await api.post("/api/game/shoot", { 
        angleId, 
        currentMultiplier: multiplier 
      }); 
      
      setLastResult(res.data);
      setMultiplier(res.data.multiplier);
      setCanCashout(res.data.isGoal);

      // Якщо промах, скидаємо можливість кешауту і вибір
      if (!res.data.isGoal) {
        setCanCashout(false);
        setChosenAngle(null); // Дозволяємо обрати новий кут
      }

    } catch (err) {
      console.error("Shoot error:", err.response?.data || err.message);
      setMultiplier(1.0); // Скидаємо у разі помилки
      setCanCashout(false);
      setChosenAngle(null);
    } finally {
      // Даємо час на анімацію
      setTimeout(() => setIsShooting(false), 1000);
    }
  };
  
  // ❗️ ДОДАНО відсутню функцію
  const handleRandomShoot = () => {
    if (isShooting) return;
    const randomAngle = GAME_ANGLES[Math.floor(Math.random() * GAME_ANGLES.length)].id;
    setChosenAngle(randomAngle);
    // Викликаємо handleShoot, щоб виконати логіку удару
    handleShoot(randomAngle); 
  };

  const handleCashout = async () => {
    try {
      const res = await api.post("/api/game/cashout");
      alert(`⭐ Ви забрали ${res.data.winnings} зірок!`);
      // Скидаємо стан гри до початкового
      setCanCashout(false);
      setMultiplier(1.0);
      setChosenAngle(null);
      setLastResult(null);
      
      // Можливо, тут потрібно знову викликати /api/game/start?
      // Залежить від логіки бекенду. Поки що просто скидаємо.
      
    } catch (err) {
      console.error("Cashout error:", err.response?.data || err.message);
    }
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.infoBar}>
        <p>
          Множник: <span className={styles.multiplier}>{parseFloat(multiplier).toFixed(2)}x</span>
        </p>
        <p>Ставка: ⭐ {stake}</p>
      </div>

      <div className={styles.field}>
        <div className={styles.goalBackground}>
          <div className={styles.goalFrame}>
            {GAME_ANGLES.map(angle => (
              <button
                key={angle.id}
                ref={hitZoneRefs.current[angle.id]} // Правильно прив'язуємо ref
                className={`${styles.hitZone} ${chosenAngle === angle.id ? styles.chosenZone : ''}`}
                style={{ left: angle.x, top: angle.y, position: 'absolute', width: '50px', height: '50px', border: '2px dashed #fff5', background: 'rgba(255,255,255,0.1)' }}
                onClick={() => setChosenAngle(angle.id)}
                disabled={isShooting || canCashout} // Не можна змінювати вибір, якщо можна забрати гроші
              >
                {/* Відображення результатів */}
                {lastResult?.keeperAngleId === angle.id && <span className={styles.saveMark}>✋</span>}
                {chosenAngle === angle.id && lastResult?.isGoal && <span className={styles.goalMark}>⚽</span>}
                {chosenAngle === angle.id && lastResult && !lastResult.isGoal && (
                  <span className={styles.missMark}>❌</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.ballContainer} ref={ballContainerRef} style={{ position: 'relative', width: '100%', height: '150px' }}>
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
          // ❗️ ВИПРАВЛЕНО: setGame -> setStake
          onChange={e => setStake(Math.max(1, Number(e.target.value)))}
          className={styles.stakeInput}
          // Не можна змінювати ставку під час активної гри
          disabled={canCashout || isShooting || multiplier !== 1.0}
        />
        <button onClick={handleRandomShoot} className={styles.randomButton} disabled={isShooting || canCashout}>
          Випадково
        </button>

        {canCashout ? (
          <>
            <button onClick={handleCashout} className={styles.cashoutButton}>
              Забрати ⭐ {Math.floor(stake * multiplier)}
            </button>
            {/* "Наступний удар" використовує той самий обраний кут */}
            <button onClick={() => handleShoot(chosenAngle)} className={styles.shootButton} disabled={isShooting}>
              Наступний удар
            </button>
          </>
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

      {/* Повідомлення про результат */}
      {lastResult && !isShooting && (
        <p className={lastResult.isGoal ? styles.successMessage : styles.failMessage}>
          {lastResult.isGoal ? 'ГОЛ! 🎯' : 'ПРОМАХ 😢'}
        </p>
      )}
    </div>
  );
}
