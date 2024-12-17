import { OpenAI } from 'openai';
import { Pool } from 'pg';
import { createLogger } from '../utils/logger';
import { formatSystemPrompt, formatUserPrompt } from './prompt_template';
import { z } from 'zod';
import { pool } from '../config/database';
import { spawn } from 'child_process';
import path from 'path';

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
  target_audience: {
    age_range: string;
    location: string;
    income: string;
    interests: string[];
    pain_points: string[];
    needs: string[];
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

interface TinyTroupeConfig {
  pythonPath: string;
  scriptPath: string;
  apiKey: string;
  model: string;
  cacheEnabled: boolean;
  cacheDir: string;
  loggingLevel: string;
}

// Define schemas for validation
const metadataSchema = z.object({
  sentiment: z.number().min(0).max(10),
  confidence: z.number().min(0).max(10),
  personal_relevance: z.number().min(0).max(10),
  value_proposition: z.number().min(0).max(10),
  implementation_feasibility: z.number().min(0).max(10)
});

const tagsSchema = z.object({
  negative: z.array(z.string()),
  positive: z.array(z.string()),
  opportunity: z.array(z.string())
});

const responseSchema = z.object({
  first_impression: z.string(),
  personal_context: z.record(z.any()),
  benefits: z.array(z.string()),
  concerns: z.array(z.string()),
  decision_factors: z.array(z.string()),
  suggestions: z.array(z.string()),
  target_audience_alignment: z.record(z.any()),
  tags: tagsSchema,
  metadata: metadataSchema
}).strict(); // Não permite campos extras

type SimulationResponse = z.infer<typeof responseSchema>;

export class TinyTroupeService {
  private openai: OpenAI;
  private costsService: CostsService;
  private eventCallback?: (event: string, data: any) => void;
  private logger: any;
  private config: TinyTroupeConfig;

  constructor(openai: OpenAI, costsService: CostsService, config: TinyTroupeConfig) {
    this.openai = openai;
    this.costsService = costsService;
    this.logger = createLogger('TinyTroupeService');
    this.config = config;
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
      this.logger.debug('Raw response:', rawResponse);
      
      // Remove markdown code block indicators if present
      let cleanResponse = rawResponse;
      if (rawResponse.includes('```json')) {
        cleanResponse = rawResponse
          .replace(/```json\n/, '')
          .replace(/\n```/, '')
          .trim();
      }
      
      // Substituir aspas simples por aspas duplas em nomes de propriedades
      cleanResponse = cleanResponse.replace(/'([^']+)':/g, '"$1":');
      
      this.logger.debug('Cleaned response:', cleanResponse);
      
      try {
        const parsed = JSON.parse(cleanResponse);
        this.logger.debug('Parsed JSON:', parsed);
        
        // Apenas validar com Zod, sem tentar reformatar
        return responseSchema.parse(parsed);
      } catch (parseError) {
        this.logger.error('JSON Parse error:', parseError);
        this.logger.error('Position of error:', (parseError as SyntaxError).message);
        
        // Se falhar, tentar limpar ainda mais o JSON
        const sanitizedResponse = cleanResponse
          .replace(/\n/g, ' ')           // Remove quebras de linha
          .replace(/\s+/g, ' ')          // Remove espaços extras
          .replace(/,\s*}/g, '}')        // Remove vírgulas antes de }
          .replace(/,\s*]/g, ']')        // Remove vírgulas antes de ]
          .replace(/'/g, '"')            // Substitui todas as aspas simples por duplas
          .trim();
        
        this.logger.debug('Sanitized response:', sanitizedResponse);
        const parsed = JSON.parse(sanitizedResponse);
        return responseSchema.parse(parsed);
      }
    } catch (error) {
      this.logger.error('Error in fixResponseFormat:', error);
      this.logger.error('Raw response that caused error:', rawResponse);
      
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
            this.logger.error('Failed to parse extracted JSON:', e);
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
    console.log('\n[generateResponse] ==================');
    console.log('1. Iniciando geração de resposta');
    console.log('PersonaId:', personaId);
    console.log('Test:', JSON.stringify(test, null, 2));
    
    try {
      // Buscar dados completos da persona
      console.log('2. Buscando dados da persona');
      const persona = await this.getPersonaData(personaId);
      console.log('3. Persona encontrada:', JSON.stringify(persona, null, 2));
      
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

      console.log('4. Mensagens formatadas:', JSON.stringify(messages, null, 2));

      try {
        console.log('5. Iniciando chamada OpenAI');
        const completion = await this.openai.chat.completions.create({
          messages,
          model: this.config.model,
          temperature: 0.7,
          max_tokens: 4000
        });

        console.log('6. Resposta recebida da OpenAI:', JSON.stringify(completion, null, 2));
        
        // Log usage
        if (completion.usage) {
          const modelCosts = {
            'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
            'default': { input: 0.0015, output: 0.002 }
          };
          
          const costs = modelCosts[this.config.model] || modelCosts.default;
          const promptCost = (completion.usage.prompt_tokens / 1000) * costs.input;
          const completionCost = (completion.usage.completion_tokens / 1000) * costs.output;
          const totalCost = promptCost + completionCost;

          await this.costsService.logUsage({
            timestamp: new Date().toISOString(),
            model: this.config.model,
            prompt_tokens: completion.usage.prompt_tokens,
            completion_tokens: completion.usage.completion_tokens,
            total_tokens: completion.usage.total_tokens,
            cost: totalCost,
            testId: test.id
          });
        }

        const response = completion.choices[0]?.message?.content;
        if (!response) {
          throw new Error('Empty response from OpenAI');
        }

        console.log('7. Formatando resposta');
        const formattedResponse = this.fixResponseFormat(response);
        console.log('8. Resposta formatada:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse;

      } catch (error) {
        console.error('❌ Erro na chamada OpenAI:', error);
        throw error;
      }

    } catch (error) {
      console.error('❌ Erro em generateResponse:', error);
      throw error;
    }
  }

  private async saveTestMessage(testId: string, personaId: string, content: any): Promise<any> {
    try {
      // Converter camelCase para snake_case
      const snakeCaseContent = {
        test_id: testId,
        persona_id: personaId,
        first_impression: content.first_impression,
        personal_context: content.personal_context,
        benefits: content.benefits,
        concerns: content.concerns,
        decision_factors: content.decision_factors,
        suggestions: content.suggestions,
        target_audience_alignment: content.target_audience_alignment,
        tags: content.tags,
        metadata: content.metadata
      };

      // Inserir a mensagem no banco
      const result = await pool.query(
        `INSERT INTO test_results (
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
          metadata,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *`,
        [
          snakeCaseContent.test_id,
          snakeCaseContent.persona_id,
          snakeCaseContent.first_impression,
          snakeCaseContent.personal_context,
          snakeCaseContent.benefits,
          snakeCaseContent.concerns,
          snakeCaseContent.decision_factors,
          snakeCaseContent.suggestions,
          snakeCaseContent.target_audience_alignment,
          snakeCaseContent.tags,
          snakeCaseContent.metadata
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
      if (!test.id) {
        throw new Error('Dados do teste incompletos');
      }

      const startTime = Date.now();
      const result = await this.generateResponse(test.personaIds[0], test, {});
      const duration = Date.now() - startTime;

      // Salvar a mensagem no banco
      const savedMessage = await this.saveTestMessage(test.id, test.personaIds[0], result);

      // Formatar a mensagem para o WebSocket mantendo snake_case
      const message = {
        id: savedMessage.id,
        test_id: savedMessage.test_id,
        persona_id: savedMessage.persona_id,
        first_impression: savedMessage.first_impression,
        personal_context: savedMessage.personal_context,
        benefits: savedMessage.benefits,
        concerns: savedMessage.concerns,
        decision_factors: savedMessage.decision_factors,
        suggestions: savedMessage.suggestions,
        target_audience_alignment: savedMessage.target_audience_alignment,
        tags: savedMessage.tags,
        metadata: savedMessage.metadata,
        created_at: savedMessage.created_at
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

  async runTestSimulation(test: Test, personas: Persona[], onMessage?: (message: any) => void): Promise<any> {
    console.log('Iniciando simulação do teste:', test.id);
    console.log('Personas para simulação:', personas.map(p => p.id));

    try {
      const results: { [key: string]: any } = {};
      
      for (const persona of personas) {
        console.log(`Processando persona ${persona.id}`);
        
        try {
          // Notificar início do processamento da persona
          onMessage?.({
            type: 'test_update',
            data: {
              status: 'processing',
              currentPersona: persona.id,
              message: `Processando persona ${persona.name}`
            }
          });

          // Gerar resposta para a persona
          const response = await this.generateResponse(persona.id, test, {});
          console.log(`Resposta gerada para persona ${persona.id}:`, response);

          // Salvar resultado
          results[persona.id] = response;

          // Notificar mensagem gerada
          onMessage?.({
            type: 'test_message',
            data: {
              personaId: persona.id,
              ...response
            }
          });

        } catch (error) {
          console.error(`Erro ao processar persona ${persona.id}:`, error);
          onMessage?.({
            type: 'test_error',
            data: {
              personaId: persona.id,
              error: error.message
            }
          });
        }
      }

      console.log('Simulação concluída com sucesso');
      return results;

    } catch (error) {
      console.error('Erro na simulação:', error);
      throw error;
    }
  }

  async generatePersonaTraits(basePersona: Partial<Persona>): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.config.pythonPath, [
        this.config.scriptPath,
        '--generate-traits',
        '--base-persona', JSON.stringify(basePersona),
        '--config', JSON.stringify({
          api_key: this.config.apiKey,
          model: this.config.model,
          cache_enabled: this.config.cacheEnabled,
          cache_dir: this.config.cacheDir,
          logging_level: this.config.loggingLevel
        })
      ]);

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        console.log('[TinyTroupe] Raw stdout data:', data.toString());
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error('[TinyTroupe] stderr:', data.toString());
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        console.log('[TinyTroupe] Process closed with code:', code);
        console.log('[TinyTroupe] Final output:', output);
        console.log('[TinyTroupe] Error output:', errorOutput);
        
        if (code !== 0) {
          reject(new Error(`Trait generation failed: ${errorOutput}`));
          return;
        }
        try {
          console.log('[TinyTroupe] Attempting to parse output');
          const traits = JSON.parse(output);
          console.log('[TinyTroupe] Successfully parsed traits:', traits);
          resolve(traits);
        } catch (error) {
          console.error('[TinyTroupe] Parse error:', error);
          console.error('[TinyTroupe] Failed to parse output:', output);
          reject(new Error('Failed to parse traits output'));
        }
      });
    });
  }

  async createTinyPerson(persona: Persona): Promise<any> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.config.pythonPath, [
        this.config.scriptPath,
        '--create-person',
        '--persona', JSON.stringify(persona),
        '--config', JSON.stringify({
          api_key: this.config.apiKey,
          model: this.config.model,
          cache_enabled: this.config.cacheEnabled,
          cache_dir: this.config.cacheDir,
          logging_level: this.config.loggingLevel
        })
      ]);

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        console.log('[TinyTroupe] Raw stdout data:', data.toString());
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error('[TinyTroupe] stderr:', data.toString());
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        console.log('[TinyTroupe] Process closed with code:', code);
        console.log('[TinyTroupe] Final output:', output);
        console.log('[TinyTroupe] Error output:', errorOutput);
        
        if (code !== 0) {
          reject(new Error(`Person creation failed: ${errorOutput}`));
          return;
        }
        try {
          console.log('[TinyTroupe] Attempting to parse output');
          const person = JSON.parse(output);
          console.log('[TinyTroupe] Successfully parsed person:', person);
          resolve(person);
        } catch (error) {
          console.error('[TinyTroupe] Parse error:', error);
          console.error('[TinyTroupe] Failed to parse output:', output);
          reject(new Error('Failed to parse person output'));
        }
      });
    });
  }
}
