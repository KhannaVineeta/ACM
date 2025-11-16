import { supabase } from '../config/database.js';
import { AIService } from '../services/aiService.js';
import { SchedulingService } from '../services/schedulingService.js';
import { ReminderService } from '../services/reminderService.js';

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`Chat message from user ${userId}: ${message}`);

    // Get user context
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User fetch error:', userError);
      return res.status(500).json({ error: 'Failed to get user context' });
    }

    let parsed;
    let actionResult = {};
    let responseText = '';

    try {
      // Parse message with AI
      parsed = await AIService.parseCommand(message, { preferences: user?.preferences || {} });
      console.log('Parsed intent:', parsed.intent);

      // Handle different intents
      switch (parsed.intent) {
        case 'add_task':
          actionResult = await handleAddTask(userId, parsed.entities);
          responseText = await AIService.generateResponse(message, parsed.intent, actionResult);
          break;

        case 'schedule_task':
          // New: Auto-schedule task based on preferences
          actionResult = await handleScheduleTask(userId, parsed.entities, user?.preferences || {});
          responseText = await AIService.generateResponse(message, 'schedule_task', actionResult);
          break;

        case 'add_event':
          // Handle adding events directly
          actionResult = await handleAddEvent(userId, parsed.entities);
          responseText = await AIService.generateResponse(message, 'add_event', actionResult);
          break;

        case 'query_tasks':
          actionResult = await handleQueryTasks(userId, parsed.entities);
          responseText = await AIService.generateResponse(message, parsed.intent, actionResult);
          break;

        case 'query_schedule':
          actionResult = await handleQueryTasks(userId, { time_range: 'today' });
          responseText = await AIService.generateResponse(message, 'query_schedule', actionResult);
          break;

        case 'reschedule':
          actionResult = await handleReschedule(userId, parsed.entities);
          responseText = await AIService.generateResponse(message, parsed.intent, actionResult);
          break;

        case 'complete_task':
          actionResult = await handleCompleteTask(userId, parsed.entities);
          responseText = await AIService.generateResponse(message, parsed.intent, actionResult);
          break;

        case 'mood_update':
          actionResult = await handleMoodUpdate(userId, parsed.entities);
          responseText = await AIService.generateResponse(message, parsed.intent, actionResult);
          break;

        case 'plan_day':
          // New: Intelligent day planning
          actionResult = await handlePlanDay(userId, parsed.entities);
          responseText = await AIService.generateResponse(message, 'plan_day', actionResult);
          break;

        case 'snooze_reminder':
          // Handle snooze reminder request
          actionResult = await handleSnoozeReminder(userId, parsed.entities);
          responseText = await AIService.generateResponse(message, 'snooze_reminder', actionResult);
          break;

        default:
          responseText = await AIService.generateResponse(message, 'general', {});
      }
    } catch (aiError) {
      console.error('AI Service error:', aiError);
      // Fallback to simple response
      responseText = "I'm here to help! You can ask me to:\n• Add a task or assignment\n• Show your schedule\n• Check what's due soon\n• Reschedule tasks\n• Update your mood\n\nTry: 'Add CS homework due tomorrow'";
      parsed = { intent: 'general', entities: {} };
    }

    // Save chat history
    try {
      await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          message,
          response: responseText,
          intent: parsed.intent,
          entities: parsed.entities
        });
    } catch (saveError) {
      console.error('Failed to save chat message:', saveError);
      // Continue anyway - don't fail the request
    }

    res.json({
      response: responseText,
      intent: parsed.intent,
      actionResult
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({ messages: data.reverse() });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

// Helper functions for handling different intents

async function handleAddEvent(userId, entities) {
  try {
    console.log('🎉 Creating event with entities:', entities);
    const now = new Date();
    let startTime, endTime;

    // Parse time from entities
    if (entities.start_time) {
      // If start_time is provided (from AI), it might be in UTC
      // We need to preserve it as-is if it includes timezone info
      const timeStr = entities.start_time;
      if (timeStr.endsWith('Z')) {
        // UTC time - convert to local
        startTime = new Date(timeStr);
      } else {
        startTime = new Date(timeStr);
      }
    } else if (entities.time) {
      // Handle "at 6 PM" format
      const timeMatch = entities.time.match(/(\d+)\s*(am|pm)/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const isPM = timeMatch[2].toLowerCase() === 'pm';
        if (isPM && hour !== 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;
        
        startTime = new Date(now);
        startTime.setHours(hour, 0, 0, 0);
        if (startTime < now) startTime.setDate(startTime.getDate() + 1);
      }
    } else {
      // Default to next hour
      startTime = new Date(now);
      startTime.setHours(startTime.getHours() + 1, 0, 0, 0);
    }

    // Set end time (default 1 hour duration)
    if (entities.end_time) {
      endTime = new Date(entities.end_time);
    } else {
      endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + (entities.duration ? entities.duration / 60 : 1));
    }

    // Determine event type based on title
    let eventType = entities.type || 'personal';
    const titleLower = (entities.title || '').toLowerCase();
    if (titleLower.includes('study') || titleLower.includes('homework') || titleLower.includes('assignment')) {
      eventType = 'study';
    } else if (titleLower.includes('gym') || titleLower.includes('workout') || titleLower.includes('exercise')) {
      eventType = 'fitness';
    } else if (titleLower.includes('class') || titleLower.includes('lecture') || titleLower.includes('lab')) {
      eventType = 'class';
    } else if (titleLower.includes('work') || titleLower.includes('job')) {
      eventType = 'work';
    } else if (titleLower.includes('friend') || titleLower.includes('party') || titleLower.includes('social')) {
      eventType = 'social';
    }

    const eventData = {
      user_id: userId,
      title: entities.title || 'Event',
      description: entities.description || '',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      location: entities.location || '',
      event_type: eventType,
      color: '#3b82f6',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Inserting event:', eventData);

    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error('❌ Event insert error:', error);
      throw error;
    }

    console.log('✅ Event created successfully:', data);
    return { success: true, event: data };
  } catch (error) {
    console.error('Add event error:', error);
    return { success: false, error: error.message };
  }
}

async function handleAddTask(userId, entities) {
  try {
    const taskData = {
      user_id: userId,
      title: entities.title || 'Untitled Task',
      description: '',
      course_code: entities.course || '',
      priority: entities.priority || 'medium',
      difficulty: entities.difficulty || 'medium',
      estimated_duration: entities.duration || 60,
      status: 'pending',
      source: 'chat'
    };

    // Parse due date
    if (entities.due_date) {
      taskData.due_date = parseDueDate(entities.due_date);
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) throw error;

    return { success: true, task: data };
  } catch (error) {
    console.error('Add task error:', error);
    return { success: false, error: error.message };
  }
}

async function handleQueryTasks(userId, entities) {
  try {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending');

    // Filter by time range
    if (entities.time_range) {
      const { start, end } = getDateRange(entities.time_range);
      query = query.gte('due_date', start).lte('due_date', end);
    }

    // Filter by course
    if (entities.course) {
      query = query.eq('course_code', entities.course);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;

    return { success: true, tasks: data };
  } catch (error) {
    console.error('Query tasks error:', error);
    return { success: false, error: error.message };
  }
}

async function handleReschedule(userId, entities) {
  try {
    // Find task by reference
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .ilike('title', `%${entities.task_reference}%`)
      .single();

    if (!tasks) {
      return { success: false, error: 'Task not found' };
    }

    // Get user's events to find next available slot
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', new Date().toISOString());

    const { data: user } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();

    const nextSlot = AIService.findNextAvailableSlot(
      events,
      tasks.estimated_duration,
      user.preferences
    );

    // Update task
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update({
        scheduled_start: nextSlot.start,
        scheduled_end: nextSlot.end,
        updated_at: new Date().toISOString()
      })
      .eq('id', tasks.id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, task: updatedTask, newSlot: nextSlot };
  } catch (error) {
    console.error('Reschedule error:', error);
    return { success: false, error: error.message };
  }
}

async function handleCompleteTask(userId, entities) {
  try {
    const { data: task } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .ilike('title', `%${entities.task_reference}%`)
      .single();

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, task: data };
  } catch (error) {
    console.error('Complete task error:', error);
    return { success: false, error: error.message };
  }
}

async function handleMoodUpdate(userId, entities) {
  try {
    const mood = entities.mood || 'normal';
    const today = new Date().toISOString().split('T')[0];

    await supabase
      .from('progress')
      .upsert({
        user_id: userId,
        date: today,
        mood: mood
      }, {
        onConflict: 'user_id,date'
      });

    // Get wellness suggestion
    const suggestion = AIService.suggestWellnessActivity(mood);

    return { success: true, mood, suggestion };
  } catch (error) {
    console.error('Mood update error:', error);
    return { success: false, error: error.message };
  }
}

// New: Intelligent day planning from natural language
async function handlePlanDay(userId, entities) {
  try {
    console.log('Planning day with entities:', entities);

    // Get user preferences
    const { data: user } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();

    // Get existing events for context
    const { data: existingEvents } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', new Date().toISOString())
      .order('start_time');

    // Get existing tasks
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('due_date');

    const createdItems = [];

    // Parse and create fixed events (like coffee, TV shows, shopping)
    if (entities.fixed_events && Array.isArray(entities.fixed_events)) {
      for (const event of entities.fixed_events) {
        // Parse times properly - these should already be in the user's local timezone from AI
        // Just use them directly as ISO strings
        let startTime = event.start_time;
        let endTime = event.end_time;
        
        // Ensure times have proper format
        if (startTime && !startTime.includes('T')) {
          startTime = new Date(startTime).toISOString();
        }
        if (endTime && !endTime.includes('T')) {
          endTime = new Date(endTime).toISOString();
        }
        
        const eventData = {
          user_id: userId,
          title: event.title || 'Event',
          start_time: startTime,
          end_time: endTime,
          event_type: event.type || 'personal',
          color: '#3b82f6',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('📝 Creating event:', {
          title: eventData.title,
          start: startTime,
          end: endTime
        });

        const { data: newEvent } = await supabase
          .from('events')
          .insert(eventData)
          .select()
          .single();

        if (newEvent) createdItems.push({ type: 'event', item: newEvent });
      }
    }

    // Parse and create tasks/assignments
    if (entities.tasks && Array.isArray(entities.tasks)) {
      for (const task of entities.tasks) {
        const taskData = {
          user_id: userId,
          title: task.title || 'Task',
          course_code: task.course || '',
          due_date: task.due_date,
          estimated_duration: task.duration || 120,
          priority: task.priority || 'medium',
          difficulty: task.difficulty || 'medium',
          status: 'pending',
          source: 'chat',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newTask } = await supabase
          .from('tasks')
          .insert(taskData)
          .select()
          .single();

        if (newTask) {
          createdItems.push({ type: 'task', item: newTask });

          // Create reminder
          const reminderTime = new Date(newTask.due_date);
          reminderTime.setMinutes(reminderTime.getMinutes() - 30);

          await supabase
            .from('reminders')
            .insert({
              user_id: userId,
              task_id: newTask.id,
              reminder_time: reminderTime.toISOString(),
              status: 'pending'
            });
        }
      }
    }

    // Now schedule the tasks intelligently
    const scheduledTasks = await scheduleTasksIntelligently(
      userId,
      createdItems.filter(i => i.type === 'task').map(i => i.item),
      existingEvents,
      user.preferences
    );

    return {
      success: true,
      created: createdItems.length,
      events: createdItems.filter(i => i.type === 'event').length,
      tasks: createdItems.filter(i => i.type === 'task').length,
      scheduled: scheduledTasks,
      items: createdItems
    };
  } catch (error) {
    console.error('Plan day error:', error);
    return { success: false, error: error.message };
  }
}

// Helper: Intelligently schedule tasks based on user preferences
async function scheduleTasksIntelligently(userId, tasks, existingEvents, preferences) {
  const scheduled = [];
  const taskStyle = preferences.taskStyle || 'single';
  const dailyLimit = preferences.maxTasksPerDay || 3;

  for (const task of tasks) {
    const duration = task.estimated_duration || 120;
    const dueDate = new Date(task.due_date);

    // Find next available slot
    const slot = findNextFreeSlot(existingEvents, duration, preferences);

    if (slot) {
      // Update task with scheduled time
      await supabase
        .from('tasks')
        .update({
          scheduled_start: slot.start,
          scheduled_end: slot.end
        })
        .eq('id', task.id);

      scheduled.push({
        taskId: task.id,
        title: task.title,
        start: slot.start,
        end: slot.end
      });

      // Add to existing events so next task doesn't overlap
      existingEvents.push({
        start_time: slot.start,
        end_time: slot.end,
        title: task.title
      });
    }
  }

  return scheduled;
}

// Helper: Find next free time slot
function findNextFreeSlot(events, durationMinutes, preferences) {
  const now = new Date();
  const preferredStart = preferences.preferredStartHour || 9;
  const preferredEnd = preferences.preferredEndHour || 22;

  // Start checking from now
  let checkTime = new Date(now);
  checkTime.setMinutes(Math.ceil(checkTime.getMinutes() / 30) * 30); // Round to next 30 min

  // Check next 7 days
  for (let day = 0; day < 7; day++) {
    const dayStart = new Date(checkTime);
    dayStart.setDate(dayStart.getDate() + day);
    dayStart.setHours(preferredStart, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(preferredEnd, 0, 0, 0);

    let currentCheck = new Date(dayStart);

    while (currentCheck < dayEnd) {
      const slotEnd = new Date(currentCheck.getTime() + durationMinutes * 60000);

      // Check if this slot conflicts with any existing event
      const hasConflict = events.some(event => {
        const eventStart = new Date(event.start_time);
        const eventEnd = new Date(event.end_time);

        return (currentCheck >= eventStart && currentCheck < eventEnd) ||
               (slotEnd > eventStart && slotEnd <= eventEnd) ||
               (currentCheck <= eventStart && slotEnd >= eventEnd);
      });

      if (!hasConflict) {
        return {
          start: currentCheck.toISOString(),
          end: slotEnd.toISOString()
        };
      }

      // Move to next 30-minute slot
      currentCheck.setMinutes(currentCheck.getMinutes() + 30);
    }
  }

  // If no slot found, return tomorrow morning
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(preferredStart, 0, 0, 0);

  return {
    start: tomorrow.toISOString(),
    end: new Date(tomorrow.getTime() + durationMinutes * 60000).toISOString()
  };
}

function parseDueDate(dateString) {
  // Handle relative dates
  const lowerDate = dateString.toLowerCase();
  const now = new Date();

  if (lowerDate.includes('today')) {
    now.setHours(23, 59, 59);
    return now.toISOString();
  }

  if (lowerDate.includes('tomorrow')) {
    now.setDate(now.getDate() + 1);
    now.setHours(23, 59, 59);
    return now.toISOString();
  }

  if (lowerDate.includes('week')) {
    const weeks = parseInt(lowerDate.match(/\d+/)?.[0] || '1');
    now.setDate(now.getDate() + weeks * 7);
    now.setHours(23, 59, 59);
    return now.toISOString();
  }

  if (lowerDate.includes('day')) {
    const days = parseInt(lowerDate.match(/\d+/)?.[0] || '1');
    now.setDate(now.getDate() + days);
    now.setHours(23, 59, 59);
    return now.toISOString();
  }

  // Try to parse as ISO date
  try {
    return new Date(dateString).toISOString();
  } catch {
    // Default to 7 days from now
    now.setDate(now.getDate() + 7);
    now.setHours(23, 59, 59);
    return now.toISOString();
  }
}

function getDateRange(timeRange) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (timeRange.toLowerCase()) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'tomorrow':
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 1);
      end.setHours(23, 59, 59, 999);
      break;
    case 'this week':
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + (6 - end.getDay()));
      end.setHours(23, 59, 59, 999);
      break;
    case 'next week':
      start.setDate(start.getDate() + (7 - start.getDay()));
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      end.setDate(end.getDate() + 30);
  }

  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
}

// New: Handle auto-scheduling of tasks
async function handleScheduleTask(userId, entities, userPreferences) {
  try {
    const { title, course, due_date, duration = 120, priority = 'medium', difficulty = 'medium', auto_schedule = true } = entities;

    if (!title) {
      return { success: false, message: 'Task title is required' };
    }

    // Parse due date
    const dueDate = due_date ? parseDueDate(due_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Create the task first
    const taskData = {
      user_id: userId,
      title,
      description: `Auto-scheduled task for ${course || 'course'}`,
      due_date: dueDate,
      estimated_duration: duration,
      priority,
      difficulty,
      status: 'pending',
      course_code: course,
      source: 'chat',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (taskError) {
      console.error('Task creation error:', taskError);
      return { success: false, message: 'Failed to create task' };
    }

    // If auto_schedule is enabled, find available slots and schedule
    if (auto_schedule) {
      const taskInfo = {
        duration,
        dueDate: new Date(dueDate),
        allowSplit: userPreferences.task_style !== 'one-go'
      };

      const slots = await SchedulingService.findAvailableSlots(userId, taskInfo, userPreferences);

      if (slots && slots.length > 0) {
        // Schedule the task in the found slots
        await SchedulingService.scheduleTask(userId, task.id, slots);

        return {
          success: true,
          task,
          slots,
          message: `Task scheduled! I found ${slots.length} ${slots.length === 1 ? 'session' : 'sessions'} for you to work on "${title}".${
            slots.length > 1 
              ? ` Since you prefer ${userPreferences.task_style === 'one-go' ? 'working in one go' : 'breaking tasks into chunks'}, I've ${userPreferences.task_style === 'one-go' ? 'scheduled a single session' : 'split it across multiple days'}.`
              : ''
          }`
        };
      } else {
        return {
          success: false,
          task,
          message: `I created the task "${title}" but couldn't find available time slots before the due date. Your schedule is quite full! Would you like me to reschedule some other tasks?`
        };
      }
    }

    return { success: true, task };
  } catch (error) {
    console.error('Schedule task error:', error);
    return { success: false, message: 'Failed to schedule task' };
  }
}

// Handle snooze reminder via chat
async function handleSnoozeReminder(userId, entities) {
  try {
    const { reminder_id, duration = 120 } = entities;

    // If no specific reminder ID, get the most recent active reminder
    if (!reminder_id) {
      const { data: reminders } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'triggered')
        .order('reminder_time', { ascending: false })
        .limit(1);

      if (reminders && reminders.length > 0) {
        const result = await ReminderService.snoozeReminder(reminders[0].id, duration);
        return result;
      } else {
        return {
          success: false,
          message: "You don't have any active reminders to snooze right now."
        };
      }
    }

    const result = await ReminderService.snoozeReminder(reminder_id, duration);
    return result;
  } catch (error) {
    console.error('Snooze reminder error:', error);
    return { success: false, message: 'Failed to snooze reminder' };
  }
}
