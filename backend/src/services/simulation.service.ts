import { SimulationResult } from '../types';
import { convertToTestMessages, convertToTestAnalytics } from '../utils/simulationAdapter';
import { TestMessage, TestAnalyticsData } from '../../frontend/src/types/test';

export class SimulationService {
  async runSimulation(testId: string): Promise<{
    messages: TestMessage[];
    analytics: TestAnalyticsData;
  }> {
    try {
      // Aqui vai a lógica existente de simulação, mas agora retornando SimulationResult
      const result: SimulationResult = await this.executeSimulation(testId);
      
      // Converter para o formato atual
      return {
        messages: convertToTestMessages(result),
        analytics: convertToTestAnalytics(result)
      };
    } catch (error) {
      console.error('Error running simulation:', error);
      throw error;
    }
  }

  private async executeSimulation(testId: string): Promise<SimulationResult> {
    // Implementação existente da simulação, mas retornando o novo formato
    // Por enquanto, manteremos a lógica atual e adaptaremos o resultado
    // TODO: Atualizar a implementação para usar diretamente o novo formato
    return {
      summary: {
        totalParticipants: 0,
        consensusScore: 0,
        keyInsights: [],
        recommendations: []
      },
      interactions: {
        rounds: []
      },
      individualAnalysis: []
    };
  }
}
