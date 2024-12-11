import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { TinyTroupeService } from '../services/tinytroupe';
import { getTestById } from '../services/test';
import { getPersonaById } from '../services/persona';

const router = Router();
const tinyTroupeService = new TinyTroupeService({
  pythonPath: process.env.PYTHON_PATH || 'python3',
  scriptPath: process.env.TINYTROUPE_SCRIPT_PATH || '/path/to/tinytroupe_script.py',
});

// Run a simulation for a test with specific personas
router.post('/run/:testId', authenticateToken, async (req, res) => {
  try {
    const { testId } = req.params;
    const { personaIds } = req.body;

    // Get test and personas
    const test = await getTestById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const results = [];
    for (const personaId of personaIds) {
      const persona = await getPersonaById(personaId);
      if (!persona) {
        return res.status(404).json({ error: `Persona ${personaId} not found` });
      }

      const simulationResult = await tinyTroupeService.runTestSimulation(test, persona);
      results.push({
        personaId,
        result: simulationResult,
      });
    }

    res.json({ results });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Failed to run simulation' });
  }
});

// Generate traits for a persona
router.post('/generate-traits', authenticateToken, async (req, res) => {
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
router.post('/analyze', authenticateToken, async (req, res) => {
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
