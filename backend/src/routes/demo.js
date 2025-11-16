import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { MockDataService } from '../services/mockDataService.js';

const router = express.Router();

router.use(authenticateToken);

// Generate mock data for demo
router.post('/generate', async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await MockDataService.generateMockData(userId);
    res.json(result);
  } catch (error) {
    console.error('Generate mock data error:', error);
    res.status(500).json({ error: 'Failed to generate mock data' });
  }
});

// Clear mock data
router.delete('/clear', async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await MockDataService.clearMockData(userId);
    res.json(result);
  } catch (error) {
    console.error('Clear mock data error:', error);
    res.status(500).json({ error: 'Failed to clear mock data' });
  }
});

export default router;
