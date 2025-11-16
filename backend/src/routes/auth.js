import express from 'express';
import { register, login, googleAuth, googleCallback, updatePreferences } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.put('/preferences', authenticateToken, updatePreferences);

export default router;
