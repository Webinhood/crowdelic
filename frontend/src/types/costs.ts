export interface DailyCost {
  date: string;
  cost: number;
}

export interface CostsByModel {
  [key: string]: number;
}

export interface TotalCosts {
  last_24h: number;
  last_7d: number;
  last_30d: number;
}

export interface CostSummary {
  total_costs: TotalCosts;
  costs_by_model: CostsByModel;
  daily_trend: DailyCost[];
}

export interface LineItem {
  timestamp: string;
  model: string;
  cost: number;
  tokens: number;
  request_type: string;
}

export interface CostsResponse {
  line_items: LineItem[];
  total_cost: number;
}

export interface UsageStats {
  total_usage: number;
  daily_costs: {
    timestamp: string;
    request_count: number;
    token_count: number;
    cost: number;
  }[];
  model_costs: {
    model: string;
    token_count: number;
    cost: number;
  }[];
}
