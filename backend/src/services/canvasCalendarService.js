import axios from 'axios';
import ical from 'ical';
import { supabase } from '../config/database.js';

export class CanvasCalendarService {
  
  /**
   * Sync Canvas calendar from ICS feed URL
   * @param {string} userId - User ID
   * @param {string} icsUrl - Canvas calendar ICS feed URL
   */
  static async syncFromICS(userId, icsUrl) {
    try {
      console.log('📅 Fetching Canvas calendar feed from:', icsUrl);

      // Fetch ICS feed
      const response = await axios.get(icsUrl, {
        headers: {
          'User-Agent': 'MindFlow/1.0'
        },
        timeout: 10000
      });

      // Parse ICS data
      const events = ical.parseICS(response.data);
      
      let syncedCount = 0;
      let skippedCount = 0;

      for (const eventKey in events) {
        const event = events[eventKey];
        
        // Only process events (not todos or journals)
        if (event.type !== 'VEVENT') continue;

        // Skip past events
        const startDate = new Date(event.start);
        if (startDate < new Date()) {
          skippedCount++;
          continue;
        }

        const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 60 * 60 * 1000);

        // Determine event type based on summary
        let eventType = 'class';
        let courseCode = '';
        
        const summary = event.summary || 'Untitled';
        
        // Extract course code (e.g., CS 601, MATH 250)
        const courseMatch = summary.match(/([A-Z]{2,4})\s*(\d{3})/i);
        if (courseMatch) {
          courseCode = `${courseMatch[1]}${courseMatch[2]}`.toUpperCase();
        }

        // Determine type based on keywords
        if (summary.toLowerCase().includes('assignment') || summary.toLowerCase().includes('due')) {
          eventType = 'assignment';
        } else if (summary.toLowerCase().includes('quiz') || summary.toLowerCase().includes('test')) {
          eventType = 'quiz';
        } else if (summary.toLowerCase().includes('exam')) {
          eventType = 'exam';
        } else if (summary.toLowerCase().includes('lab')) {
          eventType = 'lab';
        } else if (summary.toLowerCase().includes('lecture') || summary.toLowerCase().includes('class')) {
          eventType = 'class';
        }

        // Create event data
        const eventData = {
          user_id: userId,
          google_event_id: `canvas_${event.uid || eventKey}`, // Use Canvas UID
          title: summary,
          description: event.description || '',
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          location: event.location || '',
          event_type: eventType,
          color: this.getColorForType(eventType),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // For assignments, also create a task
        if (eventType === 'assignment' || eventType === 'quiz' || eventType === 'exam') {
          const duration = eventType === 'exam' ? 120 : eventType === 'quiz' ? 60 : 90;
          const priority = this.calculatePriority(startDate);

          const taskData = {
            user_id: userId,
            canvas_assignment_id: `canvas_ics_${event.uid || eventKey}`,
            title: summary,
            description: event.description || '',
            due_date: startDate.toISOString(),
            estimated_duration: duration,
            priority: priority,
            difficulty: 'medium',
            status: 'pending',
            course_code: courseCode,
            source: 'canvas',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Insert task (upsert to avoid duplicates)
          await supabase
            .from('tasks')
            .upsert(taskData, {
              onConflict: 'canvas_assignment_id',
              ignoreDuplicates: false
            });
        }

        // Insert event (upsert to avoid duplicates)
        const { error } = await supabase
          .from('events')
          .upsert(eventData, {
            onConflict: 'google_event_id',
            ignoreDuplicates: false
          });

        if (!error) {
          syncedCount++;
        }
      }

      console.log(`✅ Canvas calendar sync complete: ${syncedCount} events synced, ${skippedCount} past events skipped`);

      return {
        success: true,
        synced: syncedCount,
        skipped: skippedCount,
        total: syncedCount + skippedCount
      };

    } catch (error) {
      console.error('Canvas ICS sync error:', error);
      throw new Error(`Failed to sync Canvas calendar: ${error.message}`);
    }
  }

  static calculatePriority(dueDate) {
    const now = new Date();
    const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);

    if (daysUntilDue <= 1) return 'high';
    if (daysUntilDue <= 3) return 'medium';
    return 'low';
  }

  static getColorForType(type) {
    const colors = {
      'assignment': '#F59E0B', // orange
      'quiz': '#8B5CF6',      // purple
      'exam': '#EF4444',      // red
      'lab': '#10B981',       // green
      'class': '#3B82F6',     // blue
      'default': '#6B7280'    // gray
    };
    return colors[type] || colors.default;
  }
}
