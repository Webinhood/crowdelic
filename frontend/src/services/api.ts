import axios from 'axios';
import { ApiError } from '../utils/errors';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000 // 5 minutos
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  throw ApiError.fromAxiosError(error);
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid or expired, clear it
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    throw ApiError.fromAxiosError(error);
  }
);

export const deleteTestMessage = async (testId: string, messageId: string): Promise<void> => {
  await api.delete(`/tests/${testId}/messages/${messageId}`);
};

export default api;
