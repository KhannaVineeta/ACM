import openai from '../config/openai.js';

export class AIService {
  
  // Parse natural language commands into structured actions
  static async parseCommand(message, userContext = {}) {
    try {
      const { preferences = {} } = userContext;
      const {
        task_style = 'chunks',
        daily_task_limit = 4,
        preferred_study_start = '09:00',
        preferred_study_end = '17:00'
      } = preferences;

      const systemPrompt = `You are an AI assistant for a student planner app called MindFlow. 
Parse the user's message and extract the intent and entities.

USER PREFERENCES:
- Task completion style: ${task_style} (${task_style === 'one-go' ? 'prefers to complete tasks in one session' : 'comfortable breaking tasks into multiple sessions'})
- Daily study limit: ${daily_task_limit} hours per day
- Preferred study hours: ${preferred_study_start} to ${preferred_study_end}

Possible intents:
- add_task: User wants to add a single task or assignment
- schedule_task: User wants to schedule when to work on a task (auto-schedule based on preferences)
- add_event: User wants to add an event to calendar
- query_tasks: User asks about tasks or deadlines
- query_schedule: User asks about their schedule
- reschedule: User wants to move/reschedule a task
- complete_task: User marks a task as done
- delete_task: User wants to remove a task
- mood_update: User shares their mood or energy level
- plan_day: User wants to plan their entire day with multiple items (coffee, assignments, tv shows, shopping, etc.)
- snooze_reminder: User wants to snooze a reminder
- general: General conversation or question

For add_task/schedule_task intent, extract:
- title: task name
- course: course code if mentioned (e.g., CS601)
- due_date: when it's due (return ISO format or relative like "in 2 weeks")
- duration: estimated time (in minutes) - if not mentioned, estimate based on task type
- priority: urgency level (low/medium/high)
- difficulty: task difficulty (easy/medium/hard)
- auto_schedule: true if user wants automatic scheduling based on their preferences

When user mentions preferences like "I like to do things in one go" or "I can't do 2 big assignments together", 
set auto_schedule to true and include these constraints in the scheduling_constraints field:
- avoid_multiple_large_tasks: true/false
- prefer_continuous: true/false (based on their task_style preference)
- max_concurrent_assignments: number

For plan_day intent, extract ALL items from the message into these arrays:
- fixed_events: Events with specific times [{title, start_time (full ISO with current timezone), end_time (full ISO with current timezone), type}]
  IMPORTANT: Return complete ISO 8601 timestamps. For "3pm", calculate the full datetime including today's date.
  Example: If current time is 2025-11-15T10:00:00-08:00 and user says "3pm", return "2025-11-15T15:00:00-08:00"
  Example: "coffee 3-4pm" -> {title: "Coffee break", start_time: "2025-11-15T15:00:00-08:00", end_time: "2025-11-15T16:00:00-08:00", type: "personal"}
  
- tasks: Tasks/assignments without specific times [{title, course, due_date, duration, priority, difficulty}]
  Examples: "3 assignments" -> create 3 task objects with titles like "Assignment 1", "Assignment 2", "Assignment 3"
  "2 tv shows" -> {title: "Watch TV show 1", duration: 60, priority: "low"}
  "shopping" -> {title: "Shopping", duration: 90, priority: "medium"}

Current date/time: ${new Date().toISOString()}
Current local time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'full', timeStyle: 'long' })}

Return JSON only with this structure:
{
  "intent": "intent_name",
  "entities": {extracted entities},
  "confidence": 0.0-1.0
}`;

      console.log('Calling OpenAI API...');
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using cheaper, faster model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      console.log('OpenAI response received');
      const parsed = JSON.parse(response.choices[0].message.content);
      return parsed;
    } catch (error) {
      console.error('AI parsing error:', error.message);
      // Return general intent on error
      return {
        intent: 'general',
        entities: {},
        confidence: 0.5,
        error: error.message
      };
    }
  }

  // Generate a conversational response
  static async generateResponse(message, intent, actionResult) {
    try {
      const systemPrompt = `You are MindFlow, a friendly AI assistant helping students manage their academic life.
Be encouraging, brief, and helpful. Use emojis occasionally to make it friendly.
The user said: "${message}"
The intent was: ${intent}
The action result was: ${JSON.stringify(actionResult)}

Generate a natural, encouraging response confirming what was done.`;

      console.log('Generating response with OpenAI...');
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate response" }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI response generation error:', error.message);
      // Fallback responses
      const fallbackResponses = {
        'add_task': '✅ Task added! I\'ve saved it to your list.',
        'schedule_task': actionResult.message || '✅ Task scheduled! I\'ve found the perfect time slots for you based on your preferences and current schedule.',
        'add_event': '✅ Event added to your calendar!',
        'query_tasks': 'Here are your tasks. Let me know if you need anything else!',
        'query_schedule': '📅 Here\'s your schedule for today.',
        'complete_task': '🎉 Great job! Task marked as complete.',
        'mood_update': 'Thanks for sharing! I\'ll adjust your schedule accordingly.',
        'reschedule': '📅 Task rescheduled successfully!',
        'snooze_reminder': '⏰ No worries! I\'ll remind you again in 2 hours.',
        'plan_day': `🗓️ Perfect! I've planned your day:\n\n${actionResult.scheduled ? 
          actionResult.scheduled.map(s => `• ${s.title}: ${new Date(s.start).toLocaleTimeString()} - ${new Date(s.end).toLocaleTimeString()}`).join('\n') : 
          `Created ${actionResult.events || 0} events and ${actionResult.tasks || 0} tasks. Check your calendar!`}`,
        'general': 'I\'m here to help! Try asking me to add a task, show your schedule, or check what\'s due.'
      };
      return fallbackResponses[intent] || 'Got it! How else can I help?';
    }
  }

  // Generate personalized daily schedule
  static async generateSchedule(tasks, events, preferences, mood = 'normal') {
    try {
      const systemPrompt = `You are an AI scheduling assistant. Generate an optimal daily schedule for a student.

User preferences: ${JSON.stringify(preferences)}
Current mood: ${mood} (low = light workload, normal = balanced, high = more productive)

Tasks to schedule: ${JSON.stringify(tasks)}
Existing events: ${JSON.stringify(events)}

Rules:
1. Don't overlap with existing events
2. Add 30-min breaks between long study sessions
3. If mood is "low", limit to 2-3 hours of work, add mindfulness activities
4. If mood is "high", can schedule up to 6-7 hours with breaks
5. Respect user's preferred study times
6. Add commute time before physical classes (15-30 min)
7. Prioritize by urgency and difficulty
8. Split large tasks if user prefers chunks

Return JSON array of scheduled blocks:
[
  {
    "type": "task|event|break|commute|wellness",
    "title": "Activity name",
    "start": "ISO timestamp",
    "end": "ISO timestamp",
    "taskId": "if applicable",
    "color": "blue|green|pink|yellow"
  }
]`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt }
        ],
        temperature: 0.5,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.schedule || [];
    } catch (error) {
      console.error('Schedule generation error:', error);
      return [];
    }
  }

  // Find next available time slot
  static findNextAvailableSlot(events, duration, preferences) {
    // Simple implementation - can be enhanced
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(preferences.preferredStartHour || 9, 0, 0, 0);

    // Check if tomorrow morning is free
    const proposedEnd = new Date(tomorrow.getTime() + duration * 60000);
    
    const hasConflict = events.some(event => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      return (tomorrow >= eventStart && tomorrow < eventEnd) ||
             (proposedEnd > eventStart && proposedEnd <= eventEnd);
    });

    if (!hasConflict) {
      return {
        start: tomorrow.toISOString(),
        end: proposedEnd.toISOString()
      };
    }

    // If conflict, try next day
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      start: tomorrow.toISOString(),
      end: new Date(tomorrow.getTime() + duration * 60000).toISOString()
    };
  }

  // Suggest wellness activities based on mood
  static suggestWellnessActivity(mood) {
    const activities = {
      low: [
        "Take a 10-minute mindfulness break 🧘",
        "Go for a short walk outside 🚶",
        "Listen to calming music 🎵",
        "Do some light stretching 🤸"
      ],
      normal: [
        "5-minute breathing exercise 🌬️",
        "Quick workout or yoga 💪",
        "Grab a healthy snack 🍎",
        "Chat with a friend ☕"
      ],
      high: [
        "Keep up the momentum! 🚀",
        "Stay hydrated 💧",
        "Remember to take micro-breaks ⏸️",
        "You're doing great! 🌟"
      ]
    };

    const moodActivities = activities[mood] || activities.normal;
    return moodActivities[Math.floor(Math.random() * moodActivities.length)];
  }
}
