// src/api/api.ts
import axios from 'axios';
import { Card } from '../context/AppContext';

const api = axios.create({
  baseURL: 'http://192.168.1.110:3000', // kendi backend URL'inle değiştir
  timeout: 5000,
});

export const createCard = (userId: string) =>
  api.post<{ card: Card }>('/card/create', { userId });

export const loadBalance = (userId: string, amount: number) =>
  api.post<{ newBalance: number }>('/balance/load', { userId, amount });

export const makePayment = (userId: string, token: string, amount: number) =>
  api.post<{ success: boolean; newBalance: number }>('/payment/nfc', {
    userId,
    token,
    amount,
  });