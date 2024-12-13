export interface TestMessage {
  id: string;
  test_id: string;
  persona_id: string;
  first_impression: string;
  benefits: string[];
  concerns: string[];
  decision_factors: string[];
  suggestions: string[];
  tags: {
    negative: string[];
    positive: string[];
    opportunity: string[];
  };
  personal_context: {
    digitalComfort: string;
    routineAlignment: string;
    locationRelevance: string;
    familyConsideration: string;
    financialPerspective: string;
  };
  target_audience_alignment: {
    ageMatch: string;
    locationMatch: string;
    incomeMatch: string;
    interestOverlap: string;
    painPointRelevance: string;
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

export interface TestAnalyticsData {
  overallSentiment: number;
  participationStats: {
    personaId: string;
    messageCount: number;
    averageSentiment: number;
  }[];
}

export interface TestViewOptions {
  viewMode: 'timeline' | 'grouped' | 'summary';
  groupBy: 'persona';
  sortBy: 'time';
}
