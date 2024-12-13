import express from 'express';
import { Test } from '@crowdelic/shared';
import { verifyToken } from '../middleware/auth';
import { prisma } from '../config/database';
import { TinyTroupeService } from '../services/tinytroupe_service'; 
import { CacheService } from '../services/cache_service';
import { OpenAI } from 'openai';
import { CostsService } from '../services/costs_service';

// Helper function to calculate rating based on response sentiment
function calculateRating(response: string): number {
  // Use simple sentiment analysis to determine rating
  const positiveWords = ['great', 'excellent', 'good', 'like', 'love', 'useful', 'helpful', 'amazing', 'fantastic', 'positive'];
  const negativeWords = ['bad', 'poor', 'dislike', 'hate', 'useless', 'unhelpful', 'terrible', 'negative', 'awful', 'confusing'];
  
  const lowerResponse = response.toLowerCase();
  let score = 3; // Start with neutral score
  
  // Count positive and negative words
  const positiveCount = positiveWords.reduce((count, word) => 
    count + (lowerResponse.includes(word) ? 1 : 0), 0);
  const negativeCount = negativeWords.reduce((count, word) => 
    count + (lowerResponse.includes(word) ? 1 : 0), 0);
  
  // Adjust score based on sentiment
  score += positiveCount * 0.5;
  score -= negativeCount * 0.5;
  
  // Ensure score is between 1 and 5
  return Math.max(1, Math.min(5, Math.round(score)));
}

// Helper function to format test data
const formatTestData = (test: any) => {
  console.log('Formatando dados do teste:', test);
  
  // Função auxiliar para parsear JSON
  const parseJsonField = (field: any, defaultValue: any = null) => {
    if (!field) return defaultValue;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch (e) {
        console.error(`Error parsing JSON field:`, e);
        return defaultValue;
      }
    }
    return field;
  };

  // Parse arrays
  let results = [];
  try {
    if (test.results) {
      if (typeof test.results === 'string') {
        results = JSON.parse(test.results);
      } else if (Array.isArray(test.results)) {
        results = test.results;
      } else if (typeof test.results === 'object') {
        results = [test.results];
      }
    }
  } catch (e) {
    console.error('Error parsing results:', e);
    results = [];
  }
  
  const personaIds = [...new Set((parseJsonField(test.persona_ids, [])).map(String))];
  const topics = parseJsonField(test.topics, []);
  
  // Parse objects
  const settings = parseJsonField(test.settings, {
    maxIterations: 5,
    responseFormat: 'detailed',
    interactionStyle: 'natural'
  });
  
  const targetAudience = parseJsonField(test.target_audience, {
    ageRange: '',
    location: '',
    income: '',
    interests: [],
    painPoints: [],
    needs: []
  });

  // Construir o objeto formatado
  const formattedTest = {
    id: test.id,
    title: test.title || '',
    description: test.description || '',
    objective: test.objective || '',
    language: test.language || 'pt',
    settings,
    topics,
    personaIds,
    targetAudience,
    results,
    status: test.status || 'pending',
    createdAt: test.created_at,
    updatedAt: test.updated_at
  };

  console.log('Dados formatados:', formattedTest);
  return formattedTest;
};

const router = express.Router();

// Map to track in-progress tests
const inProgressTests = new Map<string, Promise<any>>();

// Middleware to get TinyTroupeService from app context
const getTinyTroupeService = (req: express.Request): TinyTroupeService => {
  const service = req.app.get('tinyTroupeService');
  if (!service) {
    throw new Error('TinyTroupeService not found in app context');
  }
  return service;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const costsService = new CostsService();
const tinyTroupeService = new TinyTroupeService(openai, costsService, {
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
});
const cacheService = new CacheService();

// Configure tinyTroupeService no app
router.use((req, res, next) => {
  if (!req.app.get('tinyTroupeService')) {
    req.app.set('tinyTroupeService', tinyTroupeService);
  }
  next();
});

// Helper function to process test with deduplication
const processTestWithDedup = async (testId: string, processFunction: () => Promise<any>): Promise<any> => {
  // Check if test is already in progress
  let testPromise = inProgressTests.get(testId);
  if (testPromise) {
    return testPromise;
  }

  // Create new test promise
  testPromise = processFunction().finally(() => {
    // Clean up on completion or error
    inProgressTests.delete(testId);
  });

  // Store the promise
  inProgressTests.set(testId, testPromise);
  return testPromise;
};

// Check if a test title already exists
router.get('/check-title', verifyToken, async (req, res) => {
  try {
    const { title, excludeId } = req.query;
    
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const existingTest = await prisma.test.findFirst({
      where: {
        title: title.trim(),
        user_id: (req as any).user.id,
        deleted_at: null,
        // Ignorar o próprio teste quando estiver editando
        NOT: excludeId ? { id: excludeId as string } : undefined
      }
    });

    res.json({ exists: !!existingTest });
  } catch (err) {
    console.error('Error checking test title:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all tests
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log('[GET /tests] Buscando testes para o usuário:', (req as any).user.id);

    // Primeiro, remover possíveis duplicatas no banco
    await prisma.$executeRaw`
      DELETE FROM tests a USING tests b
      WHERE a.id > b.id 
      AND a.title = b.title 
      AND a.user_id = b.user_id 
      AND a.deleted_at IS NULL
      AND b.deleted_at IS NULL;
    `;

    const tests = await prisma.test.findMany({
      where: {
        user_id: (req as any).user.id,
        deleted_at: null
      },
      orderBy: {
        updated_at: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        objective: true,
        settings: true,
        topics: true,
        persona_ids: true,
        target_audience: true,
        language: true,
        status: true,
        created_at: true,
        updated_at: true
      },
      distinct: ['id'] // Garantir que não há duplicatas
    });

    console.log(`[GET /tests] Encontrados ${tests.length} testes`);

    const formattedTests = tests.map(test => {
      try {
        return {
          id: test.id,
          title: test.title || '',
          description: test.description || '',
          objective: test.objective || '',
          language: test.language || 'pt',
          settings: typeof test.settings === 'string' ? JSON.parse(test.settings) : test.settings || {
            maxIterations: 5,
            responseFormat: 'detailed',
            interactionStyle: 'natural'
          },
          topics: typeof test.topics === 'string' ? JSON.parse(test.topics) : test.topics || [],
          personaIds: typeof test.persona_ids === 'string' ? JSON.parse(test.persona_ids) : test.persona_ids || [],
          targetAudience: typeof test.target_audience === 'string' ? JSON.parse(test.target_audience) : test.target_audience || {
            ageRange: '',
            location: '',
            income: '',
            interests: [],
            painPoints: [],
            needs: []
          },
          status: test.status || 'pending',
          createdAt: test.created_at,
          updatedAt: test.updated_at
        };
      } catch (err) {
        console.error('Error formatting test:', test.id, err);
        return {
          id: test.id,
          title: test.title || '',
          description: test.description || '',
          objective: test.objective || '',
          language: test.language || 'pt',
          settings: {
            maxIterations: 5,
            responseFormat: 'detailed',
            interactionStyle: 'natural'
          },
          topics: [],
          personaIds: [],
          targetAudience: {
            ageRange: '',
            location: '',
            income: '',
            interests: [],
            painPoints: [],
            needs: []
          },
          status: test.status || 'pending',
          createdAt: test.created_at,
          updatedAt: test.updated_at
        };
      }
    });

    // Remover possíveis duplicatas por ID
    const uniqueTests = formattedTests.filter((test, index, self) =>
      index === self.findIndex((t) => t.id === test.id)
    );

    res.json(uniqueTests);
  } catch (err) {
    console.error('Error getting tests:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get single test
router.get('/:id', verifyToken, async (req, res) => {
  try {
    // Special case for new tests
    if (req.params.id === 'new') {
      return res.json({
        title: '',
        description: '',
        objective: '',
        language: 'pt',
        settings: {
          maxIterations: 5,
          responseFormat: 'detailed',
          interactionStyle: 'natural',
        },
        topics: [],
        personaIds: [],
        targetAudience: {
          ageRange: '',
          location: '',
          income: '',
          interests: [],
          painPoints: [],
          needs: []
        }
      });
    }

    const test = await prisma.test.findFirst({
      where: {
        id: req.params.id,
        user_id: (req as any).user.id,
        deleted_at: null
      },
      select: {
        id: true,
        title: true,
        description: true,
        objective: true,
        settings: true,
        topics: true,
        persona_ids: true,
        target_audience: true,
        language: true,
        status: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    try {
      const formattedTest = {
        id: test.id,
        title: test.title || '',
        description: test.description || '',
        objective: test.objective || '',
        language: test.language || 'pt',
        settings: typeof test.settings === 'string' ? JSON.parse(test.settings) : test.settings || {
          maxIterations: 5,
          responseFormat: 'detailed',
          interactionStyle: 'natural'
        },
        topics: typeof test.topics === 'string' ? JSON.parse(test.topics) : test.topics || [],
        personaIds: typeof test.persona_ids === 'string' ? JSON.parse(test.persona_ids) : test.persona_ids || [],
        targetAudience: typeof test.target_audience === 'string' ? JSON.parse(test.target_audience) : test.target_audience || {
          ageRange: '',
          location: '',
          income: '',
          interests: [],
          painPoints: [],
          needs: []
        },
        status: test.status || 'pending',
        createdAt: test.created_at,
        updatedAt: test.updated_at
      };

      res.json(formattedTest);
    } catch (err) {
      console.error('Error formatting test:', test.id, err);
      // Return a basic version of the test if there's an error
      res.json({
        id: test.id,
        title: test.title || '',
        description: test.description || '',
        objective: test.objective || '',
        language: test.language || 'pt',
        settings: {
          maxIterations: 5,
          responseFormat: 'detailed',
          interactionStyle: 'natural'
        },
        topics: [],
        personaIds: [],
        targetAudience: {
          ageRange: '',
          location: '',
          income: '',
          interests: [],
          painPoints: [],
          needs: []
        },
        status: test.status || 'pending',
        createdAt: test.created_at,
        updatedAt: test.updated_at
      });
    }
  } catch (err) {
    console.error('Error getting test:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get test results
router.get('/:id/results', verifyToken, async (req, res) => {
  try {
    const result = await prisma.test.findFirst({
      where: {
        id: req.params.id,
        user_id: (req as any).user.id,
        deleted_at: null
      },
      select: {
        results: true
      }
    });

    if (!result) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const results = formatTestData(result).results;
    res.json(results);
  } catch (err) {
    console.error('Error getting test results:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get live messages from a running test
router.get('/:id/live-messages', verifyToken, async (req, res) => {
  try {
    const result = await prisma.testMessage.findFirst({
      where: {
        test_id: req.params.id,
        user_id: (req as any).user.id
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const messages = result?.messages || [];
    console.log('Live Messages Response:', messages); // Log para debug
    res.json(messages);
  } catch (err) {
    console.error('Error getting live messages:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get test messages
router.get('/:id/messages', verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log(`[GET /tests/${id}/messages] Buscando mensagens do teste`);

  try {
    // Primeiro verificar se o teste existe e pertence ao usuário
    const test = await prisma.test.findFirst({
      where: {
        id: id,
        user_id: (req as any).user.id,
        deleted_at: null
      }
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Buscar resultados do teste
    const results = await prisma.testResult.findMany({
      where: {
        test_id: id,
        deleted_at: null
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    console.log(`[GET /tests/${id}/messages] Encontrados ${results.length} resultados`);
    console.log('Resultados:', results);
    res.json(results);
  } catch (err) {
    console.error(`[GET /tests/${id}/messages] Erro:`, err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Internal function to add a message to a test
async function addTestMessage(testId: string, userId: string, message: any) {
  console.log('Adding message to test:', { testId, message });
  
  try {
    // Garantir que o conteúdo e metadata são objetos
    const content = typeof message.content === 'string' 
      ? JSON.parse(message.content)
      : message.content;
      
    const metadata = typeof message.metadata === 'string'
      ? JSON.parse(message.metadata)
      : message.metadata;

    // Inserir na base de dados como JSONB para garantir que são armazenados como objetos
    const result = await prisma.testMessage.create({
      data: {
        testId: testId,
        userId: userId,
        content: JSON.stringify(content),
        metadata: JSON.stringify(metadata)
      }
    });

    const savedMessage = result;
    console.log('Message saved successfully:', savedMessage);

    // Emitir o evento WebSocket com os objetos já parseados
    const wsService = global.app.get('wsService');
    if (wsService) {
      wsService.emit('testMessage', {
        testId,
        message: {
          ...savedMessage,
          content: content, // Já é um objeto
          metadata: metadata // Já é um objeto
        }
      });
    }

    return savedMessage;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}

// Create new test
router.post('/', verifyToken, async (req, res) => {
  console.log('[POST /tests] Iniciando criação de teste');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Validar campos obrigatórios
    const { 
      title, 
      description, 
      objective,
      settings,
      topics,
      personaIds,
      target_audience,
      language = 'pt'
    } = req.body;

    // Verificar se já existe um teste com o mesmo título para este usuário
    const existingTest = await prisma.test.findFirst({
      where: {
        title: title.trim(),
        user_id: (req as any).user.id,
        deleted_at: null
      }
    });

    if (existingTest) {
      console.log('[POST /tests] Teste com título duplicado encontrado:', existingTest.id);
      return res.status(400).json({ 
        error: 'Duplicate test title', 
        message: 'Já existe um teste com este título. Por favor, escolha um título diferente.' 
      });
    }

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!description?.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }
    if (!objective?.trim()) {
      return res.status(400).json({ error: 'Objective is required' });
    }
    if (!target_audience?.ageRange?.trim()) {
      return res.status(400).json({ error: 'Age range is required' });
    }
    if (!target_audience?.location?.trim()) {
      return res.status(400).json({ error: 'Location is required' });
    }
    if (!target_audience?.income?.trim()) {
      return res.status(400).json({ error: 'Income is required' });
    }
    if (!Array.isArray(target_audience?.interests) || target_audience.interests.length === 0) {
      return res.status(400).json({ error: 'At least one interest is required' });
    }
    if (!Array.isArray(target_audience?.painPoints) || target_audience.painPoints.length === 0) {
      return res.status(400).json({ error: 'At least one pain point is required' });
    }
    if (!Array.isArray(target_audience?.needs) || target_audience.needs.length === 0) {
      return res.status(400).json({ error: 'At least one need is required' });
    }

    // Garantir que os arrays sejam arrays válidos
    const validTopics = Array.isArray(topics) ? topics : [];
    const validPersonaIds = Array.isArray(personaIds) ? personaIds : [];

    // Garantir que settings tenha os valores padrão
    const validSettings = {
      maxIterations: 5,
      responseFormat: 'detailed',
      interactionStyle: 'natural',
      ...(settings || {})
    };

    console.log('Valores validados:', {
      title,
      description,
      objective,
      settings: validSettings,
      topics: validTopics,
      personaIds: validPersonaIds,
      target_audience,
      language
    });

    try {
      const result = await prisma.test.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          objective: objective.trim(),
          settings: validSettings,
          topics: validTopics,
          persona_ids: validPersonaIds,
          target_audience,
          language,
          user_id: (req as any).user.id
        }
      });

      const test = formatTestData(result);
      res.json(test);
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ 
        error: 'Database error', 
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined 
      });
    }
  } catch (err) {
    console.error('Error creating test:', err);
    res.status(500).json({ 
      error: 'Server error', 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// Update test (full or partial update)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const testId = req.params.id;
    console.log(`[PUT /tests/${testId}] Iniciando atualização do teste`);
    console.log('Request body completo:', JSON.stringify(req.body, null, 2));
    const { 
      title, 
      description, 
      objective,
      settings,
      topics,
      personaIds,
      target_audience,
      language
    } = req.body;

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (objective !== undefined) {
      updates.push(`objective = $${paramCount}`);
      values.push(objective);
      paramCount++;
    }

    if (settings !== undefined) {
      updates.push(`settings = $${paramCount}::jsonb`);
      values.push(settings);
      paramCount++;
    }

    if (topics !== undefined) {
      updates.push(`topics = $${paramCount}::text[]`);
      values.push(topics);
      paramCount++;
    }

    if (personaIds !== undefined) {
      updates.push(`persona_ids = $${paramCount}::text[]`);
      values.push(personaIds);
      paramCount++;
    }

    if (target_audience !== undefined) {
      updates.push(`target_audience = $${paramCount}::jsonb`);
      values.push(target_audience);
      paramCount++;
    }

    if (language !== undefined) {
      updates.push(`language = $${paramCount}`);
      values.push(language);
      paramCount++;
    }

    // Add updated_at timestamp
    updates.push('updated_at = CURRENT_TIMESTAMP');

    // Add test ID and user ID to values array
    values.push(testId);
    values.push((req as any).user.id);

    console.log('Query:', `
      UPDATE tests 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
    `);
    console.log('Values:', values);

    const result = await prisma.test.update({
      where: {
        id: testId,
        user_id: (req as any).user.id
      },
      data: {
        title: title,
        description: description,
        objective: objective,
        settings: settings,
        topics: topics,
        persona_ids: personaIds,
        target_audience: target_audience,
        language: language,
        updated_at: new Date()
      }
    });

    if (!result) {
      return res.status(404).json({ error: 'Test not found' });
    }

    console.log('Resultado da atualização:', result);

    const updatedTest = formatTestData(result);
    console.log('Teste formatado:', updatedTest);

    res.json(updatedTest);
  } catch (err) {
    console.error('Erro ao atualizar teste:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete test
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    console.log('Deleting test:', req.params.id);
    
    // Primeiro, verificar se o teste existe e pertence ao usuário
    const checkResult = await prisma.test.findFirst({
      where: {
        id: req.params.id,
        user_id: (req as any).user.id,
        deleted_at: null
      }
    });

    if (!checkResult) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Deletar mensagens do teste primeiro (devido à chave estrangeira)
    await prisma.testMessage.deleteMany({
      where: {
        test_id: req.params.id
      }
    });

    // Agora deletar o teste
    const result = await prisma.test.update({
      where: {
        id: req.params.id,
        user_id: (req as any).user.id
      },
      data: {
        deleted_at: new Date()
      }
    });

    // Notificar clientes via WebSocket
    const wsService = req.app.get('wsService');
    if (wsService) {
      wsService.notifyClients('test-deleted', {
        testId: req.params.id
      });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting test:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Run test
router.post('/:id/run', verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log(`\n[POST /tests/${id}/run] ==================`);
  console.log('1. Iniciando execução do teste');
  
  try {
    // Get test from database
    const test = await prisma.test.findFirst({
      where: {
        id,
        user_id: (req as any).user.id,
        deleted_at: null
      }
    });

    console.log('2. Teste encontrado:', JSON.stringify(test, null, 2));

    if (!test) {
      console.log('❌ Teste não encontrado');
      return res.status(404).json({ error: 'Test not found' });
    }

    // Buscar as personas do teste
    const personas = await prisma.persona.findMany({
      where: {
        id: {
          in: test.persona_ids
        },
        deleted_at: null
      }
    });

    console.log('3. Personas encontradas:', JSON.stringify(personas, null, 2));

    if (personas.length === 0) {
      console.log('❌ Nenhuma persona encontrada');
      throw new Error('No personas found for this test');
    }

    // Update test status to running
    await prisma.test.update({
      where: {
        id,
        user_id: (req as any).user.id
      },
      data: {
        status: 'running',
        started_at: new Date(),
        error: null
      }
    });

    console.log('4. Status do teste atualizado para running');

    // Notify WebSocket clients
    const wsService = req.app.get('wsService');
    if (wsService) {
      console.log('5. Notificando clientes via WebSocket');
      wsService.notifyClients(id, 'testUpdate', {
        id,
        status: 'running',
        message: 'Test started'
      });
    } else {
      console.log('❌ WebSocket service não encontrado');
    }

    // Retorna imediatamente para o cliente
    res.json({ id, status: 'running', message: 'Test started' });
    console.log('6. Resposta enviada ao cliente');

    // Run test asynchronously
    console.log('7. Iniciando TinyTroupeService');
    const tinyTroupe = new TinyTroupeService(openai, new CostsService(), {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    });

    // Executa o teste em background
    processTestWithDedup(id, async () => {
      try {
        console.log('8. Iniciando simulação do teste');
        const result = await tinyTroupe.runTestSimulation(test, personas, (message) => {
          console.log('9. Mensagem recebida da simulação:', message);
          if (message.type === 'test_message') {
            wsService?.sendTestMessage(id, message.data);
          } else if (message.type === 'test_error') {
            wsService?.sendTestError(id, message.data);
          } else if (message.type === 'test_update') {
            wsService?.notifyClients(id, 'testUpdate', message.data);
          }
        });

        console.log('10. Simulação concluída, resultado:', JSON.stringify(result, null, 2));
        
        // Atualizar status do teste para concluído
        await prisma.test.update({
          where: { id },
          data: {
            status: 'completed',
            completed_at: new Date()
          }
        });

        // Criar resultados para cada persona
        for (const persona of personas) {
          const personaResult = result[persona.id] || result;
          
          await prisma.testResult.create({
            data: {
              test_id: id,
              persona_id: persona.id,
              first_impression: personaResult.first_impression || '',
              benefits: personaResult.benefits || [],
              concerns: personaResult.concerns || [],
              decision_factors: personaResult.decision_factors || [],
              suggestions: personaResult.suggestions || [],
              tags: personaResult.tags || {},
              personal_context: personaResult.personal_context || {},
              target_audience_alignment: personaResult.target_audience_alignment || {},
              metadata: personaResult.metadata || {}
            }
          });
        }

        // Notificar clientes que o teste foi concluído
        wsService?.notifyClients(id, 'testUpdate', {
          id,
          status: 'completed',
          message: 'Test completed successfully'
        });

      } catch (error) {
        console.error('Error running test:', error);
        
        // Atualizar status do teste para erro
        await prisma.test.update({
          where: { id },
          data: {
            status: 'error',
            error: error.message
          }
        });

        // Notificar clientes do erro
        wsService?.notifyClients(id, 'testUpdate', {
          id,
          status: 'error',
          message: error.message
        });
      }
    });

  } catch (error: any) {
    console.error('Error running test:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stop test
router.post('/:id/stop', verifyToken, async (req, res) => {
  const { id } = req.params;
  const wsService = req.app.get('wsService');

  try {
    // Update test status to stopped
    const updateResult = await prisma.test.update({
      where: {
        id,
        user_id: (req as any).user.id
      },
      data: {
        status: 'stopped',
        completed_at: new Date(),
        error: null
      }
    });

    if (!updateResult) {
      return res.status(404).json({
        error: 'Test not found',
        code: 'TEST_NOT_FOUND'
      });
    }

    const test = formatTestData(updateResult);

    // Notify clients via WebSocket
    if (wsService) {
      wsService.notifyClients(id, 'test_stopped', {
        testId: id,
        test: test
      });
    }

    res.json(test);
  } catch (err: any) {
    const errorResponse = {
      error: 'Failed to stop test',
      code: 'STOP_TEST_ERROR',
      details: err.message,
      testId: id
    };

    console.error('Error stopping test:', errorResponse);
    res.status(500).json(errorResponse);
  }
});

// Delete specific message from a test
router.delete('/:testId/messages/:messageId', verifyToken, async (req, res) => {
  const { testId, messageId } = req.params;
  console.log(`Deleting message ${messageId} from test ${testId}`);

  try {
    // Primeiro verifica se a mensagem existe e pertence ao teste
    console.log('Buscando mensagem:', { messageId });
    const message = await prisma.testResult.findUnique({
      where: {
        id: messageId
      }
    });

    console.log('Mensagem encontrada:', message);

    if (!message) {
      console.error('Message not found:', messageId);
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.test_id !== testId) {
      console.error('Message does not belong to test:', { messageId, testId, messageTestId: message.test_id });
      return res.status(403).json({ error: 'Message does not belong to this test' });
    }

    // Se encontrou a mensagem e ela pertence ao teste, deleta permanentemente
    console.log('Deletando mensagem permanentemente');
    const deletedMessage = await prisma.testResult.delete({
      where: {
        id: messageId
      }
    });

    console.log('Mensagem deletada:', deletedMessage);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting test message:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return res.status(500).json({ error: 'Failed to delete test message' });
  }
});

// Delete a test message
router.delete('/:testId/messages/:messageId', verifyToken, async (req, res) => {
  const { testId, messageId } = req.params;
  console.log(`[DELETE /tests/${testId}/messages/${messageId}] Deletando mensagem`);
  
  try {
    // Primeiro verifica se a mensagem existe
    console.log('Buscando mensagem:', { messageId });
    const message = await prisma.testResult.findUnique({
      where: {
        id: messageId
      }
    });

    console.log('Mensagem encontrada:', message);

    if (!message) {
      console.error('Message not found:', messageId);
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.test_id !== testId) {
      console.error('Message does not belong to test:', { messageId, testId, messageTestId: message.test_id });
      return res.status(403).json({ error: 'Message does not belong to this test' });
    }

    // Se encontrou a mensagem, faz o soft delete
    console.log('Atualizando mensagem com soft delete');
    const updatedMessage = await prisma.testResult.update({
      where: {
        id: messageId
      },
      data: {
        deletedAt: new Date()
      }
    });

    console.log('Mensagem atualizada:', updatedMessage);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting test message:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return res.status(500).json({ error: 'Failed to delete test message' });
  }
});

export const testRouter = router;
