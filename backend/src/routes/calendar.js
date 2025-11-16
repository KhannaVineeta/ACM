import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { GoogleCalendarService } from '../services/calendarService.js';
import { supabase } from '../config/database.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    console.log('📅 Calendar request:', { userId, startDate, endDate });

    const start = startDate || new Date().toISOString();
    const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Debug: Check total events in database
    const { data: allEvents } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId);
    console.log(`📊 Total events in database for user: ${allEvents?.length || 0}`);

    // First, get events from database (works in demo mode and with synced events)
    const { data: dbEvents, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', start)
      .lte('start_time', end)
      .order('start_time');

    if (error) {
      console.error('Database query error:', error);
      return res.json({ events: [] });
    }

    console.log(`✅ Found ${dbEvents?.length || 0} events in range [${start} to ${end}]`);
    if (dbEvents && dbEvents.length > 0) {
      console.log('First event:', dbEvents[0].title, 'at', dbEvents[0].start_time);
    }
    res.json({ events: dbEvents || [] });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events', events: [] });
  }
});

router.post('/sync', async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: user } = await supabase
      .from('users')
      .select('google_refresh_token')
      .eq('id', userId)
      .single();

    if (!user.google_refresh_token) {
      return res.status(400).json({ error: 'Google account not connected' });
    }

    const result = await GoogleCalendarService.syncCalendar(userId, user.google_refresh_token);
    res.json(result);
  } catch (error) {
    console.error('Sync calendar error:', error);
    res.status(500).json({ error: 'Failed to sync calendar' });
  }
});

router.post('/add', async (req, res) => {
  try {
    const userId = req.user.userId;
    const eventData = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('google_refresh_token')
      .eq('id', userId)
      .single();

    if (!user.google_refresh_token) {
      return res.status(400).json({ error: 'Google account not connected' });
    }

    const result = await GoogleCalendarService.addEvent(userId, user.google_refresh_token, eventData);
    res.json(result);
  } catch (error) {
    console.error('Add event error:', error);
    res.status(500).json({ error: 'Failed to add event' });
  }
});

// Debug endpoint to see all events
router.get('/debug/all', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const { data: allEvents, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('start_time')
      .limit(20);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ 
      count: allEvents?.length || 0,
      events: allEvents || []
    });
  } catch (error) {
    console.error('Debug events error:', error);
    res.status(500).json({ error: 'Failed to fetch debug events' });
  }
});

export default router;
