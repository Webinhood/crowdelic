import { Router } from 'express';
import { verifyToken } from '../middleware/auth';
import { TinyTroupeService } from '../services/tinytroupe_service';
import { getTestById } from '../services/test';
import { getPersonaById } from '../services/persona';

const router = Router();
const tinyTroupeService = new TinyTroupeService({
  pythonPath: process.env.PYTHON_PATH || 'python3',
  scriptPath: process.env.TINYTROUPE_SCRIPT_PATH || '/path/to/tinytroupe_script.py',
});

// Run a simulation for a test with specific personas
router.post('/run/:testId', verifyToken, async (req, res) => {
  try {
    const { testId } = req.params;
    const { personaIds } = req.body;

    if (!personaIds || !Array.isArray(personaIds) || personaIds.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty personaIds array' });
    }

    // Get test and validate ownership
    const test = await getTestById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    if (test.user_id !== (req as any).user.id) {
      return res.status(403).json({ error: 'Not authorized to run this test' });
    }

    const results = [];
    const errors = [];

    for (const personaId of personaIds) {
      try {
        const persona = await getPersonaById(personaId);
        if (!persona) {
          errors.push({ personaId, error: 'Persona not found' });
          continue;
        }

        // Validate persona access
        if (!persona.is_public && persona.user_id !== (req as any).user.id) {
          errors.push({ personaId, error: 'Not authorized to use this persona' });
          continue;
        }

        const simulationResult = await tinyTroupeService.runTestSimulation(test, persona);
        results.push({
          personaId,
          result: simulationResult,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Error simulating persona ${personaId}:`, error);
        errors.push({ personaId, error: 'Simulation failed' });
      }
    }

    res.json({ 
      success: results.length > 0,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Failed to run simulation' });
  }
});

// Generate traits for a persona
router.post('/generate-traits', verifyToken, async (req, res) => {
  try {
    const { basePersona } = req.body;
    const traits = await tinyTroupeService.generatePersonaTraits(basePersona);
    res.json({ traits });
  } catch (error) {
    console.error('Trait generation error:', error);
    res.status(500).json({ error: 'Failed to generate traits' });
  }
});

// Analyze test results
router.post('/analyze', verifyToken, async (req, res) => {
  try {
    const { testResults } = req.body;
    const analysis = await tinyTroupeService.analyzeFeedback(testResults);
    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze results' });
  }
});

export default router;
