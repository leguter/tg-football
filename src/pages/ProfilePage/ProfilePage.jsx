import { useState,useEffect } from "react";
import styles from "./ProfilePage.module.css";
import api from "../../api";

export default function ProfilePage({user}) {
  const [balance, setBalance] = useState(1500);
  const [history, setHistory] = useState([
    { id: 1, type: "Win", amount: 350, date: "2025-10-30", multiplier: "x1.4" },
    { id: 2, type: "Loss", amount: 100, date: "2025-10-30", multiplier: "x1.0" },
  ]);
  // console.log(user)
  useEffect(() => {
    if (user?.user?.balance !== undefined) {
      setBalance(user.user.balance);
    }
  }, [user]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setSelectedAmount] = useState(100);
  const [message, setMessage] = useState("");
  //   const [loading, setLoading] = useState(false);
  // const [selected, setSelected] = useState(null);
  // const [balance, setBalance] = useState(0);
  // Вибір можливих сум
  const starOptions = [1, 50, 100, 500, 1000];

  // ==============================
  // 💰 Депозит (через бекенд)
  // ==============================
// const handleDeposit = async () => {
//   try {
//     const res = await api.post(
//       "/api/stars/deposit",
//       { amount: selectedAmount },
//       { withCredentials: true }
//     );

//     if (res.data.success) {
//       const invoiceLink = res.data.invoice_link;
//       const tg = window.Telegram?.WebApp;

//       // ✅ Відкриваємо Telegram Invoice меню прямо в Mini App
//       if (tg && tg.openInvoice) {
//         tg.openInvoice(invoiceLink, async (status) => {
//           console.log("🧾 Telegram invoice status:", status);

//           if (status === "paid") {
//             try {
//               const completeRes = await api.post("/api/stars/complete", { amount: selectedAmount });
//               setBalance(completeRes.data.internal_stars);
//               alert("✅ Оплата успішна! Баланс оновлено.");
//             } catch (err) {
//               console.error("Error after payment:", err);
//               alert("Помилка при оновленні балансу після оплати!");
//             }
//           } else if (status === "failed") {
//             alert("❌ Оплата не пройшла.");
//           } else if (status === "cancelled") {
//             alert("❌ Ви скасували оплату.");
//           }
//         });
//       } else {
//         // fallback — якщо користувач не в Telegram Mini App
//         window.open(invoiceLink, "_blank");
//       }

//       setHistory((prev) => [
//         {
//           id: Date.now(),
//           type: "Deposit",
//           amount: selectedAmount,
//           date: new Date().toISOString().slice(0, 10),
//           multiplier: "-",
//         },
//         ...prev,
//       ]);
//       setShowDepositModal(false);
//     } else {
//       alert("Не вдалося створити депозит!");
//     }
//   } catch (err) {
//     console.error("Deposit error:", err);
//     alert("Помилка при створенні депозиту!");
//   }
// };
const handleDeposit = async () => {


    // setLoading(true);
    // setSelected(amount);
    setMessage("");

    try {
      const res = await api.post("/api/stars/deposit", { amount });
      if (!res.data?.success) return setMessage("Failed to create invoice");

      const { invoice_link, payload } = res.data;
      setMessage("💳 We open the payment...");

      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.openInvoice(invoice_link);

        const onInvoiceClosed = async (eventData) => {
          tg.offEvent("invoiceClosed", onInvoiceClosed);

          if (eventData.status === "paid") {
            setMessage("✅ Payment is completed. We are checking the server...");

            try {
              const completeRes = await api.post("/api/stars/complete", { payload });
              if (completeRes.data?.success) {
                setBalance(completeRes.data.balance);
                setMessage("💰 Balance updated!");
              } else {
                setMessage("❌ Payment is not confirmed on the server");
              }
            } catch (err) {
              console.error(err);
              setMessage("⚠️ It was not possible to restore the balance");
            }
          } else {
            setMessage("❌ Payment declined or not completed");
          }
        };

        tg.onEvent("invoiceClosed", onInvoiceClosed);
      } else {
        window.open(invoice_link, "_blank");
        setMessage("Відкрито у новому вікні. Баланс оновиться після підтвердження платежу на сервері.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Помилка при створенні інвойсу");
    } finally {
      // setLoading(false);
    }
  };


  // ==============================
  // 💸 Вивід (через бекенд)
  // ==============================
  const handleWithdraw = async () => {
    try {
      const res = await api.post(
        "/api/stars/withdraw",
        { amount: amount },
        { withCredentials: true }
      );

      if (res.data.success) {
        setBalance(res.data.internal_stars);
        setShowWithdrawModal(false);
        setHistory((prev) => [
          {
            id: Date.now(),
            type: "Withdraw",
            amount: amount,
            date: new Date().toISOString().slice(0, 10),
            multiplier: "-",
          },
          ...prev,
        ]);
      } else {
        alert(res.data.message || "Помилка при виводі!");
      }
    } catch (err) {
      console.error("Withdraw error:", err);
      alert("Помилка при виводі зірок!");
    }
  };

  return (
    <div className={styles.profileContainer}>
      <h1>👤 Ваш Профиль</h1>

      <div className={styles.balanceCard}>
        <h2>Баланс:</h2>
        <p className={styles.balanceAmount}>⭐ {balance}</p>

        <div className={styles.actions}>
          <button
            onClick={() => setShowDepositModal(true)}
            className={styles.depositBtn}
          >
            Депозит
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className={styles.withdrawBtn}
          >
            Вывод
          </button>
        </div>
      </div>

      <h2 className={styles.historyTitle}>Історія ігор</h2>
      <ul className={styles.historyList}>
        {history.map((item) => (
          <li
            key={item.id}
            className={
              item.type === "Win"
                ? styles.winItem
                : item.type === "Loss"
                ? styles.lossItem
                : item.type === "Deposit"
                ? styles.depositItem
                : styles.withdrawItem
            }
          >
            <span className={styles.type}>
              {item.type === "Win"
                ? "✅ ВЫИГРАШ"
                : item.type === "Loss"
                ? "❌ ПРОИГРАШ"
                : item.type === "Deposit"
                ? "💰 ДЕПОЗИТ"
                : "💸 ВИВОД"}
            </span>
            <span className={styles.details}>
              {item.type === "Win"
                ? `+${item.amount} (${item.multiplier})`
                : item.type === "Loss"
                ? `-${item.amount}`
                : item.type === "Deposit"
                ? `+${item.amount}`
                : `-${item.amount}`}{" "}
              звезд
            </span>
            <span className={styles.date}>{item.date}</span>
          </li>
        ))}
      </ul>

      {/* --- Deposit Modal --- */}
      {showDepositModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>💰 Выберите сумму для депозита</h3>
            <div className={styles.starOptions}>
              {starOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`${styles.starOption} ${
                    amount === amount ? styles.active : ""
                  }`}
                >
                  ⭐ {amount}
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleDeposit} className={styles.confirmBtn}>
                Подтвердить
              </button>
              <button
                onClick={() => setShowDepositModal(false)}
                className={styles.cancelBtn}
              >
                Отменить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Withdraw Modal --- */}
      {showWithdrawModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>💸 Выберите сумму для вывода</h3>
            <div className={styles.starOptions}>
              {starOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`${styles.starOption} ${
                    amount === amount ? styles.active : ""
                  }`}
                >
                  ⭐ {amount}
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleWithdraw} className={styles.confirmBtn}>
                Подтвердить
              </button>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className={styles.cancelBtn}
              >
                Отменить
              </button>
            </div>
          </div>
        </div>
      )}
      {message && <p className={styles.Message}>{message}</p>}
    </div>
    
  );
}
