import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config();

interface UsageData {
  timestamp: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost: number;
}

interface DailyCost {
  timestamp: string;
  request_count: number;
  token_count: number;
  cost: number;
}

interface ModelCost {
  model: string;
  token_count: number;
  cost: number;
}

interface UsageStats {
  total_usage: number;
  daily_costs: DailyCost[];
  model_costs: ModelCost[];
}

interface TestUsageStats {
  total_tokens: number;
  total_cost: number;
  model_breakdown: { model: string; tokens: number; cost: number }[];
}

// Token costs per model (in USD per 1K tokens)
const MODEL_COSTS = {
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'default': { input: 0.0015, output: 0.002 } // default to gpt-3.5-turbo prices
};

export class CostsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async logUsage(data: UsageData & { testId?: string; userId?: string }) {
    try {
      console.log('Logging usage data:', data);
      // Temporariamente apenas logando os dados
      return {
        id: 'temp-' + Date.now(),
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error) {
      console.error('Error logging usage:', error);
      // Não propagar o erro para não interromper o fluxo
      return null;
    }
  }

  async getTestUsage(testId: string): Promise<TestUsageStats> {
    try {
      console.log('Getting test usage for test ID:', testId);
      const logs = await this.prisma.usageLog.findMany({
        where: {
          test_id: testId
        }
      });
      console.log('Test usage logs retrieved:', logs);

      const modelBreakdown = logs.reduce((acc: { [key: string]: { tokens: number; cost: number } }, log) => {
        if (!acc[log.model]) {
          acc[log.model] = { tokens: 0, cost: 0 };
        }
        acc[log.model].tokens += log.total_tokens;
        acc[log.model].cost += Number(log.cost);
        return acc;
      }, {});

      return {
        total_tokens: logs.reduce((sum, log) => sum + log.total_tokens, 0),
        total_cost: logs.reduce((sum, log) => sum + Number(log.cost), 0),
        model_breakdown: Object.entries(modelBreakdown).map(([model, stats]) => ({
          model,
          tokens: stats.tokens,
          cost: stats.cost
        }))
      };
    } catch (error) {
      console.error('Error getting test usage:', error);
      throw error;
    }
  }

  async getUserUsage(userId: string, startDate?: string, endDate?: string): Promise<UsageStats> {
    try {
      console.log('Getting user usage for user ID:', userId);
      const whereClause: any = { user_id: userId };
      if (startDate && endDate) {
        whereClause.timestamp = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      const logs = await this.prisma.usageLog.findMany({
        where: whereClause,
        orderBy: {
          timestamp: 'asc'
        }
      });
      console.log('User usage logs retrieved:', logs);

      const dailyCosts: { [key: string]: DailyCost } = {};
      const modelCosts: { [key: string]: ModelCost } = {};
      let totalUsage = 0;

      logs.forEach(log => {
        const day = log.timestamp.toISOString().split('T')[0];
        totalUsage += Number(log.cost);

        // Aggregate daily costs
        if (!dailyCosts[day]) {
          dailyCosts[day] = {
            timestamp: day,
            request_count: 0,
            token_count: 0,
            cost: 0
          };
        }
        dailyCosts[day].request_count++;
        dailyCosts[day].token_count += log.total_tokens;
        dailyCosts[day].cost += Number(log.cost);

        // Aggregate model costs
        if (!modelCosts[log.model]) {
          modelCosts[log.model] = {
            model: log.model,
            token_count: 0,
            cost: 0
          };
        }
        modelCosts[log.model].token_count += log.total_tokens;
        modelCosts[log.model].cost += Number(log.cost);
      });

      return {
        total_usage: totalUsage,
        daily_costs: Object.values(dailyCosts),
        model_costs: Object.values(modelCosts)
      };
    } catch (error) {
      console.error('Error getting user usage:', error);
      throw error;
    }
  }

  calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const costs = MODEL_COSTS[model] || MODEL_COSTS.default;
    const promptCost = (promptTokens / 1000) * costs.input;
    const completionCost = (completionTokens / 1000) * costs.output;
    return promptCost + completionCost;
  }
}
