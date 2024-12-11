export interface User {
  id: string;
  email: string;
  company: string;
  role: 'user' | 'admin';
  workspace_id: string;
  api_quota: number;
  created_at: Date;
}

export interface Persona {
  id: string;
  name: string;
  age: number;
  occupation: string;
  income: string;
  location: string;
  familyStatus: string;
  education: string;
  dailyRoutine: string;
  challenges: string[];
  goals: string[];
  frustrations: string[];
  interests: string[];
  habits: string[];
  digitalSkills: string;
  spendingHabits: string;
  decisionFactors: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  steps: string[];
}

export interface TestResult {
  id: string;
  test_id: string;
  persona_id: string;
  responses: Array<{
    step: number;
    response: string;
    sentiment: number;
    timestamp: Date;
  }>;
}

export interface Test {
  id: string;
  name: string;
  type: 'product' | 'message' | 'journey';
  language: 'pt-BR' | 'en';
  status: 'draft' | 'running' | 'completed';
  config: {
    personas: string[];
    scenarios: TestScenario[];
    environment: string;
    timeout: number;
  };
  tiny_troupe_session: {
    world_id: string;
    cache_file: string;
    step_count: number;
  };
  results: TestResult[];
  workspace_id: string;
}
