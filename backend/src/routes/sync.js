import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { GoogleCalendarService } from '../services/calendarService.js';
import { CanvasService } from '../services/canvasService.js';
import { CanvasCalendarService } from '../services/canvasCalendarService.js';
import { supabase } from '../config/database.js';

const router = express.Router();

// Google Calendar Sync
router.post('/google-calendar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's refresh token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('google_refresh_token')
      .eq('id', userId)
      .single();

    if (userError || !user?.google_refresh_token) {
      return res.status(400).json({ 
        error: 'Google Calendar not connected. Please connect your account first.' 
      });
    }

    console.log('📅 Syncing Google Calendar for user:', userId);
    const result = await GoogleCalendarService.syncCalendar(userId, user.google_refresh_token);

    res.json({
      success: true,
      message: `Successfully synced ${result.eventCount} events from Google Calendar`,
      eventCount: result.eventCount
    });
  } catch (error) {
    console.error('Google Calendar sync error:', error);
    res.status(500).json({ 
      error: 'Failed to sync Google Calendar',
      details: error.message 
    });
  }
});

// Canvas LMS Sync - Courses
router.post('/canvas-courses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's Canvas token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('canvas_token')
      .eq('id', userId)
      .single();

    if (userError || !user?.canvas_token) {
      return res.status(400).json({ 
        error: 'Canvas not connected. Please add your Canvas API token first.' 
      });
    }

    console.log('📚 Syncing Canvas courses for user:', userId);
    const result = await CanvasService.syncCourses(userId, user.canvas_token);

    res.json({
      success: true,
      message: `Successfully synced ${result.courseCount} courses from Canvas`,
      courseCount: result.courseCount
    });
  } catch (error) {
    console.error('Canvas courses sync error:', error);
    res.status(500).json({ 
      error: 'Failed to sync Canvas courses',
      details: error.message 
    });
  }
});

// Canvas LMS Sync - Assignments
router.post('/canvas-assignments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's Canvas token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('canvas_token')
      .eq('id', userId)
      .single();

    if (userError || !user?.canvas_token) {
      return res.status(400).json({ 
        error: 'Canvas not connected. Please add your Canvas API token first.' 
      });
    }

    console.log('📝 Syncing Canvas assignments for user:', userId);
    const result = await CanvasService.syncAssignments(userId, user.canvas_token);

    res.json({
      success: true,
      message: `Successfully synced ${result.assignmentCount} assignments from Canvas`,
      assignmentCount: result.assignmentCount
    });
  } catch (error) {
    console.error('Canvas assignments sync error:', error);
    res.status(500).json({ 
      error: 'Failed to sync Canvas assignments',
      details: error.message 
    });
  }
});

// Canvas LMS Sync - All (courses + assignments + quizzes)
router.post('/canvas-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's Canvas token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('canvas_token')
      .eq('id', userId)
      .single();

    if (userError || !user?.canvas_token) {
      return res.status(400).json({ 
        error: 'Canvas not connected. Please add your Canvas API token first.' 
      });
    }

    console.log('🔄 Full Canvas sync for user:', userId);
    
    const [coursesResult, assignmentsResult, quizzesResult] = await Promise.all([
      CanvasService.syncCourses(userId, user.canvas_token),
      CanvasService.syncAssignments(userId, user.canvas_token),
      CanvasService.syncQuizzes(userId, user.canvas_token)
    ]);

    res.json({
      success: true,
      message: 'Successfully synced all Canvas data',
      courses: coursesResult.courseCount,
      assignments: assignmentsResult.assignmentCount,
      quizzes: quizzesResult.quizzeCount,
      total: coursesResult.courseCount + assignmentsResult.assignmentCount + quizzesResult.quizzeCount
    });
  } catch (error) {
    console.error('Canvas full sync error:', error);
    res.status(500).json({ 
      error: 'Failed to sync Canvas data',
      details: error.message 
    });
  }
});

// Save Canvas Token
router.post('/canvas-token', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { token } = req.body;

    if (!token || !token.trim()) {
      return res.status(400).json({ error: 'Canvas API token is required' });
    }

    // Save token to database
    const { error } = await supabase
      .from('users')
      .update({ canvas_token: token.trim() })
      .eq('id', userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Canvas API token saved successfully'
    });
  } catch (error) {
    console.error('Save Canvas token error:', error);
    res.status(500).json({ 
      error: 'Failed to save Canvas token',
      details: error.message 
    });
  }
});

// Save Canvas Calendar URL
router.post('/canvas-calendar-url', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { calendarUrl } = req.body;

    if (!calendarUrl || !calendarUrl.trim()) {
      return res.status(400).json({ error: 'Canvas calendar URL is required' });
    }

    // Validate URL format
    if (!calendarUrl.includes('.ics') && !calendarUrl.includes('instructure.com')) {
      return res.status(400).json({ error: 'Invalid Canvas calendar URL format' });
    }

    // Save URL to database preferences
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const preferences = user.preferences || {};
    preferences.canvas_calendar_url = calendarUrl.trim();

    const { error } = await supabase
      .from('users')
      .update({ preferences })
      .eq('id', userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Canvas calendar URL saved successfully'
    });
  } catch (error) {
    console.error('Save Canvas calendar URL error:', error);
    res.status(500).json({ 
      error: 'Failed to save Canvas calendar URL',
      details: error.message 
    });
  }
});

// Sync Canvas Calendar from ICS URL
router.post('/canvas-calendar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's Canvas calendar URL
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const calendarUrl = user.preferences?.canvas_calendar_url;
    
    if (!calendarUrl) {
      return res.status(400).json({ 
        error: 'Canvas calendar URL not configured. Please add your Canvas calendar URL first.' 
      });
    }

    console.log('📅 Syncing Canvas calendar from ICS for user:', userId);
    const result = await CanvasCalendarService.syncFromICS(userId, calendarUrl);

    res.json({
      success: true,
      message: `Successfully synced ${result.synced} events from Canvas calendar`,
      synced: result.synced,
      skipped: result.skipped,
      total: result.total
    });
  } catch (error) {
    console.error('Canvas calendar sync error:', error);
    res.status(500).json({ 
      error: 'Failed to sync Canvas calendar',
      details: error.message 
    });
  }
});

// Get sync status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: user, error } = await supabase
      .from('users')
      .select('canvas_token, google_refresh_token, preferences')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const canvasCalendarUrl = user.preferences?.canvas_calendar_url;

    res.json({
      canvas: {
        connected: !!user.canvas_token,
        hasToken: !!user.canvas_token,
        hasCalendarUrl: !!canvasCalendarUrl,
        calendarUrl: canvasCalendarUrl || null
      },
      google: {
        connected: !!user.google_refresh_token,
        hasToken: !!user.google_refresh_token
      }
    });
  } catch (error) {
    console.error('Get sync status error:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

export default router;
