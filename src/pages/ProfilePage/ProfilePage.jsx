// import { useState,useEffect } from "react";
// import styles from "./ProfilePage.module.css";
// import api from "../../api";

// export default function ProfilePage({user}) {
//   const [balance, setBalance] = useState(1500);
//   const [history, setHistory] = useState([
//     { id: 1, type: "Win", amount: 350, date: "2025-10-30", multiplier: "x1.4" },
//     { id: 2, type: "Loss", amount: 100, date: "2025-10-30", multiplier: "x1.0" },
//   ]);
//   // console.log(user)
//   useEffect(() => {
//     if (user?.user?.balance !== undefined) {
//       setBalance(user.user.balance);
//     }
//   }, [user]);
//   const [showDepositModal, setShowDepositModal] = useState(false);
//   const [showWithdrawModal, setShowWithdrawModal] = useState(false);
//   const [amount, setSelectedAmount] = useState(100);
//   const [message, setMessage] = useState("");
//   //   const [loading, setLoading] = useState(false);
//   // const [selected, setSelected] = useState(null);
//   // const [balance, setBalance] = useState(0);
//   // Вибір можливих сум
//   const starOptions = [1, 50, 100, 500, 1000];

//   // ==============================
//   // 💰 Депозит (через бекенд)
//   // ==============================
// // const handleDeposit = async () => {
// //   try {
// //     const res = await api.post(
// //       "/api/stars/deposit",
// //       { amount: selectedAmount },
// //       { withCredentials: true }
// //     );

// //     if (res.data.success) {
// //       const invoiceLink = res.data.invoice_link;
// //       const tg = window.Telegram?.WebApp;

// //       // ✅ Відкриваємо Telegram Invoice меню прямо в Mini App
// //       if (tg && tg.openInvoice) {
// //         tg.openInvoice(invoiceLink, async (status) => {
// //           console.log("🧾 Telegram invoice status:", status);

// //           if (status === "paid") {
// //             try {
// //               const completeRes = await api.post("/api/stars/complete", { amount: selectedAmount });
// //               setBalance(completeRes.data.internal_stars);
// //               alert("✅ Оплата успішна! Баланс оновлено.");
// //             } catch (err) {
// //               console.error("Error after payment:", err);
// //               alert("Помилка при оновленні балансу після оплати!");
// //             }
// //           } else if (status === "failed") {
// //             alert("❌ Оплата не пройшла.");
// //           } else if (status === "cancelled") {
// //             alert("❌ Ви скасували оплату.");
// //           }
// //         });
// //       } else {
// //         // fallback — якщо користувач не в Telegram Mini App
// //         window.open(invoiceLink, "_blank");
// //       }

// //       setHistory((prev) => [
// //         {
// //           id: Date.now(),
// //           type: "Deposit",
// //           amount: selectedAmount,
// //           date: new Date().toISOString().slice(0, 10),
// //           multiplier: "-",
// //         },
// //         ...prev,
// //       ]);
// //       setShowDepositModal(false);
// //     } else {
// //       alert("Не вдалося створити депозит!");
// //     }
// //   } catch (err) {
// //     console.error("Deposit error:", err);
// //     alert("Помилка при створенні депозиту!");
// //   }
// // };
// const handleDeposit = async () => {


//     // setLoading(true);
//     // setSelected(amount);
//     setMessage("");

//     try {
//       const res = await api.post("/api/stars/deposit", { amount });
//       if (!res.data?.success) return setMessage("Failed to create invoice");

//       const { invoice_link, payload } = res.data;
//       setMessage("💳 We open the payment...");

//       if (window.Telegram?.WebApp) {
//         const tg = window.Telegram.WebApp;
//         tg.openInvoice(invoice_link);

//         const onInvoiceClosed = async (eventData) => {
//           tg.offEvent("invoiceClosed", onInvoiceClosed);

//           if (eventData.status === "paid") {
//             setMessage("✅ Payment is completed. We are checking the server...");

//             try {
//               const completeRes = await api.post("/api/stars/complete", { payload });
//               if (completeRes.data?.success) {
//                 setBalance(completeRes.data.balance);
//                 setMessage("💰 Balance updated!");
//               } else {
//                 setMessage("❌ Payment is not confirmed on the server");
//               }
//             } catch (err) {
//               console.error(err);
//               setMessage("⚠️ It was not possible to restore the balance");
//             }
//           } else {
//             setMessage("❌ Payment declined or not completed");
//           }
//         };

//         tg.onEvent("invoiceClosed", onInvoiceClosed);
//       } else {
//         window.open(invoice_link, "_blank");
//         setMessage("Відкрито у новому вікні. Баланс оновиться після підтвердження платежу на сервері.");
//       }
//     } catch (err) {
//       console.error(err);
//       setMessage("Помилка при створенні інвойсу");
//     } finally {
//       // setLoading(false);
//     }
//   };


//   // ==============================
//   // 💸 Вивід (через бекенд)
//   // ==============================
//   const handleWithdraw = async () => {
//     try {
//       const res = await api.post(
//         "/api/stars/withdraw",
//         { amount: amount },
//         { withCredentials: true }
//       );

//       if (res.data.success) {
//         setBalance(res.data.internal_stars);
//         setShowWithdrawModal(false);
//         setHistory((prev) => [
//           {
//             id: Date.now(),
//             type: "Withdraw",
//             amount: amount,
//             date: new Date().toISOString().slice(0, 10),
//             multiplier: "-",
//           },
//           ...prev,
//         ]);
//       } else {
//         alert(res.data.message || "Помилка при виводі!");
//       }
//     } catch (err) {
//       console.error("Withdraw error:", err);
//       alert("Помилка при виводі зірок!");
//     }
//   };

//   return (
//     <div className={styles.profileContainer}>
//       <h1>👤 Ваш Профиль</h1>

//       <div className={styles.balanceCard}>
//         <h2>Баланс:</h2>
//         <p className={styles.balanceAmount}>⭐ {balance}</p>

//         <div className={styles.actions}>
//           <button
//             onClick={() => setShowDepositModal(true)}
//             className={styles.depositBtn}
//           >
//             Депозит
//           </button>
//           <button
//             onClick={() => setShowWithdrawModal(true)}
//             className={styles.withdrawBtn}
//           >
//             Вывод
//           </button>
//         </div>
//       </div>

//       <h2 className={styles.historyTitle}>Історія ігор</h2>
//       <ul className={styles.historyList}>
//         {history.map((item) => (
//           <li
//             key={item.id}
//             className={
//               item.type === "Win"
//                 ? styles.winItem
//                 : item.type === "Loss"
//                 ? styles.lossItem
//                 : item.type === "Deposit"
//                 ? styles.depositItem
//                 : styles.withdrawItem
//             }
//           >
//             <span className={styles.type}>
//               {item.type === "Win"
//                 ? "✅ ВЫИГРАШ"
//                 : item.type === "Loss"
//                 ? "❌ ПРОИГРАШ"
//                 : item.type === "Deposit"
//                 ? "💰 ДЕПОЗИТ"
//                 : "💸 ВИВОД"}
//             </span>
//             <span className={styles.details}>
//               {item.type === "Win"
//                 ? `+${item.amount} (${item.multiplier})`
//                 : item.type === "Loss"
//                 ? `-${item.amount}`
//                 : item.type === "Deposit"
//                 ? `+${item.amount}`
//                 : `-${item.amount}`}{" "}
//               звезд
//             </span>
//             <span className={styles.date}>{item.date}</span>
//           </li>
//         ))}
//       </ul>

//       {/* --- Deposit Modal --- */}
//       {showDepositModal && (
//         <div className={styles.modalBackdrop}>
//           <div className={styles.modal}>
//             <h3>💰 Выберите сумму для депозита</h3>
//             <div className={styles.starOptions}>
//               {starOptions.map((amount) => (
//                 <button
//                   key={amount}
//                   onClick={() => setSelectedAmount(amount)}
//                   className={`${styles.starOption} ${
//                     amount === amount ? styles.active : ""
//                   }`}
//                 >
//                   ⭐ {amount}
//                 </button>
//               ))}
//             </div>
//             <div className={styles.modalActions}>
//               <button onClick={handleDeposit} className={styles.confirmBtn}>
//                 Подтвердить
//               </button>
//               <button
//                 onClick={() => setShowDepositModal(false)}
//                 className={styles.cancelBtn}
//               >
//                 Отменить
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* --- Withdraw Modal --- */}
//       {showWithdrawModal && (
//         <div className={styles.modalBackdrop}>
//           <div className={styles.modal}>
//             <h3>💸 Выберите сумму для вывода</h3>
//             <div className={styles.starOptions}>
//               {starOptions.map((amount) => (
//                 <button
//                   key={amount}
//                   onClick={() => setSelectedAmount(amount)}
//                   className={`${styles.starOption} ${
//                     amount === amount ? styles.active : ""
//                   }`}
//                 >
//                   ⭐ {amount}
//                 </button>
//               ))}
//             </div>
//             <div className={styles.modalActions}>
//               <button onClick={handleWithdraw} className={styles.confirmBtn}>
//                 Подтвердить
//               </button>
//               <button
//                 onClick={() => setShowWithdrawModal(false)}
//                 className={styles.cancelBtn}
//               >
//                 Отменить
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {message && <p className={styles.Message}>{message}</p>}
//     </div>
    
//   );
// }

import { useState, useEffect } from "react";
import styles from "./ProfilePage.module.css";
import api from "../../api";
import WebApp from "@twa-dev/sdk";

export default function ProfilePage({ user }) {

  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setSelectedAmount] = useState(100);
  const [message, setMessage] = useState("");

  const starOptions = [1, 50, 100, 500, 1000];
const [visibleCount, setVisibleCount] = useState(4);

  // ==============================
  // 🔹 LOAD BALANCE + HISTORY
  // ==============================
  useEffect(() => {
    if (user?.user?.balance !== undefined) {
      setBalance(user.user.balance);
    }
    loadHistory();
  }, [user]);

 const loadHistory = async () => {
  try {
    const initData = WebApp.initData;
    const res = await api.post("/api/game/history", { initData });

    if (res.data.success) {
      setHistory(res.data.history);
      setVisibleCount(4); // 🔥 скинути після оновлення
    }
  } catch (err) {
    console.error("History load error:", err);
  }
};


  // ==============================
  // 💰 Deposit
  // ==============================
  const handleDeposit = async () => {
    setMessage("");

    try {
      const res = await api.post("/api/stars/deposit", { amount });
      if (!res.data?.success) return setMessage("Failed to create invoice");

      const { invoice_link, payload } = res.data;
      setMessage("💳 Opening payment...");

      const tg = window.Telegram?.WebApp;
      if (tg && tg.openInvoice) {
        tg.openInvoice(invoice_link);

        const onInvoiceClosed = async (data) => {
          tg.offEvent("invoiceClosed", onInvoiceClosed);
          if (data.status === "paid") {
            const completeRes = await api.post("/api/stars/complete", { payload });
            setBalance(completeRes.data.balance);
            loadHistory();
            setMessage("💰 Balance updated!");
          } else {
            setMessage("❌ Payment failed or canceled");
          }
        };

        tg.onEvent("invoiceClosed", onInvoiceClosed);
      } else {
        window.open(invoice_link, "_blank");
        setMessage("Open in new tab...");
      }
    } catch (err) {
      console.error(err);
      setMessage("Deposit error");
    }
  };

  // ==============================
  // 💸 Withdraw
  // ==============================
  const handleWithdraw = async () => {
    try {
      const initData = WebApp.initData;

      const res = await api.post("/api/stars/withdraw", {
        initData,
        amount,
      });

      if (res.data.success) {
        setBalance(res.data.internal_stars);
        loadHistory();
        setShowWithdrawModal(false);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("Withdraw error!");
    }
  };

  return (
    <div className={styles.profileContainer}>
      <h1>👤 Ваш Профиль</h1>

      {/* BALANCE */}
      <div className={styles.balanceCard}>
        <h2>Баланс:</h2>
        <p className={styles.balanceAmount}>⭐ {balance}</p>

        <div className={styles.actions}>
          <button onClick={() => setShowDepositModal(true)} className={styles.depositBtn}>
            Депозит
          </button>
          <button onClick={() => setShowWithdrawModal(true)} className={styles.withdrawBtn}>
            Вывод
          </button>
        </div>
      </div>

      {/* HISTORY */}
      <h2 className={styles.historyTitle}>Історія ігор</h2>
      <ul className={styles.historyList}>
        {history.length === 0 && <p>Еще нету истории...</p>}

        {history.slice(0, visibleCount).map((item, index) => (

          <li
            key={index}
            className={
              item.type === "Win"
                ? styles.winItem
                : item.type === "Loss"
                ? styles.lossItem
                : styles.withdrawItem
            }
          >
            <span className={styles.type}>
              {item.type === "Win"
                ? "⚽ Гол!"
                : item.type === "Loss"
                ? "❌ Промах"
                : "💸 Вывод"}
            </span>

            <span className={styles.details}>
              {item.amount > 0 ? `+${item.amount}` : item.amount}
              {item.multiplier && item.multiplier !== 1.0 ? ` (x${item.multiplier})` : ""}
            </span>

            <span className={styles.date}>
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
      {history.length > visibleCount && (
  <button
    className={styles.loadMoreBtn}
    onClick={() => setVisibleCount(prev => prev + 4)}
  >
    Показать еще ↓
  </button>
)}


      {message && <p className={styles.Message}>{message}</p>}

      {/* Deposit modal */}
      {showDepositModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>💰 Сума для депозита</h3>
            <div className={styles.starOptions}>
              {starOptions.map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedAmount(v)}
                  className={`${styles.starOption} ${amount === v ? styles.active : ""}`}
                >
                  ⭐ {v}
                </button>
              ))}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.confirmBtn} onClick={handleDeposit}>
                Потвердить
              </button>
              <button className={styles.cancelBtn} onClick={() => setShowDepositModal(false)}>
                Отменить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw modal */}
      {showWithdrawModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>💸 Сума для вывода</h3>
            <div className={styles.starOptions}>
              {starOptions.map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedAmount(v)}
                  className={`${styles.starOption} ${amount === v ? styles.active : ""}`}
                >
                  ⭐ {v}
                </button>
              ))}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.confirmBtn} onClick={handleWithdraw}>
                Потвердить
              </button>
              <button className={styles.cancelBtn} onClick={() => setShowWithdrawModal(false)}>
                Отменить
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
