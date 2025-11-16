import { supabase } from '../config/database.js';

export class ReminderService {
  
  /**
   * Check for due reminders and trigger them
   */
  static async checkDueReminders() {
    try {
      const now = new Date().toISOString();

      // Get all pending reminders that are due
      const { data: reminders, error } = await supabase
        .from('reminders')
        .select('*, tasks(*)')
        .eq('status', 'pending')
        .lte('reminder_time', now);

      if (error) {
        console.error('Error fetching reminders:', error);
        return;
      }

      if (!reminders || reminders.length === 0) {
        return;
      }

      console.log(`📢 Found ${reminders.length} due reminders`);

      for (const reminder of reminders) {
        await this.triggerReminder(reminder);
      }
    } catch (error) {
      console.error('Check reminders error:', error);
    }
  }

  /**
   * Trigger a specific reminder
   */
  static async triggerReminder(reminder) {
    try {
      console.log(`🔔 Triggering reminder for task: ${reminder.tasks?.title}`);

      // Update reminder status to 'triggered'
      await supabase
        .from('reminders')
        .update({ 
          status: 'triggered',
          updated_at: new Date().toISOString()
        })
        .eq('id', reminder.id);

      // In a real app, you would send push notification, email, or SMS here
      // For now, we'll just log it
      console.log(`Reminder: Time to work on "${reminder.tasks?.title}"!`);
      
      return {
        success: true,
        reminder,
        task: reminder.tasks
      };
    } catch (error) {
      console.error('Trigger reminder error:', error);
      return { success: false };
    }
  }

  /**
   * Snooze a reminder for a specified duration
   */
  static async snoozeReminder(reminderId, snoozeDuration = 120) {
    try {
      const snoozeUntil = new Date(Date.now() + snoozeDuration * 60 * 1000);

      // Update reminder with snooze time
      const { data, error } = await supabase
        .from('reminders')
        .update({
          status: 'snoozed',
          snoozed_until: snoozeUntil.toISOString(),
          reminder_time: snoozeUntil.toISOString(), // Reschedule for after snooze
          updated_at: new Date().toISOString()
        })
        .eq('id', reminderId)
        .select('*, tasks(*)')
        .single();

      if (error) {
        console.error('Snooze reminder error:', error);
        return { success: false, message: 'Failed to snooze reminder' };
      }

      console.log(`⏰ Reminder snoozed until ${snoozeUntil.toLocaleString()}`);

      return {
        success: true,
        reminder: data,
        message: `Reminder snoozed for ${snoozeDuration} minutes. I'll remind you again at ${snoozeUntil.toLocaleTimeString()}.`
      };
    } catch (error) {
      console.error('Snooze reminder error:', error);
      return { success: false };
    }
  }

  /**
   * Check snoozed reminders and reactivate them
   */
  static async checkSnoozedReminders() {
    try {
      const now = new Date().toISOString();

      // Get snoozed reminders that are past their snooze time
      const { data: reminders, error } = await supabase
        .from('reminders')
        .select('*, tasks(*)')
        .eq('status', 'snoozed')
        .lte('snoozed_until', now);

      if (error) {
        console.error('Error fetching snoozed reminders:', error);
        return;
      }

      if (!reminders || reminders.length === 0) {
        return;
      }

      console.log(`⏰ Reactivating ${reminders.length} snoozed reminders`);

      for (const reminder of reminders) {
        // Reactivate the reminder
        await supabase
          .from('reminders')
          .update({ 
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', reminder.id);

        // Trigger it immediately
        await this.triggerReminder(reminder);
      }
    } catch (error) {
      console.error('Check snoozed reminders error:', error);
    }
  }

  /**
   * Dismiss a reminder
   */
  static async dismissReminder(reminderId) {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({
          status: 'dismissed',
          updated_at: new Date().toISOString()
        })
        .eq('id', reminderId);

      if (error) {
        console.error('Dismiss reminder error:', error);
        return { success: false };
      }

      return { 
        success: true, 
        message: 'Reminder dismissed' 
      };
    } catch (error) {
      console.error('Dismiss reminder error:', error);
      return { success: false };
    }
  }

  /**
   * Reschedule a task and its reminders
   */
  static async rescheduleTaskReminders(taskId, newSlots) {
    try {
      // Delete old reminders for this task
      await supabase
        .from('reminders')
        .delete()
        .eq('task_id', taskId)
        .in('status', ['pending', 'snoozed']);

      // Create new reminders for each slot
      for (const slot of newSlots) {
        const reminderTime = new Date(new Date(slot.start).getTime() - 15 * 60 * 1000);

        await supabase
          .from('reminders')
          .insert({
            task_id: taskId,
            reminder_time: reminderTime.toISOString(),
            status: 'pending',
            created_at: new Date().toISOString()
          });
      }

      return { 
        success: true,
        message: `Reminders rescheduled for ${newSlots.length} ${newSlots.length === 1 ? 'session' : 'sessions'}`
      };
    } catch (error) {
      console.error('Reschedule reminders error:', error);
      return { success: false };
    }
  }

  /**
   * Get active reminders for a user
   */
  static async getActiveReminders(userId) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*, tasks(*)')
        .eq('tasks.user_id', userId)
        .in('status', ['pending', 'triggered', 'snoozed'])
        .order('reminder_time', { ascending: true });

      if (error) {
        console.error('Get active reminders error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get active reminders error:', error);
      return [];
    }
  }
}
