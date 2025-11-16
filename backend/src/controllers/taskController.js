import { supabase } from '../config/database.js';
import { AIService } from '../services/aiService.js';

export const getTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, startDate, endDate } = req.query;

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('due_date', startDate);
    }

    if (endDate) {
      query = query.lte('due_date', endDate);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;

    res.json({ tasks: data });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const taskData = req.body;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: taskData.title,
        description: taskData.description || '',
        due_date: taskData.dueDate,
        estimated_duration: taskData.duration || 60,
        priority: taskData.priority || 'medium',
        difficulty: taskData.difficulty || 'medium',
        status: 'pending',
        course_code: taskData.courseCode || '',
        source: 'manual'
      })
      .select()
      .single();

    if (error) throw error;

    // Create reminder 30 minutes before scheduled time
    if (data.scheduled_start) {
      const reminderTime = new Date(data.scheduled_start);
      reminderTime.setMinutes(reminderTime.getMinutes() - 30);

      await supabase
        .from('reminders')
        .insert({
          user_id: userId,
          task_id: data.id,
          reminder_time: reminderTime.toISOString(),
          status: 'pending'
        });
    }

    res.json({ task: data });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const taskId = req.params.id;
    const updates = req.body;

    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ task: data });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const taskId = req.params.id;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

export const completeTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const taskId = req.params.id;

    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Update progress for today
    const today = new Date().toISOString().split('T')[0];
    const { data: progress } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (progress) {
      await supabase
        .from('progress')
        .update({
          tasks_completed: progress.tasks_completed + 1,
          study_hours: progress.study_hours + (data.estimated_duration / 60)
        })
        .eq('user_id', userId)
        .eq('date', today);
    } else {
      await supabase
        .from('progress')
        .insert({
          user_id: userId,
          date: today,
          tasks_completed: 1,
          study_hours: data.estimated_duration / 60,
          tasks_pending: 0
        });
    }

    res.json({ task: data });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
};
