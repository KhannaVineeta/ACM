import { google } from 'googleapis';
import { getGoogleClient } from '../config/google.js';
import { supabase } from '../config/database.js';

export class GoogleCalendarService {
  
  static async syncCalendar(userId, refreshToken) {
    try {
      const auth = getGoogleClient(refreshToken);
      const calendar = google.calendar({ version: 'v3', auth });

      // Get events from the next 30 days
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = response.data.items;

      // Store events in database
      for (const event of events) {
        const startTime = event.start.dateTime || event.start.date;
        const endTime = event.end.dateTime || event.end.date;

        await supabase
          .from('events')
          .upsert({
            user_id: userId,
            google_event_id: event.id,
            title: event.summary || 'Untitled Event',
            description: event.description || '',
            start_time: startTime,
            end_time: endTime,
            location: event.location || '',
            event_type: 'event',
            color: 'blue',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'google_event_id'
          });
      }

      return { success: true, eventCount: events.length };
    } catch (error) {
      console.error('Calendar sync error:', error);
      throw error;
    }
  }

  static async addEvent(userId, refreshToken, eventData) {
    try {
      const auth = getGoogleClient(refreshToken);
      const calendar = google.calendar({ version: 'v3', auth });

      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime,
          timeZone: 'America/Los_Angeles' // SDSU timezone
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: 'America/Los_Angeles'
        },
        location: eventData.location,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'popup', minutes: 10 }
          ]
        }
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      // Store in database
      await supabase
        .from('events')
        .insert({
          user_id: userId,
          google_event_id: response.data.id,
          title: eventData.title,
          description: eventData.description,
          start_time: eventData.startTime,
          end_time: eventData.endTime,
          location: eventData.location,
          event_type: 'event',
          color: 'blue'
        });

      return { success: true, eventId: response.data.id };
    } catch (error) {
      console.error('Add event error:', error);
      throw error;
    }
  }

  static async getUserEvents(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startDate)
        .lte('end_time', endDate)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get events error:', error);
      throw error;
    }
  }
}
