import { SimulationResult } from '../types';
import { TestMessage, TestAnalyticsData } from '../../frontend/src/types/test';

export function convertToTestMessages(result: SimulationResult): TestMessage[] {
  const messages: TestMessage[] = [];

  // Converter rounds para mensagens
  result.interactions.rounds.forEach(round => {
    round.responses.forEach(response => {
      messages.push({
        type: 'message',
        content: response.response,
        personaId: response.personaId,
        personaName: response.personaId, // Será atualizado pelo frontend
        timestamp: new Date().toISOString(),
        metadata: {
          sentiment: response.sentiment,
          referencedPersonas: response.referencedPersonas,
          keyPoints: response.keyPoints,
          tags: [] // Pode ser preenchido baseado em análise do conteúdo
        }
      });
    });
  });

  // Adicionar mensagem de resumo
  messages.push({
    type: 'summary',
    content: result.summary.keyInsights.join('\n') + '\n\nRecommendations:\n' + result.summary.recommendations.join('\n'),
    personaId: 'system',
    personaName: 'System',
    timestamp: new Date().toISOString(),
    metadata: {
      sentiment: result.summary.consensusScore,
      keyPoints: result.summary.keyInsights,
      tags: []
    }
  });

  return messages;
}

export function convertToTestAnalytics(result: SimulationResult): TestAnalyticsData {
  return {
    overallSentiment: result.summary.consensusScore,
    participationStats: result.individualAnalysis.map(analysis => ({
      personaId: analysis.personaId,
      messageCount: result.interactions.rounds.reduce((count, round) => 
        count + round.responses.filter(r => r.personaId === analysis.personaId).length, 0),
      averageSentiment: analysis.overallSentiment
    })),
    keyInsights: result.summary.keyInsights,
    topTags: result.summary.recommendations
  };
}
