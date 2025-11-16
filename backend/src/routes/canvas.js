import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { CanvasService } from '../services/canvasService.js';
import { supabase } from '../config/database.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/connect', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { canvasToken } = req.body;

    await supabase
      .from('users')
      .update({ canvas_token: canvasToken })
      .eq('id', userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Connect Canvas error:', error);
    res.status(500).json({ error: 'Failed to connect Canvas' });
  }
});

router.post('/sync', async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: user } = await supabase
      .from('users')
      .select('canvas_token')
      .eq('id', userId)
      .single();

    if (!user.canvas_token) {
      return res.status(400).json({ error: 'Canvas not connected' });
    }

    // Sync courses, assignments, and quizzes
    const coursesResult = await CanvasService.syncCourses(userId, user.canvas_token);
    const assignmentsResult = await CanvasService.syncAssignments(userId, user.canvas_token);
    const quizzesResult = await CanvasService.syncQuizzes(userId, user.canvas_token);

    res.json({
      success: true,
      courses: coursesResult.courseCount,
      assignments: assignmentsResult.assignmentCount,
      quizzes: quizzesResult.quizzeCount
    });
  } catch (error) {
    console.error('Sync Canvas error:', error);
    res.status(500).json({ error: 'Failed to sync Canvas' });
  }
});

router.get('/courses', async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ courses: data });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

export default router;
