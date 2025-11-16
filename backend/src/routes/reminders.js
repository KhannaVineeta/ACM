import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { ReminderService } from '../services/reminderService.js';
import { SchedulingService } from '../services/schedulingService.js';
import { supabase } from '../config/database.js';

const router = express.Router();

router.use(authenticateToken);

// Get active reminders
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const reminders = await ReminderService.getActiveReminders(userId);
    res.json({ reminders });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Failed to get reminders' });
  }
});

// Snooze a reminder
router.post('/:id/snooze', async (req, res) => {
  try {
    const { id } = req.params;
    const { duration = 120 } = req.body; // default 2 hours

    const result = await ReminderService.snoozeReminder(id, duration);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Snooze reminder error:', error);
    res.status(500).json({ error: 'Failed to snooze reminder' });
  }
});

// Dismiss a reminder
router.post('/:id/dismiss', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await ReminderService.dismissReminder(id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Dismiss reminder error:', error);
    res.status(500).json({ error: 'Failed to dismiss reminder' });
  }
});

// Reschedule task from reminder
router.post('/:id/reschedule', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Get reminder and task info
    const { data: reminder } = await supabase
      .from('reminders')
      .select('*, tasks(*)')
      .eq('id', id)
      .single();

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Get user preferences
    const { data: user } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();

    const preferences = user?.preferences || {};
    
    // Find new available slots
    const taskInfo = {
      duration: reminder.tasks.estimated_duration,
      dueDate: new Date(reminder.tasks.due_date),
      allowSplit: preferences.task_style !== 'one-go'
    };

    const slots = await SchedulingService.findAvailableSlots(userId, taskInfo, preferences);

    if (slots && slots.length > 0) {
      // Reschedule the task
      await SchedulingService.scheduleTask(userId, reminder.task_id, slots);
      
      // Dismiss old reminder
      await ReminderService.dismissReminder(id);

      res.json({
        success: true,
        slots,
        message: `Task rescheduled to ${slots.length} new ${slots.length === 1 ? 'session' : 'sessions'}!`
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Could not find available time slots. Please manually reschedule.'
      });
    }
  } catch (error) {
    console.error('Reschedule task error:', error);
    res.status(500).json({ error: 'Failed to reschedule task' });
  }
});

export default router;
