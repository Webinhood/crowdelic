export interface TestMessage {
  id: string;  // Adicionando ID único
  type: 'message' | 'interaction' | 'summary';
  content: string;
  personaId: string;
  personaName: string;
  timestamp: string;
  metadata?: {
    sentiment: number;
    referencedPersonas?: string[];
    keyPoints?: string[];
    tags?: string[];
  };
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
