import api from './api';
import { UsageStats } from '@types/costs';

interface TestUsageStats {
  total_tokens: number;
  total_cost: number;
  model_breakdown: {
    model: string;
    tokens: number;
    cost: number;
  }[];
}

export const getUsageStats = async (): Promise<UsageStats> => {
  const response = await api.get('/costs/usage');
  return response.data;
};

export const getTestUsageStats = async (testId: string): Promise<TestUsageStats> => {
  const response = await api.get(`/costs/test/${testId}/usage`);
  return response.data;
};
