// src/components/Layout/Layout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import styles from './Layout.module.css';

export default function Layout() {
  return (
    <div className={styles.appContainer}>
      <Header />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}