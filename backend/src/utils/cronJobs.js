import cron from 'node-cron';
import { supabase } from '../config/database.js';
import { GoogleCalendarService } from '../services/calendarService.js';
import { CanvasService } from '../services/canvasService.js';
import { ReminderService } from '../services/reminderService.js';

// Sync Calendar and Canvas every 15 minutes
export const startSyncJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    console.log('Running auto-sync job...');

    try {
      // Get all users with connected accounts
      const { data: users } = await supabase
        .from('users')
        .select('id, google_refresh_token, canvas_token')
        .not('google_refresh_token', 'is', null)
        .not('canvas_token', 'is', null);

      for (const user of users) {
        try {
          // Sync Google Calendar
          if (user.google_refresh_token) {
            await GoogleCalendarService.syncCalendar(user.id, user.google_refresh_token);
          }

          // Sync Canvas
          if (user.canvas_token) {
            await CanvasService.syncCourses(user.id, user.canvas_token);
            await CanvasService.syncAssignments(user.id, user.canvas_token);
            await CanvasService.syncQuizzes(user.id, user.canvas_token);
          }
        } catch (error) {
          console.error(`Sync error for user ${user.id}:`, error);
        }
      }

      console.log('Auto-sync completed');
    } catch (error) {
      console.error('Sync job error:', error);
    }
  });

  console.log('Auto-sync job started (runs every 15 minutes)');
};

// Check reminders every minute
export const startReminderJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      // Check and trigger due reminders
      await ReminderService.checkDueReminders();
      
      // Check and reactivate snoozed reminders
      await ReminderService.checkSnoozedReminders();
    } catch (error) {
      console.error('Reminder job error:', error);
    }
  });

  console.log('Reminder job started (runs every minute)');
};
