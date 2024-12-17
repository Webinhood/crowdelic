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
    digital_comfort: string;
    routine_alignment: string;
    location_relevance: string;
    family_consideration: string;
    financial_perspective: string;
  };
  target_audience_alignment: {
    age_match: string;
    location_match: string;
    income_match: string;
    interest_overlap: string;
    pain_point_relevance: string;
  };
  metadata: {
    sentiment: number;
    confidence: number;
    value_proposition: number;
    personal_relevance: number;
    implementation_feasibility: number;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TestAnalyticsData {
  overall_sentiment: number;
  participation_stats: {
    persona_id: string;
    message_count: number;
    average_sentiment: number;
  }[];
}

export interface TestViewOptions {
  view_mode: 'timeline' | 'grouped' | 'summary';
  group_by: 'persona';
  sort_by: 'time';
}
