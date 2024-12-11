import axios from 'axios';
import { ApiError } from '../utils/errors';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
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
    const apiError = ApiError.fromAxiosError(error);
    
    // Log error with relevant information only
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: apiError.status,
      code: apiError.code,
      message: apiError.message,
      ...(apiError.details && { details: apiError.details })
    });
    
    // Handle authentication errors
    if (apiError.status === 401 && !error.config?.url?.includes('/auth/login')) {
      console.log('Unauthorized request, clearing token');
      localStorage.removeItem('token');
      // Não redirecionar automaticamente, deixar o AuthContext lidar com isso
      return Promise.reject(apiError);
    }
    
    throw apiError;
  }
);

export const deleteTestMessage = async (testId: string, messageId: string): Promise<void> => {
  const response = await api.delete(`/tests/${testId}/messages/${messageId}`);
  return response.data;
};

export default api;
