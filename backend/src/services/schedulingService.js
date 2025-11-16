import { supabase } from '../config/database.js';
import { addDays, addHours, format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export class SchedulingService {
  
  /**
   * Find available time slots for a task based on user preferences and calendar
   * @param {string} userId - User ID
   * @param {object} taskInfo - Task information (duration, dueDate, course)
   * @param {object} preferences - User preferences (task_style, daily_task_limit, etc.)
   * @returns {Array} - Available time slots
   */
  static async findAvailableSlots(userId, taskInfo, preferences) {
    const { duration, dueDate, allowSplit = true } = taskInfo;
    const {
      task_style = 'chunks',
      daily_task_limit = 4, // hours per day
      preferred_study_start = '09:00',
      preferred_study_end = '17:00',
      break_duration = 15 // minutes
    } = preferences;

    // Get user's existing events and tasks
    const startSearch = new Date();
    const endSearch = new Date(dueDate);

    const [eventsRes, tasksRes] = await Promise.all([
      supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startSearch.toISOString())
        .lte('start_time', endSearch.toISOString()),
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .gte('due_date', startSearch.toISOString())
        .lte('due_date', endSearch.toISOString())
    ]);

    const existingEvents = eventsRes.data || [];
    const existingTasks = tasksRes.data || [];

    // Calculate total hours needed
    const totalHoursNeeded = duration / 60; // convert minutes to hours
    
    // If user prefers "one-go", try to find a single continuous slot
    if (task_style === 'one-go' && totalHoursNeeded <= daily_task_limit) {
      const slot = await this.findContinuousSlot(
        userId,
        startSearch,
        endSearch,
        duration,
        existingEvents,
        existingTasks,
        preferences
      );
      
      if (slot) {
        return [slot];
      }
    }

    // Otherwise, break into chunks
    return await this.findChunkedSlots(
      userId,
      startSearch,
      endSearch,
      duration,
      existingEvents,
      existingTasks,
      preferences
    );
  }

  /**
   * Find a single continuous time slot
   */
  static async findContinuousSlot(userId, startDate, endDate, durationMinutes, existingEvents, existingTasks, preferences) {
    const {
      preferred_study_start = '09:00',
      preferred_study_end = '17:00'
    } = preferences;

    const durationHours = durationMinutes / 60;
    let currentDay = new Date(startDate);

    // Try each day until due date
    while (currentDay <= endDate) {
      const [startHour, startMinute] = preferred_study_start.split(':').map(Number);
      const [endHour, endMinute] = preferred_study_end.split(':').map(Number);

      const dayStart = new Date(currentDay);
      dayStart.setHours(startHour, startMinute, 0, 0);

      const dayEnd = new Date(currentDay);
      dayEnd.setHours(endHour, endMinute, 0, 0);

      // Try to find a slot on this day
      let slotStart = new Date(dayStart);
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

      while (slotEnd <= dayEnd) {
        // Check if this slot conflicts with existing events/tasks
        const hasConflict = this.hasTimeConflict(slotStart, slotEnd, existingEvents, existingTasks);

        if (!hasConflict) {
          return {
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            duration: durationMinutes,
            date: format(currentDay, 'yyyy-MM-dd')
          };
        }

        // Move to next 30-minute slot
        slotStart = new Date(slotStart.getTime() + 30 * 60 * 1000);
        slotEnd.setTime(slotStart.getTime() + durationMinutes * 60 * 1000);
      }

      // Move to next day
      currentDay = addDays(currentDay, 1);
    }

    return null;
  }

  /**
   * Break task into multiple chunks across days
   */
  static async findChunkedSlots(userId, startDate, endDate, totalDurationMinutes, existingEvents, existingTasks, preferences) {
    const {
      daily_task_limit = 4, // hours
      preferred_study_start = '09:00',
      preferred_study_end = '17:00',
      break_duration = 15
    } = preferences;

    const slots = [];
    let remainingMinutes = totalDurationMinutes;
    let currentDay = new Date(startDate);

    const dailyLimitMinutes = daily_task_limit * 60;

    while (remainingMinutes > 0 && currentDay <= endDate) {
      const [startHour, startMinute] = preferred_study_start.split(':').map(Number);
      const [endHour, endMinute] = preferred_study_end.split(':').map(Number);

      const dayStart = new Date(currentDay);
      dayStart.setHours(startHour, startMinute, 0, 0);

      const dayEnd = new Date(currentDay);
      dayEnd.setHours(endHour, endMinute, 0, 0);

      // Calculate how much time already allocated for this day
      const dayAllocated = this.getTotalAllocatedTimeForDay(currentDay, existingTasks);
      const availableMinutesForDay = dailyLimitMinutes - dayAllocated;

      if (availableMinutesForDay > 0) {
        // Determine chunk size (either what's remaining or daily limit)
        const chunkSize = Math.min(remainingMinutes, availableMinutesForDay);

        // Find a slot on this day for this chunk
        const slot = await this.findSlotInDay(
          dayStart,
          dayEnd,
          chunkSize,
          existingEvents,
          existingTasks
        );

        if (slot) {
          slots.push(slot);
          remainingMinutes -= chunkSize;
        }
      }

      // Move to next day
      currentDay = addDays(currentDay, 1);
    }

    return slots;
  }

  /**
   * Find a slot within a specific day
   */
  static async findSlotInDay(dayStart, dayEnd, durationMinutes, existingEvents, existingTasks) {
    let slotStart = new Date(dayStart);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

    while (slotEnd <= dayEnd) {
      const hasConflict = this.hasTimeConflict(slotStart, slotEnd, existingEvents, existingTasks);

      if (!hasConflict) {
        return {
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          duration: durationMinutes,
          date: format(slotStart, 'yyyy-MM-dd')
        };
      }

      // Move to next 30-minute slot
      slotStart = new Date(slotStart.getTime() + 30 * 60 * 1000);
      slotEnd.setTime(slotStart.getTime() + durationMinutes * 60 * 1000);
    }

    return null;
  }

  /**
   * Check if a time slot conflicts with existing events or tasks
   */
  static hasTimeConflict(slotStart, slotEnd, events, tasks) {
    // Check events
    for (const event of events) {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);

      if (
        (slotStart >= eventStart && slotStart < eventEnd) ||
        (slotEnd > eventStart && slotEnd <= eventEnd) ||
        (slotStart <= eventStart && slotEnd >= eventEnd)
      ) {
        return true;
      }
    }

    // Check scheduled tasks
    for (const task of tasks) {
      if (task.scheduled_start && task.scheduled_end) {
        const taskStart = new Date(task.scheduled_start);
        const taskEnd = new Date(task.scheduled_end);

        if (
          (slotStart >= taskStart && slotStart < taskEnd) ||
          (slotEnd > taskStart && slotEnd <= taskEnd) ||
          (slotStart <= taskStart && slotEnd >= taskEnd)
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get total minutes already allocated for a specific day
   */
  static getTotalAllocatedTimeForDay(day, tasks) {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    let totalMinutes = 0;

    for (const task of tasks) {
      if (task.scheduled_start && task.scheduled_end) {
        const taskStart = new Date(task.scheduled_start);
        const taskEnd = new Date(task.scheduled_end);

        if (
          isWithinInterval(taskStart, { start: dayStart, end: dayEnd }) ||
          isWithinInterval(taskEnd, { start: dayStart, end: dayEnd })
        ) {
          const duration = (taskEnd - taskStart) / (1000 * 60);
          totalMinutes += duration;
        }
      }
    }

    return totalMinutes;
  }

  /**
   * Schedule a task by creating calendar events and setting up reminders
   */
  static async scheduleTask(userId, taskId, slots) {
    const events = [];

    for (const slot of slots) {
      // Get task details
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (!task) continue;

      // Create calendar event for this work session
      const eventData = {
        user_id: userId,
        google_event_id: `task_${taskId}_${Date.now()}_${Math.random()}`,
        title: `Work on: ${task.title}`,
        description: `Scheduled work session for ${task.course_code || 'assignment'}`,
        start_time: slot.start,
        end_time: slot.end,
        event_type: 'study',
        color: '#10b981',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: event } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      events.push(event);

      // Create reminder for this session (15 minutes before)
      const reminderTime = new Date(new Date(slot.start).getTime() - 15 * 60 * 1000);

      await supabase
        .from('reminders')
        .insert({
          user_id: userId,
          task_id: taskId,
          reminder_time: reminderTime.toISOString(),
          status: 'pending',
          created_at: new Date().toISOString()
        });
    }

    // Update task with first scheduled slot
    if (slots.length > 0) {
      await supabase
        .from('tasks')
        .update({
          scheduled_start: slots[0].start,
          scheduled_end: slots[slots.length - 1].end,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);
    }

    return events;
  }
}
