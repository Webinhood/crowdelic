import express from 'express';
import { CostsService } from '../services/costs_service';
import { verifyToken } from '../middleware/auth';

const costsRouter = express.Router();
const costsService = new CostsService();

// Get overall usage stats
costsRouter.get('/usage', verifyToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).userRole;
    
    // Only admins can see overall stats
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view overall usage stats' });
    }

    const stats = await costsService.getUsageStats();
    res.json({
      ...stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /usage route:', error);
    res.status(500).json({ error: 'Failed to fetch usage stats' });
  }
});

// Get usage stats for a specific test
costsRouter.get('/test/:testId/usage', verifyToken, async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = (req as any).user.id;

    // Verify test ownership
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: { user_id: true }
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (test.user_id !== userId && (req as any).userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view test usage stats' });
    }

    const stats = await costsService.getTestUsageStats(testId);
    res.json({
      ...stats,
      testId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error in /test/${req.params.testId}/usage route:`, error);
    res.status(500).json({ error: 'Failed to fetch test usage stats' });
  }
});

export { costsRouter };
