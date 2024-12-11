import express from 'express';
import { Test } from '@crowdelic/shared';
import { auth } from '../middleware/auth';
import { pool } from '../config/database';
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

  const content = parseJsonField(test.content, {
    type: 'text',
    description: test.description || '',
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
    content,
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
const tinyTroupeService = new TinyTroupeService(openai, costsService);
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

// Get all tests
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tests WHERE user_id = $1',
      [(req as any).user.id]
    );

    const tests = result.rows.map(formatTestData);
    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single test
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tests WHERE id = $1 AND user_id = $2',
      [req.params.id, (req as any).user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    console.log('Raw test data:', {
      persona_ids: result.rows[0].persona_ids,
      type: typeof result.rows[0].persona_ids
    });

    const test = formatTestData(result.rows[0]);
    
    console.log('Formatted test data:', {
      personaIds: test.personaIds,
      type: typeof test.personaIds
    });

    res.json(test);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get test results
router.get('/:id/results', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT results FROM tests WHERE id = $1 AND user_id = $2',
      [req.params.id, (req as any).user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const results = formatTestData(result.rows[0]).results;
    res.json(results);
  } catch (err) {
    console.error('Error getting test results:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get live messages from a running test
router.get('/:id/live-messages', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT messages FROM test_messages WHERE test_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1',
      [req.params.id, (req as any).user.id]
    );

    const messages = result.rows[0]?.messages || [];
    console.log('Live Messages Response:', messages); // Log para debug
    res.json(messages);
  } catch (err) {
    console.error('Error getting live messages:', err);
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
    const result = await pool.query(
      `INSERT INTO test_messages (test_id, user_id, content, metadata, created_at)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, NOW())
       RETURNING id, content, metadata, created_at`,
      [testId, userId, JSON.stringify(content), JSON.stringify(metadata)]
    );

    const savedMessage = result.rows[0];
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
router.post('/', auth, async (req, res) => {
  console.log('POST /tests - Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Validar campos obrigatórios
    const { 
      title, 
      description, 
      objective,
      settings,
      topics,
      persona_ids,
      target_audience,
      content = {
        type: 'text',
        description: description || ''
      },
      language = 'pt'
    } = req.body;

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
    const validPersonaIds = Array.isArray(persona_ids) ? persona_ids : [];

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
      persona_ids: validPersonaIds,
      target_audience,
      content,
      language
    });

    try {
      const result = await pool.query(
        `INSERT INTO tests (
          title, description, objective, settings, topics, 
          persona_ids, target_audience, content, language, user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          title.trim(),
          description.trim(),
          objective.trim(),
          JSON.stringify(validSettings),
          JSON.stringify(validTopics),
          JSON.stringify(validPersonaIds),
          JSON.stringify(target_audience),
          JSON.stringify(content),
          language,
          (req as any).user.id
        ]
      );

      const test = formatTestData(result.rows[0]);
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
router.put('/:id', auth, async (req, res) => {
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
      persona_ids,
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
      values.push(JSON.stringify(settings));
      paramCount++;
    }

    if (topics !== undefined) {
      updates.push(`topics = $${paramCount}::text[]`);
      values.push(Array.isArray(topics) ? topics : []);
      paramCount++;
    }

    if (persona_ids !== undefined) {
      updates.push(`persona_ids = $${paramCount}::text[]`);
      values.push(Array.isArray(persona_ids) ? persona_ids : []);
      paramCount++;
    }

    if (target_audience !== undefined) {
      updates.push(`target_audience = $${paramCount}::jsonb`);
      values.push(JSON.stringify(target_audience));
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

    const result = await pool.query(`
      UPDATE tests 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    console.log('Resultado da atualização:', result.rows[0]);

    const updatedTest = formatTestData(result.rows[0]);
    console.log('Teste formatado:', updatedTest);

    res.json(updatedTest);
  } catch (err) {
    console.error('Erro ao atualizar teste:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete test
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting test:', req.params.id);
    
    // Primeiro, verificar se o teste existe e pertence ao usuário
    const checkResult = await pool.query(
      'SELECT id FROM tests WHERE id = $1 AND user_id = $2',
      [req.params.id, (req as any).user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Deletar mensagens do teste primeiro (devido à chave estrangeira)
    await pool.query(
      'DELETE FROM test_messages WHERE test_id = $1',
      [req.params.id]
    );

    // Agora deletar o teste
    const result = await pool.query(
      'DELETE FROM tests WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, (req as any).user.id]
    );

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
router.post('/:id/run', auth, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get test from database
    const test = await pool.query(
      'SELECT * FROM tests WHERE id = $1 AND user_id = $2',
      [id, (req as any).user.id]
    );

    if (test.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Update test status to running
    await pool.query(
      'UPDATE tests SET status = $1, started_at = NOW(), error = NULL WHERE id = $2',
      ['running', id]
    );

    // Notify WebSocket clients
    const wsService = req.app.get('wsService');
    if (wsService) {
      wsService.notifyClients(id, 'testUpdate', {
        id,
        status: 'running',
        message: 'Test started'
      });
    }

    // Run test asynchronously
    const tinyTroupe = new TinyTroupeService(openai, costsService);
    tinyTroupe.setEventCallback((event, data) => {
      if (event === 'test_message') {
        wsService?.sendTestMessage(id, data);
      } else if (event === 'test_error') {
        wsService?.sendTestError(id, data);
      } else if (event === 'test_update') {
        wsService?.notifyClients(id, 'testUpdate', data);
      }
    });

    const result = await tinyTroupe.runTest(formatTestData(test.rows[0]));

    // Update test status to completed
    await pool.query(
      'UPDATE tests SET status = $1, results = $2, error = NULL, completed_at = NOW() WHERE id = $3',
      ['completed', JSON.stringify(result), id]
    );

    // Send completion notification
    wsService?.sendTestComplete(id, result);

    return res.json({ message: 'Test started successfully' });
  } catch (error: any) {
    console.error('Error running test:', error);

    // Update test status to error
    await pool.query(
      'UPDATE tests SET status = $1, error = $2, completed_at = NOW() WHERE id = $3',
      ['error', error.message, id]
    );

    // Notify WebSocket clients
    const wsService = req.app.get('wsService');
    if (wsService) {
      wsService.notifyClients(id, 'testUpdate', {
        id,
        status: 'error',
        message: error.message
      });
    }

    return res.status(500).json({ error: error.message });
  }
});

// Stop test
router.post('/:id/stop', auth, async (req, res) => {
  const { id } = req.params;
  const wsService = req.app.get('wsService');

  try {
    // Update test status to stopped
    const updateResult = await pool.query(
      'UPDATE tests SET status = $1, completed_at = NOW(), error = NULL WHERE id = $2 AND user_id = $3 RETURNING *',
      ['stopped', id, (req as any).user.id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Test not found',
        code: 'TEST_NOT_FOUND'
      });
    }

    const test = formatTestData(updateResult.rows[0]);

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
router.delete('/:testId/messages/:messageId', auth, async (req, res) => {
  const { testId, messageId } = req.params;
  console.log(`Deleting message ${messageId} from test ${testId}`);

  try {
    // Primeiro verifica se o teste pertence ao usuário
    const testResult = await pool.query(
      'SELECT id FROM tests WHERE id = $1 AND user_id = $2',
      [testId, (req as any).user.id]
    );

    if (testResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Deleta a mensagem
    const result = await pool.query(
      'DELETE FROM test_messages WHERE id = $1 AND test_id = $2 RETURNING *',
      [messageId, testId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    console.log('Message deleted successfully');
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export const testRouter = router;
