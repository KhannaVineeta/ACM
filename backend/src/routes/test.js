import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../config/database.js';
import { ReminderService } from '../services/reminderService.js';

const router = express.Router();
const reminderService = new ReminderService();

// Test endpoint to create a reminder that triggers immediately
router.post('/trigger-reminder', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get the first pending task
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .limit(1);

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ error: 'No pending tasks found. Create a task first!' });
    }

    const task = tasks[0];

    // Create a reminder that triggers in 5 seconds
    const reminderTime = new Date(Date.now() + 5000); // 5 seconds from now

    const { data: reminder } = await supabase
      .from('reminders')
      .insert({
        user_id: userId,
        task_id: task.id,
        reminder_time: reminderTime.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    res.json({
      success: true,
      message: `Reminder created! Will trigger in 5 seconds for task: "${task.title}"`,
      reminder,
      task: {
        id: task.id,
        title: task.title
      }
    });
  } catch (error) {
    console.error('Test reminder error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to get all reminders
router.get('/reminders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data: reminders } = await supabase
      .from('reminders')
      .select(`
        *,
        task:tasks(id, title, description, due_date)
      `)
      .eq('user_id', userId)
      .order('reminder_time', { ascending: false })
      .limit(20);

    res.json({ reminders });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to manually check reminders
router.post('/check-reminders', authenticateToken, async (req, res) => {
  try {
    const result = await reminderService.checkDueReminders();
    const snoozedResult = await reminderService.checkSnoozedReminders();
    
    res.json({
      success: true,
      dueReminders: result,
      snoozedReminders: snoozedResult,
      message: 'Checked reminders manually'
    });
  } catch (error) {
    console.error('Check reminders error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
