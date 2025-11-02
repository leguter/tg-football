// src/pages/GamePage/GamePage.jsx
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './GamePage.module.css';
import { loginViaTelegram } from '../../utils/telegramAuth';
import { startGame, shoot, cashout } from '../../utils/gameApi';

const GAME_ANGLES = [
  { id: 1, name: 'Top Left', x: '25%', y: '35%' },
  { id: 2, name: 'Top Center', x: '52%', y: '32%' },
  { id: 3, name: 'Top Right', x: '77%', y: '35%' },
  { id: 4, name: 'Bottom Left', x: '25%', y: '67%' },
  { id: 5, name: 'Bottom Right', x: '77%', y: '67%' },
];

const Ball = ({ chosenAngle, isShooting, hitZoneRefs, ballContainerRef, lastResult }) => {
  const fieldRef = ballContainerRef.current?.closest(`.${styles.field}`);
  const initial = useMemo(() => ({ x: 0, y: 0, scale: 1, rotate: 0 }), []);

  const final = useMemo(() => {
    const targetRef = hitZoneRefs[chosenAngle];
    if (!targetRef?.current || !ballContainerRef?.current || !fieldRef) return initial;

    const targetRect = targetRef.current.getBoundingClientRect();
    const fieldRect = fieldRef.getBoundingClientRect();
    const ballRect = ballContainerRef.current.getBoundingClientRect();

    const targetX = targetRect.left + targetRect.width / 2 - fieldRect.left;
    const targetY = targetRect.top + targetRect.height / 2 - fieldRect.top;
    const ballX = ballRect.left + ballRect.width / 2 - fieldRect.left;
    const ballY = ballRect.top + ballRect.height / 2 - fieldRect.top;

    const dx = targetX - ballX;
    const dy = targetY - ballY;

    return { dx, dy };
  }, [chosenAngle, hitZoneRefs, ballContainerRef, fieldRef, initial]);

  if (!chosenAngle || !isShooting) return null;

  const isGoal = lastResult?.isGoal;

  return (
    <motion.div
      className={styles.ball}
      initial={{ x: 0, y: 0, scale: 1 }}
      animate={{
        x: final.dx,
        y: final.dy,
        rotate: 360,
        transition: { duration: 0.8, ease: [0.42, 0, 0.58, 1] },
      }}
      onAnimationComplete={() => {
        if (!isGoal) {
          ballContainerRef.current?.animate(
            [{ transform: 'translateY(0)' }, { transform: 'translateY(-25px)' }, { transform: 'translateY(0)' }],
            { duration: 400, easing: 'ease-out' }
          );
        }
      }}
    >
      <img src="/images/ball1.png" alt="М'яч" className={styles.ballImage} />
    </motion.div>
  );
};

export default function GamePage() {
  const [game, setGame] = useState(null);
  const [chosenAngle, setChosenAngle] = useState(null);
  const [isShooting, setIsShooting] = useState(false);

  const ballContainerRef = useRef(null);
  const hitZoneRefs = useRef({});
  if (Object.keys(hitZoneRefs.current).length === 0) {
    GAME_ANGLES.forEach(a => (hitZoneRefs.current[a.id] = { current: null }));
  }

  // Авторизація через Telegram та старт гри
  useEffect(() => {
    async function init() {
      try {
        await loginViaTelegram();
        const data = await startGame();
        setGame(data);
      } catch (err) {
        console.error(err);
        alert('Authorization failed');
      }
    }
    init();
  }, []);

  const handleShoot = async angleId => {
    if (!angleId || isShooting) return;
    setIsShooting(true);
    setChosenAngle(angleId);

    try {
      const result = await shoot(angleId);
      setGame(prev => ({ ...prev, lastResult: result, multiplier: prev.multiplier }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsShooting(false);
    }
  };

  const handleCashout = async () => {
    try {
      const res = await cashout();
      alert(`Ви забрали ⭐ ${res.winnings}`);
      const data = await startGame();
      setGame(data);
      setChosenAngle(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRandomShoot = () => {
    const random = Math.floor(Math.random() * GAME_ANGLES.length) + 1;
    handleShoot(random);
  };

  if (!game) return <p>Loading...</p>;

  const canCashout = game.multiplier > 1 && game.lastResult?.isGoal;

  return (
    <div className={styles.gameContainer}>
      <div className={styles.infoBar}>
        <p>
          Множник: <span className={styles.multiplier}>{game.multiplier.toFixed(2)}x</span>
        </p>
        <p>Ставка: ⭐ {game.stake}</p>
      </div>

      <div className={styles.field}>
        <div className={styles.goalBackground}>
          <div className={styles.goalFrame}>
            {GAME_ANGLES.map(angle => (
              <button
                key={angle.id}
                ref={hitZoneRefs.current[angle.id]}
                className={`${styles.hitZone} ${chosenAngle === angle.id ? styles.chosenZone : ''}`}
                style={{ left: angle.x, top: angle.y }}
                onClick={() => setChosenAngle(angle.id)}
                disabled={isShooting}
              >
                {game.lastResult?.keeperAngleId === angle.id && <span className={styles.saveMark}>✋</span>}
                {chosenAngle === angle.id && game.lastResult?.isGoal && <span className={styles.goalMark}>⚽</span>}
                {chosenAngle === angle.id && game.lastResult && !game.lastResult.isGoal && (
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
            lastResult={game.lastResult}
          />
        </div>
      </div>

      <div className={styles.controls}>
        <input
          type="number"
          value={game.stake}
          onChange={e => setGame(prev => ({ ...prev, stake: Math.max(1, Number(e.target.value)) }))}
          className={styles.stakeInput}
          disabled={canCashout || isShooting || game.multiplier !== 1.0}
        />
        <button onClick={handleRandomShoot} className={styles.randomButton} disabled={isShooting}>
          Випадково
        </button>

        {canCashout ? (
          <>
            <button onClick={handleCashout} className={styles.cashoutButton}>
              Забрати ⭐ {Math.floor(game.stake * game.multiplier)}
            </button>
            <button onClick={() => handleShoot(chosenAngle)} className={styles.shootButton}>
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

      {game.lastResult && !isShooting && (
        <p className={game.lastResult.isGoal ? styles.successMessage : styles.failMessage}>
          {game.lastResult.isGoal ? 'ГОЛ! 🎯' : 'ПРОМАХ 😢'}
        </p>
      )}
    </div>
  );
}
