import express from 'express';
import { sendMessage, getChatHistory } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', sendMessage);
router.get('/history', getChatHistory);

export default router;
