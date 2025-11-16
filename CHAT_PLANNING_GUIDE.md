# 🤖 MindFlow AI Chat - Intelligent Day Planning

## Overview
MindFlow's chat isn't just conversational - it's an **action-taking AI agent** that automatically schedules your entire day from natural language input.

## ✨ What Makes It Special

### Traditional Chatbot vs MindFlow
- ❌ **Traditional**: "Here's what you should do..." (just advice)
- ✅ **MindFlow**: Immediately creates calendar events and tasks (takes action)

## 🎯 How It Works

### 1. **Natural Language Planning**
Just tell MindFlow about your day in one message:

```
"Plan my day: I have coffee from 3-4pm, 3 CS601 assignments due in 2 weeks, 
2 tv shows to watch, and shopping"
```

### 2. **Intelligent Parsing**
The AI extracts:
- **Fixed Events**: Coffee 3-4pm → Calendar event created
- **Tasks with Counts**: 3 assignments → Creates 3 separate tasks
- **Activities**: TV shows, shopping → Scheduled based on preferences
- **Course Codes**: CS601 → Links tasks to your course
- **Deadlines**: "due in 2 weeks" → Sets due dates

### 3. **Smart Scheduling**
The system:
- ✅ Finds free time slots in your calendar
- ✅ Respects your work preferences (chunks vs one-go)
- ✅ Avoids conflicts with existing events
- ✅ Considers your mood and energy levels
- ✅ Schedules within preferred hours (default 9am-10pm)
- ✅ Adds 30-minute buffers between tasks

### 4. **Automatic Reminders**
Each scheduled item gets:
- ⏰ Reminder 30 minutes before
- 🔄 Snooze option (reminds again in 2 hours)
- 📅 Auto-reschedule when snoozed (finds next free slot)

## 💬 Example Conversations

### Planning a Full Day
```
You: "Plan my day, I have coffee from 3-4pm, 3 assignments, 2 tv shows, shopping"

AI: 🗓️ Perfect! I've planned your day:
• Coffee break: 3:00 PM - 4:00 PM
• Assignment 1: 9:00 AM - 11:00 AM
• Assignment 2: 11:30 AM - 1:30 PM
• Watch TV show 1: 4:30 PM - 5:30 PM
• Assignment 3: 6:00 PM - 8:00 PM
• Watch TV show 2: 8:30 PM - 9:30 PM
• Shopping: 10:00 AM tomorrow - 11:30 AM
```

### Adding Course Work
```
You: "Add CS570 homework due in 1 week, about 3 hours"

AI: ✅ I've scheduled CS570 homework across 3 sessions:
• Session 1: Tomorrow 2:00 PM - 3:00 PM
• Session 2: Wednesday 3:00 PM - 4:00 PM  
• Session 3: Friday 1:00 PM - 2:00 PM
```

### Checking Your Schedule
```
You: "What's on my schedule today?"

AI: 📅 Here's your schedule for today:
• CS 570 Lecture: 10:00 AM - 11:30 AM
• Lunch break: 12:00 PM - 1:00 PM
• MATH 254 Study Session: 2:00 PM - 4:00 PM
• Coffee break: 3:00 PM - 4:00 PM
```

## 🎨 Supported Intent Types

| Intent | What It Does | Example |
|--------|--------------|---------|
| `plan_day` | Plans entire day with multiple items | "Plan my day: coffee, 3 assignments, shopping" |
| `add_task` | Adds single task | "Add CS601 homework due Friday" |
| `query_schedule` | Shows today's schedule | "What's my schedule?" |
| `query_tasks` | Lists tasks | "Show my pending assignments" |
| `reschedule` | Moves task to next free slot | "Reschedule my homework" |
| `complete_task` | Marks task done | "Mark CS homework as done" |
| `mood_update` | Adjusts workload | "I'm feeling low energy today" |

## ⚙️ User Preferences

Set these in your profile to customize scheduling:

```javascript
{
  "taskStyle": "chunks",      // "chunks" or "single" (split vs one-go)
  "preferredStartHour": 9,    // Start scheduling from 9 AM
  "preferredEndHour": 22,     // Don't schedule after 10 PM
  "maxTasksPerDay": 3,        // Max number of major tasks per day
  "breakDuration": 30,        // Minutes between tasks
  "studyBlockSize": 120       // Preferred study session length (minutes)
}
```

## 🔔 Reminder System

### How Reminders Work
1. **Initial Reminder**: 30 minutes before task
2. **Snooze Option**: User can snooze
3. **Auto-Reschedule**: Finds next 2-hour slot
4. **Confirmation**: "I've rescheduled your task to 5:00 PM. Does that work?"

### Snooze Behavior
```
You: *snoozes homework reminder*

AI: Got it! I've moved your CS570 homework to 5:00 PM today. 
I'll remind you again at 4:30 PM.
```

## 🚀 Advanced Features

### 1. **Multi-Item Parsing**
Handles complex requests with multiple items:
- "Coffee from 3-4pm" → Fixed event
- "3 assignments" → Creates 3 separate tasks
- "2 tv shows" → 2 leisure activities
- "Shopping" → General task

### 2. **Conflict Detection**
Won't schedule over existing events:
```
You: "Schedule study time at 2pm"
AI: "You have a lecture at 2pm. I've scheduled it for 4pm instead."
```

### 3. **Mood-Based Scheduling**
- **Low Energy**: Light workload, wellness activities
- **Normal**: Balanced schedule
- **High Energy**: More productive tasks, longer sessions

### 4. **Course Integration**
Recognizes course codes (CS601, MATH254) and:
- Links tasks to courses
- Pulls assignment deadlines from Canvas
- Color-codes by course

## 📝 Tips for Best Results

1. **Be Specific with Times**: "coffee 3-4pm" better than "coffee later"
2. **Mention Quantities**: "3 assignments" creates 3 tasks
3. **Include Course Codes**: "CS601 homework" links to course
4. **State Deadlines**: "due in 2 weeks" sets proper due date
5. **Use Natural Language**: System understands casual phrasing

## 🎓 Perfect for SDSU Students

- Syncs with Canvas LMS for automatic assignment import
- Integrates with Google Calendar for class schedules
- Understands SDSU course codes (CS, MATH, ENG, etc.)
- Accounts for commute time to campus
- Balances academic and personal activities

## 🔧 Technical Implementation

Under the hood, MindFlow uses:
- **OpenAI GPT-4o-mini**: For natural language understanding
- **Intent Classification**: Identifies what you want to do
- **Entity Extraction**: Pulls out times, courses, quantities
- **Smart Scheduling Algorithm**: Finds optimal time slots
- **Conflict Resolution**: Avoids calendar overlaps
- **Preference Engine**: Applies your work style preferences

---

**Try it now!** Just open the chat and say:
> "Plan my day: I have coffee from 3-4pm, 3 assignments, and shopping"

MindFlow will automatically populate your calendar with intelligently scheduled tasks! 🎉
