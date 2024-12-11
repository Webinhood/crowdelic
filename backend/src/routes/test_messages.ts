import { Router } from 'express';
import { pool } from '../db';
import { auth } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

// Get messages for a test
router.get('/:testId/messages', auth, async (req, res) => {
  const { testId } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT * FROM test_messages 
       WHERE test_id = $1 
       AND deleted_at IS NULL 
       ORDER BY created_at ASC`,
      [testId]
    );

    return res.json(result.rows);
  } catch (error) {
    logger.error('Error getting test messages:', error);
    return res.status(500).json({ error: 'Failed to get test messages' });
  }
});

// Delete a message
router.delete('/:testId/messages/:messageId', auth, async (req, res) => {
  const { testId, messageId } = req.params;
  
  try {
    // Soft delete
    await pool.query(
      `UPDATE test_messages 
       SET deleted_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND test_id = $2`,
      [messageId, testId]
    );

    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting test message:', error);
    return res.status(500).json({ error: 'Failed to delete test message' });
  }
});

export const testMessagesRouter = router;
