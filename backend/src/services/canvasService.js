import axios from 'axios';
import { supabase } from '../config/database.js';

export class CanvasService {
  
  static async syncCourses(userId, canvasToken) {
    try {
      const baseUrl = process.env.CANVAS_API_URL;
      
      const response = await axios.get(`${baseUrl}/courses`, {
        headers: {
          'Authorization': `Bearer ${canvasToken}`
        },
        params: {
          enrollment_state: 'active',
          per_page: 100
        }
      });

      const courses = response.data;

      // Store courses in database
      for (const course of courses) {
        await supabase
          .from('courses')
          .upsert({
            user_id: userId,
            canvas_course_id: course.id.toString(),
            course_code: course.course_code || '',
            course_name: course.name,
            color: this.generateCourseColor(course.id),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'canvas_course_id'
          });
      }

      return { success: true, courseCount: courses.length };
    } catch (error) {
      console.error('Canvas courses sync error:', error);
      throw error;
    }
  }

  static async syncAssignments(userId, canvasToken) {
    try {
      const baseUrl = process.env.CANVAS_API_URL;
      
      // Get all active courses first
      const { data: courses } = await supabase
        .from('courses')
        .select('canvas_course_id, course_code')
        .eq('user_id', userId);

      let totalAssignments = 0;

      for (const course of courses) {
        const response = await axios.get(
          `${baseUrl}/courses/${course.canvas_course_id}/assignments`,
          {
            headers: {
              'Authorization': `Bearer ${canvasToken}`
            },
            params: {
              per_page: 100
            }
          }
        );

        const assignments = response.data;

        for (const assignment of assignments) {
          // Only add upcoming assignments
          if (assignment.due_at) {
            const dueDate = new Date(assignment.due_at);
            if (dueDate > new Date()) {
              
              // Estimate difficulty and duration based on points
              const points = assignment.points_possible || 10;
              const difficulty = points > 50 ? 'hard' : points > 20 ? 'medium' : 'easy';
              const duration = points > 50 ? 180 : points > 20 ? 90 : 45; // minutes

              await supabase
                .from('tasks')
                .upsert({
                  user_id: userId,
                  canvas_assignment_id: assignment.id.toString(),
                  title: assignment.name,
                  description: assignment.description || '',
                  due_date: assignment.due_at,
                  estimated_duration: duration,
                  priority: this.calculatePriority(dueDate),
                  difficulty: difficulty,
                  status: assignment.submission ? 'completed' : 'pending',
                  course_code: course.course_code,
                  source: 'canvas',
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'canvas_assignment_id'
                });

              totalAssignments++;
            }
          }
        }
      }

      return { success: true, assignmentCount: totalAssignments };
    } catch (error) {
      console.error('Canvas assignments sync error:', error);
      throw error;
    }
  }

  static async syncQuizzes(userId, canvasToken) {
    try {
      const baseUrl = process.env.CANVAS_API_URL;
      
      const { data: courses } = await supabase
        .from('courses')
        .select('canvas_course_id, course_code')
        .eq('user_id', userId);

      let totalQuizzes = 0;

      for (const course of courses) {
        const response = await axios.get(
          `${baseUrl}/courses/${course.canvas_course_id}/quizzes`,
          {
            headers: {
              'Authorization': `Bearer ${canvasToken}`
            },
            params: {
              per_page: 100
            }
          }
        );

        const quizzes = response.data;

        for (const quiz of quizzes) {
          if (quiz.due_at) {
            const dueDate = new Date(quiz.due_at);
            if (dueDate > new Date()) {
              
              await supabase
                .from('tasks')
                .upsert({
                  user_id: userId,
                  canvas_assignment_id: `quiz_${quiz.id}`,
                  title: `Quiz: ${quiz.title}`,
                  description: quiz.description || '',
                  due_date: quiz.due_at,
                  estimated_duration: quiz.time_limit || 60,
                  priority: this.calculatePriority(dueDate),
                  difficulty: 'medium',
                  status: 'pending',
                  course_code: course.course_code,
                  source: 'canvas',
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'canvas_assignment_id'
                });

              totalQuizzes++;
            }
          }
        }
      }

      return { success: true, quizzeCount: totalQuizzes };
    } catch (error) {
      console.error('Canvas quizzes sync error:', error);
      throw error;
    }
  }

  static calculatePriority(dueDate) {
    const now = new Date();
    const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);

    if (daysUntilDue <= 1) return 'high';
    if (daysUntilDue <= 3) return 'medium';
    return 'low';
  }

  static generateCourseColor(courseId) {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return colors[courseId % colors.length];
  }
}
