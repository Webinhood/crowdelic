  import api from './api';

export interface Test {
  id: string;
  title: string;
  description: string;
  objective: string;
  settings: {
    maxIterations: number;
    responseFormat: 'detailed' | 'summary' | 'structured';
    interactionStyle: 'natural' | 'formal' | 'casual';
  };
  topics: string[];
  personaIds: string[];
  scenarios?: {
    description: string;
    expectedOutcome?: string;
  }[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: TestResult[];
  createdAt: string;
  updatedAt: string;
  context?: {
    background: string;
    goals: string[];
    interests: string[];
  };
  language?: string;
  targetAudience?: {
    ageRange?: string;
    location?: string;
    income?: string;
    interests?: string[];
    painPoints?: string[];
    needs?: string[];
  };
}

export interface TestResult {
  personaId: string;
  feedback: string;
  rating: number;
  timestamp: string;
  scenario?: string;
  response?: string;
  context?: {
    background: string;
    goals: string[];
    interests: string[];
  };
}

export interface LiveMessage {
  type: 'message';
  content: string;
  persona: string;
  scenario: string;
  timestamp: string;
}

export interface TestMessage {
  id: string;
  test_id: string;
  persona_id: string;
  first_impression: string;
  personal_context: {
    digitalComfort: string;
    routineAlignment: string;
    locationRelevance: string;
    familyConsideration: string;
    financialPerspective: string;
  };
  benefits: string[];
  concerns: string[];
  decision_factors: string[];
  suggestions: string[];
  target_audience_alignment: {
    ageMatch: string;
    locationMatch: string;
    incomeMatch: string;
    interestOverlap: string;
    painPointRelevance: string;
  };
  tags: {
    negative: string[];
    positive: string[];
    opportunity: string[];
  };
  metadata: {
    sentiment: number;
    confidence: number;
    valueProposition: number;
    personalRelevance: number;
    implementationFeasibility: number;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateTestData {
  title: string;
  description: string;
  objective: string;
  settings: {
    maxIterations: number;
    responseFormat: string;
    interactionStyle: string;
  };
  topics: string[];
  personaIds: string[];
  context?: {
    platform: string;
    timing: string;
    situation: string;
  };
  content?: {
    type: string;
    description: string;
    url?: string;
    message?: string;
  };
  language?: string;
  targetAudience?: {
    ageRange?: string;
    location?: string;
    income?: string;
    interests?: string[];
    painPoints?: string[];
    needs?: string[];
  };
}

export const getTests = async (): Promise<Test[]> => {
  console.log('API getTests called');
  try {
    const response = await api.get<Test[]>('/tests');
    console.log('API getTests response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API getTests error:', error);
    throw error;
  }
};

export const getTest = async (id: string): Promise<Test> => {
  console.log('API getTest called with id:', id);
  try {
    const response = await api.get<Test>(`/tests/${id}`);
    console.log('API getTest response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API getTest error:', error);
    throw error;
  }
};

export const createTest = async (data: CreateTestData): Promise<Test> => {
  console.log('API createTest called with:', data);
  // Converter camelCase para snake_case
  const formattedData = {
    ...data,
    target_audience: data.targetAudience ? {
      age_range: data.targetAudience.ageRange,
      location: data.targetAudience.location,
      income: data.targetAudience.income,
      interests: data.targetAudience.interests,
      pain_points: data.targetAudience.painPoints,
      needs: data.targetAudience.needs
    } : undefined
  };

  try {
    const response = await api.post<Test>('/tests', formattedData);
    console.log('API createTest response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API createTest error:', error);
    throw error;
  }
};

export const updateTest = async (id: string, data: Partial<Test>): Promise<Test> => {
  console.log('=== DEBUG UPDATE TEST ===');
  console.log('ID:', id);
  console.log('Data completa:', JSON.stringify(data, null, 2));
  console.log('Target Audience:', JSON.stringify(data.targetAudience, null, 2));
  
  // Converter para snake_case manualmente
  const formattedData = {
    title: data.title,
    description: data.description,
    objective: data.objective,
    settings: data.settings,
    topics: data.topics,
    persona_ids: data.personaIds,
    target_audience: data.targetAudience ? {
      age_range: data.targetAudience.ageRange || '',
      location: data.targetAudience.location || '',
      income: data.targetAudience.income || '',
      interests: data.targetAudience.interests || [],
      pain_points: data.targetAudience.painPoints || [],
      needs: data.targetAudience.needs || []
    } : undefined,
    language: data.language
  };

  console.log('Dados formatados para API:', JSON.stringify(formattedData, null, 2));

  try {
    const response = await api.put<Test>(`/tests/${id}`, formattedData);
    console.log('Resposta da API:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar teste:', error);
    throw error;
  }
};

export const deleteTest = async (id: string): Promise<void> => {
  await api.delete(`/tests/${id}`);
};

export async function runTest(id: string, language: string = 'pt-BR'): Promise<Test> {
  console.log('Iniciando teste:', id);
  try {
    const response = await api.post(`/tests/${id}/run`, { language });
    console.log('Resposta do servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao executar teste:', error);
    throw error;
  }
};

export const stopTest = async (id: string): Promise<Test> => {
  const response = await api.post<Test>(`/tests/${id}/stop`);
  return response.data;
};

export const getTestResults = async (id: string): Promise<TestResult[]> => {
  const response = await api.get<TestResult[]>(`/tests/${id}/results`);
  return response.data;
};

export const getLiveMessages = async (id: string): Promise<LiveMessage[]> => {
  const response = await api.get<LiveMessage[]>(`/tests/${id}/live-messages`);
  return response.data;
};

export const getTestMessages = async (testId: string): Promise<TestMessage[]> => {
  console.log('API getTestMessages called with id:', testId);
  try {
    const response = await api.get<TestMessage[]>(`/tests/${testId}/messages`);
    console.log('API getTestMessages response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API getTestMessages error:', error);
    throw error;
  }
};

export const deleteTestMessage = async (testId: string, messageId: string): Promise<void> => {
  console.log('API deleteTestMessage called with:', { testId, messageId });
  try {
    await api.delete(`/tests/${testId}/messages/${messageId}`);
    console.log('API deleteTestMessage success');
  } catch (error) {
    console.error('API deleteTestMessage error:', error);
    throw error;
  }
};

export async function checkTitleExists(title: string, excludeId?: string): Promise<boolean> {
  try {
    const response = await api.get(`/tests/check-title?title=${encodeURIComponent(title)}${excludeId ? `&excludeId=${excludeId}` : ''}`);
    return response.data.exists;
  } catch (error) {
    console.error('Error checking title:', error);
    throw error;
  }
}
