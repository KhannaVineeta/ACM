import { supabase } from '../config/database.js';

// Mock data generator for demo/testing purposes
export class MockDataService {
  
  static async generateMockData(userId) {
    console.log('Generating mock data for user:', userId);

    try {
      // Mock Courses
      const courses = [
        { code: 'CS601', name: 'Data Structures', color: '#3B82F6' },
        { code: 'MATH542', name: 'Calculus II', color: '#10B981' },
        { code: 'PHYS195', name: 'Physics I', color: '#F59E0B' },
        { code: 'ENGL220', name: 'Technical Writing', color: '#EF4444' }
      ];

      for (const course of courses) {
        await supabase.from('courses').insert({
          user_id: userId,
          course_code: course.code,
          course_name: course.name,
          color: course.color,
          canvas_course_id: `mock_${course.code}`
        });
      }

      // Mock Tasks/Assignments
      const now = new Date();
      const tasks = [
        {
          title: 'CS601 Programming Assignment 3',
          description: 'Implement Binary Search Tree with insert, delete, and search operations',
          course_code: 'CS601',
          due_date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          estimated_duration: 180,
          priority: 'high',
          difficulty: 'hard'
        },
        {
          title: 'MATH542 Calculus Problem Set',
          description: 'Chapter 5 integration problems',
          course_code: 'MATH542',
          due_date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          estimated_duration: 90,
          priority: 'medium',
          difficulty: 'medium'
        },
        {
          title: 'PHYS195 Lab Report',
          description: 'Write up results from projectile motion experiment',
          course_code: 'PHYS195',
          due_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          estimated_duration: 120,
          priority: 'medium',
          difficulty: 'medium'
        },
        {
          title: 'ENGL220 Research Paper Draft',
          description: 'First draft of technical documentation project',
          course_code: 'ENGL220',
          due_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          estimated_duration: 240,
          priority: 'low',
          difficulty: 'easy'
        },
        {
          title: 'CS601 Quiz 4',
          description: 'Covers trees and graphs',
          course_code: 'CS601',
          due_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          estimated_duration: 45,
          priority: 'high',
          difficulty: 'medium'
        }
      ];

      for (const task of tasks) {
        await supabase.from('tasks').insert({
          user_id: userId,
          ...task,
          status: 'pending',
          source: 'mock'
        });
      }

      // Mock Calendar Events
      const events = [
        {
          title: 'CS601 Data Structures Lecture',
          start_time: new Date(now.setHours(10, 0, 0)).toISOString(),
          end_time: new Date(now.setHours(11, 30, 0)).toISOString(),
          location: 'Engineering Building 101',
          event_type: 'class'
        },
        {
          title: 'MATH542 Calculus Lecture',
          start_time: new Date(now.setHours(13, 0, 0)).toISOString(),
          end_time: new Date(now.setHours(14, 30, 0)).toISOString(),
          location: 'Math Sciences 201',
          event_type: 'class'
        },
        {
          title: 'PHYS195 Lab Session',
          start_time: new Date(now.setHours(15, 0, 0)).toISOString(),
          end_time: new Date(now.setHours(17, 0, 0)).toISOString(),
          location: 'Physics Lab A',
          event_type: 'lab'
        },
        {
          title: 'Study Group - Data Structures',
          start_time: new Date(now.setHours(18, 0, 0)).toISOString(),
          end_time: new Date(now.setHours(20, 0, 0)).toISOString(),
          location: 'Library 3rd Floor',
          event_type: 'study'
        }
      ];

      for (const event of events) {
        await supabase.from('events').insert({
          user_id: userId,
          ...event,
          color: 'blue',
          google_event_id: `mock_${Date.now()}_${Math.random()}`
        });
      }

      // Mock Progress Data (last 7 days)
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        await supabase.from('progress').insert({
          user_id: userId,
          date: date.toISOString().split('T')[0],
          study_hours: Math.random() * 6 + 2, // 2-8 hours
          tasks_completed: Math.floor(Math.random() * 5) + 1, // 1-5 tasks
          tasks_pending: Math.floor(Math.random() * 3),
          mood: ['low', 'normal', 'high'][Math.floor(Math.random() * 3)]
        });
      }

      console.log('✅ Mock data generated successfully!');
      return { success: true };

    } catch (error) {
      console.error('Error generating mock data:', error);
      throw error;
    }
  }

  static async clearMockData(userId) {
    try {
      // Delete all mock data for user
      await supabase.from('tasks').delete().eq('user_id', userId).eq('source', 'mock');
      await supabase.from('events').delete().eq('user_id', userId).like('google_event_id', 'mock_%');
      await supabase.from('courses').delete().eq('user_id', userId).like('canvas_course_id', 'mock_%');
      await supabase.from('progress').delete().eq('user_id', userId);
      
      console.log('✅ Mock data cleared');
      return { success: true };
    } catch (error) {
      console.error('Error clearing mock data:', error);
      throw error;
    }
  }
}
