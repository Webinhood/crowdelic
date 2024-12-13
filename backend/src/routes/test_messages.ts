import { Router } from 'express';
import { prisma } from '../config/database';
import { verifyToken } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

// Get messages for a test
router.get('/:testId/messages', verifyToken, async (req, res) => {
  const { testId } = req.params;
  
  try {
    const messages = await prisma.testResult.findMany({
      where: {
        test_id: testId,
        deleted_at: null
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    return res.json(messages);
  } catch (error) {
    logger.error('Error getting test messages:', error);
    return res.status(500).json({ error: 'Failed to get test messages' });
  }
});

// Delete a message
router.delete('/:testId/messages/:messageId', verifyToken, async (req, res) => {
  const { testId, messageId } = req.params;
  
  try {
    await prisma.testResult.update({
      where: {
        id: messageId,
        test_id: testId
      },
      data: {
        deleted_at: new Date()
      }
    });

    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting test message:', error);
    return res.status(500).json({ error: 'Failed to delete test message' });
  }
});

export const testMessagesRouter = router;
