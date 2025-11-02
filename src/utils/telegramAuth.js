// src/utils/telegramAuth.js
import axios from 'axios';

const API_URL = 'https://football-back-4jkg.onrender.com/api/auth';

export async function loginViaTelegram() {
  const tg = window.Telegram.WebApp;
  if (!tg) throw new Error('Telegram WebApp not found');

  const userData = tg.initDataUnsafe;

  const res = await axios.post(`${API_URL}/login`, userData);
  localStorage.setItem('token', res.data.token);
  return res.data.token;
}

export function getToken() {
  return localStorage.getItem('token');
}
