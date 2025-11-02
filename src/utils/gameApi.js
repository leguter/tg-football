// src/utils/gameApi.js
import axios from 'axios';
import { getToken } from './telegramAuth';

const API_URL = 'http://localhost:4000/api/game';

function getAuthHeader() {
  const token = getToken();
  return { Authorization: `Bearer ${token}` };
}

export const startGame = () => axios.post(`${API_URL}/start`, {}, { headers: getAuthHeader() }).then(res => res.data);

export const shoot = angle => axios.post(`${API_URL}/shoot`, { angle }, { headers: getAuthHeader() }).then(res => res.data);

export const cashout = () => axios.post(`${API_URL}/cashout`, {}, { headers: getAuthHeader() }).then(res => res.data);
