import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../config/database.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/progress', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    let query = supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) throw error;

    // Calculate streaks
    const streak = calculateStreak(data);

    res.json({ progress: data, streak });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get tasks summary
    const { data: pendingTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending');

    const { data: completedTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed');

    // Get today's progress
    const today = new Date().toISOString().split('T')[0];
    const { data: todayProgress } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    // Get this week's progress
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const { data: weekProgress } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .gte('date', weekStart.toISOString().split('T')[0]);

    const weekHours = weekProgress?.reduce((sum, p) => sum + (p.study_hours || 0), 0) || 0;
    const weekTasksCompleted = weekProgress?.reduce((sum, p) => sum + (p.tasks_completed || 0), 0) || 0;

    res.json({
      pending: pendingTasks?.length || 0,
      completed: completedTasks?.length || 0,
      todayHours: todayProgress?.study_hours || 0,
      todayCompleted: todayProgress?.tasks_completed || 0,
      weekHours: Math.round(weekHours * 10) / 10,
      weekCompleted: weekTasksCompleted,
      mood: todayProgress?.mood || 'normal'
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

function calculateStreak(progressData) {
  if (!progressData || progressData.length === 0) return 0;

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let currentDate = new Date();

  // Check backwards from today
  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayProgress = progressData.find(p => p.date === dateStr);

    if (dayProgress && dayProgress.tasks_completed > 0) {
      streak++;
    } else if (dateStr !== today) {
      // Break streak if no activity (but allow today to be in progress)
      break;
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

export default router;
