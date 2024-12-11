import { OpenAI } from 'openai';
import { Pool } from 'pg';
import { createLogger } from '../utils/logger';
import { formatSystemPrompt, formatUserPrompt } from './prompt_template';
import { z } from 'zod';
import { pool } from '../config/database';

const pool = new Pool({
  user: 'crowdelic',
  host: 'localhost',
  database: 'crowdelic',
  password: 'crowdelic',
  port: 5432,
});

// Interfaces para tipagem forte
interface TestResponse {
  content: string;
  metadata: {
    sentiment: number;
    keyPoints: string[];
    tags: string[];
    confidence: number;
    context: {
      role: string;
      objective: string;
      perspective: string;
    }
  }
}

interface Persona {
  id: string;
  name: string;
  description: string;
  age: number;
  occupation: string;
  income: string;
  location: string;
  family_status: string;
  education: string;
  daily_routine: string;
  challenges: string;
  goals: string[];
  frustrations: string;
  interests: string[];
  habits: string;
  digital_skills: string;
  spending_habits: string;
  decision_factors: string;
  background_story: string;
  personality_traits: string;
}

interface Test {
  id: string;
  title: string;
  objective: string;
  targetAudience: {
    ageRange: string;
    location: string;
    income: string;
    interests: string[];
    painPoints: string[];
    needs: string[];
  };
  content: {
    type: string;
    description: string;
    url?: string;
    message?: string;
  };
  context: {
    platform: string;
    timing: string;
    situation: string;
  };
  name: string;
  description: string;
  additional_context: string;
}

interface CostsService {
  logUsage(model: string, usage: any, testId?: string): Promise<void>;
}

// Define schemas for validation
const metadataSchema = z.object({
  sentiment: z.number().min(0).max(10),
  confidence: z.number().min(0).max(10),
  context: z.object({
    role: z.string(),
    objective: z.string(),
    perspective: z.string()
  })
});

const tagsSchema = z.object({
  negative: z.array(z.string()),
  positive: z.array(z.string()),
  opportunity: z.array(z.string())
});

const responseSchema = z.object({
  firstImpression: z.string(),
  personalContext: z.record(z.any()),
  benefits: z.array(z.string()),
  concerns: z.array(z.string()),
  decisionFactors: z.array(z.string()),
  suggestions: z.array(z.string()),
  targetAudienceAlignment: z.record(z.any()),
  tags: tagsSchema,
  metadata: metadataSchema
}).strict(); // Não permite campos extras

type SimulationResponse = z.infer<typeof responseSchema>;

export class TinyTroupeService {
  private openai: OpenAI;
  private costsService: CostsService;
  private eventCallback?: (event: string, data: any) => void;
  private logger: any;

  constructor(openai: OpenAI, costsService: CostsService) {
    this.openai = openai;
    this.costsService = costsService;
    this.logger = createLogger('TinyTroupeService');
  }

  setEventCallback(callback: (event: string, data: any) => void) {
    this.eventCallback = callback;
  }

  private emitEvent(event: string, data: any) {
    if (this.eventCallback) {
      this.eventCallback(event, data);
    }
  }

  private async analyzeTest(persona: any, test: any): Promise<any> {
    const messages = [
      { 
        role: 'system', 
        content: formatSystemPrompt(persona)
      },
      { 
        role: 'user', 
        content: formatUserPrompt(test)
      }
    ];

    console.log('\n🔍 ================== OPENAI INPUT START ==================');
    console.log('📝 Persona:', persona.name);
    console.log('📋 Test:', test.title);
    console.log('📨 Messages:', JSON.stringify(messages, null, 2));
    console.log('================== OPENAI INPUT END ==================== 🔍\n');

    try {
      const completion = await this.openai.chat.completions.create({
        messages,
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2500,
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      await this.savePersonaAnalysis(persona.id, test.id, analysis);

      return analysis;
    } catch (error) {
      this.logger.error('Error creating analysis:', error);
      this.logger.error('Error details:', error.message);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  private fixResponseFormat(rawResponse: string): SimulationResponse {
    try {
      console.log('Raw response:', rawResponse);
      
      // Remove markdown code block indicators if present
      let cleanResponse = rawResponse;
      if (rawResponse.includes('```json')) {
        cleanResponse = rawResponse
          .replace(/```json\n/, '')
          .replace(/\n```/, '')
          .trim();
      }
      
      console.log('Cleaned response:', cleanResponse);
      const parsed = JSON.parse(cleanResponse);
      console.log('Parsed JSON:', parsed);
      
      // Apenas validar com Zod, sem tentar reformatar
      return responseSchema.parse(parsed);
    } catch (error) {
      console.error('Error in fixResponseFormat:', error);
      console.error('Raw response that caused error:', rawResponse);
      
      if (error instanceof z.ZodError) {
        throw new Error('Invalid response format: ' + error.errors.map(e => e.message).join(', '));
      }
      
      if (error instanceof SyntaxError) {
        // Tentar extrair apenas a parte JSON se houver outros caracteres
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return this.fixResponseFormat(jsonMatch[0]);
          } catch (e) {
            console.error('Failed to parse extracted JSON:', e);
          }
        }
        throw new Error('Invalid JSON format: ' + error.message);
      }
      
      throw error;
    }
  }

  private async getPersonaData(personaId: string): Promise<any> {
    try {
      const result = await pool.query(
        `SELECT * FROM personas WHERE id = $1`,
        [personaId]
      );

      if (result.rows.length === 0) {
        throw new Error(`Persona not found: ${personaId}`);
      }

      // Parse JSON fields if they are strings
      const persona = result.rows[0];
      const parseJsonField = (field: any, defaultValue: any = []) => {
        if (!field) return defaultValue;
        return typeof field === 'string' ? JSON.parse(field) : field;
      };

      return {
        ...persona,
        interests: parseJsonField(persona.interests),
        goals: parseJsonField(persona.goals)
      };
    } catch (error) {
      this.logger.error('Error fetching persona data:', error);
      throw error;
    }
  }

  private async generateResponse(personaId: string, test: Test, config: any): Promise<any> {
    try {
      // Buscar dados completos da persona
      const persona = await this.getPersonaData(personaId);
      
      // Garante que test.content seja uma string
      const testContent = typeof test.content === 'object' ? JSON.stringify(test.content) : test.content;
      
      const messages = [
        { 
          role: 'system', 
          content: formatSystemPrompt(persona)
        },
        { 
          role: 'user', 
          content: formatUserPrompt(test)
        }
      ];

      console.log('\n🔍 ================== OPENAI INPUT START ==================');
      console.log('📝 Persona:', persona.name);
      console.log('📋 Test:', test.title);
      console.log('📨 Messages:', JSON.stringify(messages, null, 2));
      console.log('================== OPENAI INPUT END ==================== 🔍\n');

      try {
        const completion = await this.openai.chat.completions.create({
          messages,
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: "json_object" }
        });

        const response = completion.choices[0].message.content;
        console.log('OpenAI Response:', response);

        // Validar e corrigir o formato da resposta
        try {
          const parsedResponse = JSON.parse(response);
          if (!parsedResponse.firstImpression) {
            throw new Error('Invalid response format: missing firstImpression');
          }

          // Garantir que os arrays de tags não sejam [Array]
          if (parsedResponse.tags) {
            parsedResponse.tags = {
              positive: Array.isArray(parsedResponse.tags.positive) ? parsedResponse.tags.positive : [],
              negative: Array.isArray(parsedResponse.tags.negative) ? parsedResponse.tags.negative : [],
              opportunity: Array.isArray(parsedResponse.tags.opportunity) ? parsedResponse.tags.opportunity : []
            };
          }

          return parsedResponse;
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError);
          throw new Error('Invalid response format from OpenAI');
        }
      } catch (error) {
        this.logger.error('Error generating OpenAI response:', error);
        throw error;
      }
    } catch (error) {
      this.logger.error('Error generating response:', error);
      throw error;
    }
  }

  private async saveTestMessage(testId: string, personaId: string, content: any): Promise<any> {
    try {
      // Inserir a mensagem no banco
      const result = await pool.query(
        `INSERT INTO test_messages (
          test_id,
          persona_id,
          first_impression,
          personal_context,
          benefits,
          concerns,
          decision_factors,
          suggestions,
          target_audience_alignment,
          tags,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          testId,
          personaId,
          content.firstImpression,
          content.personalContext,
          content.benefits,
          content.concerns,
          content.decisionFactors,
          content.suggestions,
          content.targetAudienceAlignment,
          content.tags,
          content.metadata
        ]
      );

      return result.rows[0];
    } catch (error) {
      this.logger.error('Error saving test message:', error);
      throw error;
    }
  }

  public async runTest(test: Test): Promise<any> {
    try {
      this.logger.info({
        type: 'test_execution',
        status: 'start',
        id: test.id
      });

      // Validação básica
      if (!test.id || !test.content) {
        throw new Error('Dados do teste incompletos');
      }

      const startTime = Date.now();
      const result = await this.generateResponse(test.personaIds[0], test, {});
      const duration = Date.now() - startTime;

      // Salvar a mensagem no banco
      const savedMessage = await this.saveTestMessage(test.id, test.personaIds[0], result);

      // Formatar a mensagem para o WebSocket
      const message = {
        id: savedMessage.id,
        testId: test.id,
        personaId: test.personaIds[0],
        content: {
          firstImpression: savedMessage.first_impression,
          personalContext: savedMessage.personal_context,
          benefits: savedMessage.benefits,
          concerns: savedMessage.concerns,
          decisionFactors: savedMessage.decision_factors,
          suggestions: savedMessage.suggestions,
          targetAudienceAlignment: savedMessage.target_audience_alignment,
          tags: savedMessage.tags,
          metadata: savedMessage.metadata
        },
        timestamp: savedMessage.created_at
      };

      // Emitir evento com a resposta
      this.emitEvent('test_message', message);

      // Atualizar status do teste
      this.emitEvent('test_update', {
        id: test.id,
        status: 'completed',
        message: 'Test completed successfully'
      });

      this.logger.info({
        type: 'test_execution',
        status: 'complete',
        id: test.id,
        duration: `${duration}ms`
      });

      return message;

    } catch (error: any) {
      // Emitir evento de erro
      this.emitEvent('test_error', {
        id: test.id,
        error: error.message
      });

      // Atualizar status do teste
      this.emitEvent('test_update', {
        id: test.id,
        status: 'error',
        message: error.message
      });

      this.logger.error({
        type: 'test_execution',
        status: 'error',
        id: test.id,
        error: error.message
      });
      throw error;
    }
  }
}
