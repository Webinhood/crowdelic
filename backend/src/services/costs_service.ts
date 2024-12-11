import { Pool } from 'pg';
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
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB
    });

    // Create usage_logs table if it doesn't exist
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    const client = await this.pool.connect();
    try {
      // Primeiro, verificar se a tabela existe
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'usage_logs'
        );
      `);

      if (tableExists.rows[0].exists) {
        // Se a tabela existe, verificar se a coluna test_id existe
        const columnExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'usage_logs'
            AND column_name = 'test_id'
          );
        `);

        if (!columnExists.rows[0].exists) {
          // Se a coluna não existe, adicioná-la
          await client.query(`
            ALTER TABLE usage_logs
            ADD COLUMN test_id TEXT;
          `);
        }
      } else {
        // Se a tabela não existe, criá-la
        await client.query(`
          CREATE TABLE usage_logs (
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            model VARCHAR(50) NOT NULL,
            prompt_tokens INTEGER NOT NULL,
            completion_tokens INTEGER NOT NULL,
            total_tokens INTEGER NOT NULL,
            cost DECIMAL(10, 6) NOT NULL,
            test_id TEXT
          );
        `);
      }
    } finally {
      client.release();
    }
  }

  public async logUsage(
    model: string, 
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number },
    testId?: string
  ) {
    const modelCosts = MODEL_COSTS[model] || MODEL_COSTS.default;
    const cost = (
      (usage.prompt_tokens * modelCosts.input + 
       usage.completion_tokens * modelCosts.output) / 1000
    );

    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO usage_logs (model, prompt_tokens, completion_tokens, total_tokens, cost, test_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [model, usage.prompt_tokens, usage.completion_tokens, usage.total_tokens, cost, testId || null]
      );
    } finally {
      client.release();
    }
  }

  public async getUsageStats(): Promise<UsageStats> {
    const client = await this.pool.connect();
    try {
      // Get data for the last 30 days
      const result = await client.query<UsageData>(`
        SELECT 
          DATE_TRUNC('day', timestamp) as timestamp,
          model,
          SUM(prompt_tokens + completion_tokens) as total_tokens,
          COUNT(*) as request_count,
          SUM(cost) as cost
        FROM usage_logs
        WHERE timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', timestamp), model
        ORDER BY timestamp DESC
      `);

      const dailyCosts: { [key: string]: DailyCost } = {};
      const modelCosts: { [key: string]: ModelCost } = {};
      let totalUsage = 0;

      result.rows.forEach(row => {
        const date = row.timestamp.toISOString().split('T')[0];
        
        // Aggregate daily costs
        if (!dailyCosts[date]) {
          dailyCosts[date] = {
            timestamp: date,
            request_count: 0,
            token_count: 0,
            cost: 0
          };
        }
        dailyCosts[date].request_count += Number(row.request_count);
        dailyCosts[date].token_count += Number(row.total_tokens);
        dailyCosts[date].cost += Number(row.cost);

        // Aggregate model costs
        if (!modelCosts[row.model]) {
          modelCosts[row.model] = {
            model: row.model,
            token_count: 0,
            cost: 0
          };
        }
        modelCosts[row.model].token_count += Number(row.total_tokens);
        modelCosts[row.model].cost += Number(row.cost);

        totalUsage += Number(row.cost);
      });

      return {
        total_usage: totalUsage,
        daily_costs: Object.values(dailyCosts),
        model_costs: Object.values(modelCosts)
      };
    } finally {
      client.release();
    }
  }

  public async getTestUsageStats(testId: string): Promise<TestUsageStats> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          model,
          SUM(total_tokens) as total_tokens,
          SUM(cost) as total_cost
        FROM usage_logs
        WHERE test_id = $1
        GROUP BY model
      `, [testId]);

      const modelBreakdown = result.rows.map(row => ({
        model: row.model,
        tokens: parseInt(row.total_tokens),
        cost: parseFloat(row.total_cost)
      }));

      const totals = modelBreakdown.reduce(
        (acc, curr) => ({
          total_tokens: acc.total_tokens + curr.tokens,
          total_cost: acc.total_cost + curr.cost
        }),
        { total_tokens: 0, total_cost: 0 }
      );

      return {
        ...totals,
        model_breakdown: modelBreakdown
      };
    } finally {
      client.release();
    }
  }
}
