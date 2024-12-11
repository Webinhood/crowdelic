import express from 'express';
import { CostsService } from '../services/costs_service';
import { auth } from '../middleware/auth';

const costsRouter = express.Router();
const costsService = new CostsService();

// Get overall usage stats
costsRouter.get('/usage', auth, async (req, res) => {
  try {
    const stats = await costsService.getUsageStats();
    res.json(stats);
  } catch (error) {
    console.error('Error in /usage route:', error);
    res.status(500).json({ error: 'Failed to fetch usage stats' });
  }
});

// Get usage stats for a specific test
costsRouter.get('/test/:testId/usage', auth, async (req, res) => {
  try {
    const { testId } = req.params;
    const stats = await costsService.getTestUsageStats(testId);
    res.json(stats);
  } catch (error) {
    console.error(`Error in /test/${req.params.testId}/usage route:`, error);
    res.status(500).json({ error: 'Failed to fetch test usage stats' });
  }
});

export { costsRouter };
