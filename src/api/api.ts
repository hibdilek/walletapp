// src/api/api.ts
import axios from 'axios';
import { Card } from '../context/AppContext';

const api = axios.create({
  baseURL: 'http://192.168.1.110:3000', // kendi backend URL'inle değiştir
  timeout: 5000,
});

export const createCard = (userId: string) =>
  api.post<{ card: Card }>('/card/create', { userId });

// src/api/api.ts
export const loadBalance = (userId: string, amount: number, cardToken: string) => {
  return api.post(`/loadBalance`, { userId, amount, cardToken });
};

export const makePayment = (userId: string, token: string, amount: number) =>
  api.post<{ success: boolean; newBalance: number }>('/payment/nfc', {
    userId,
    token,
    amount,
  });