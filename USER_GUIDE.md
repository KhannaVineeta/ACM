# 🎯 MindFlow - Complete User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Using the Chat Interface](#using-the-chat-interface)
3. [Managing Tasks](#managing-tasks)
4. [Calendar Features](#calendar-features)
5. [Analytics & Progress](#analytics--progress)
6. [Tips & Best Practices](#tips--best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Login
1. Visit http://localhost:5173
2. Click "Sign up" or "Continue with Google"
3. Enter your SDSU email
4. Complete registration

### Connecting Services

#### Google Calendar
1. Click "Continue with Google" on login
2. Authorize MindFlow to access your calendar
3. Your events will sync automatically every 15 minutes

#### Canvas LMS
1. Get your Canvas API token:
   - Go to https://sdsu.instructure.com
   - Click Account → Settings
   - Scroll to "Approved Integrations"
   - Click "+ New Access Token"
   - Purpose: "MindFlow"
   - Copy the token
2. In MindFlow, click Settings
3. Paste your Canvas token
4. Click "Connect Canvas"

### Setting Preferences
On first login, you'll be asked:
- **Task Style**: Do you prefer doing tasks in one go, or split over days?
- **Daily Limit**: How many major tasks can you handle per day?
- **Study Hours**: When do you prefer to study?
- **Break Duration**: How long should breaks be?

---

## Using the Chat Interface

### Basic Commands

#### Adding Tasks
```
"Add study time for CS601 at 6 PM"
"I have a Data Structures project due in 2 weeks"
"Create assignment: Math homework, due Friday"
"Add 2 hours of reading tomorrow morning"
```

#### Querying Information
```
"What's due this week?"
"Show me my schedule for tomorrow"
"What assignments do I have in CS601?"
"When is my next class?"
```

#### Rescheduling
```
"Move my lab to tomorrow"
"Reschedule CS601 homework to Friday"
"I can't work today, move everything"
"Push back my study session 2 hours"
```

#### Mood & Wellness
```
"I'm feeling low energy today"
"I'm super productive right now"
"I'm stressed, what should I do?"
"Suggest a break activity"
```

#### Completion
```
"Mark CS601 homework as done"
"I finished the lab report"
"Complete all tasks from yesterday"
```

### Advanced Chat Features

#### Context Understanding
MindFlow remembers your conversation:
```
You: "I have a CS601 assignment"
MindFlow: "Got it! When is it due?"
You: "Next Friday"
MindFlow: "Perfect! I'll schedule 3 hours..."
```

#### Natural Language
Be as casual as you want:
```
✅ "add study time tmrw at 6"
✅ "whats due nxt week?"
✅ "cant do work today"
✅ "feeling tired rn"
```

#### Multiple Tasks
```
"I have 3 things due next week:
 - CS601 Programming Assignment
 - Math Problem Set
 - Physics Lab Report"
```

---

## Managing Tasks

### Task Properties

Every task has:
- **Title**: What it is
- **Course**: Which class (auto-detected)
- **Due Date**: Deadline
- **Duration**: Estimated time needed
- **Priority**: High/Medium/Low
- **Difficulty**: Hard/Medium/Easy
- **Status**: Pending/Completed

### Task Sources

Tasks can come from:
- 📘 **Canvas**: Auto-synced assignments
- 💬 **Chat**: Added via conversation
- ➕ **Manual**: Direct creation

### Priority Levels

MindFlow automatically prioritizes:
- 🔴 **High**: Due within 24 hours
- 🟡 **Medium**: Due within 3 days  
- 🟢 **Low**: Due later

### Task Actions

From the task list:
- ✅ Click circle to mark complete
- 🗑️ Click trash to delete
- 📝 Click task for details
- ↗️ Drag to calendar (future feature)

---

## Calendar Features

### Views

#### Today View
- Shows current day's schedule
- Hour-by-hour breakdown
- All events and scheduled tasks
- Color-coded blocks

#### Week View
- 7-day overview
- Time slot grid
- Easy to spot free time
- Navigate with Previous/Next/Today buttons

### Color Coding

- 🔵 **Blue**: Events & Classes
- 🟢 **Green**: Tasks & Assignments
- 🟣 **Pink**: Breaks & Wellness
- 🟡 **Yellow**: Commute Time

### Time Slots

Calendar shows:
- 6:00 AM - 11:59 PM
- 30-minute increments
- Overlapping events warning
- Free time indicators

### Adding Events

Via Chat:
```
"Add CS601 lecture Monday at 10 AM"
"Create event: Study Group, tomorrow 6 PM, Library"
```

Events sync back to Google Calendar!

---

## Analytics & Progress

### Dashboard Metrics

**This Week**
- Total study hours
- Tasks completed
- Tasks pending
- Current streak

**Charts**
- Study Hours (bar chart, last 30 days)
- Tasks Completed (line chart, last 30 days)

### Tracking Your Progress

**Streaks**
- Daily activity tracking
- Consecutive days counter
- Motivational milestones

**Study Hours**
- Automatic calculation
- Per-task duration
- Weekly totals

**Completion Rate**
- Tasks completed vs. created
- Success percentage
- Improvement trends

### Motivational Messages

Based on your performance:
- 🎯 "You've completed X tasks!"
- ⏰ "Y hours of study this week!"
- 🔥 "Z day streak - keep it up!"
- 💪 "Almost done - N tasks to go!"

---

## Tips & Best Practices

### Mood Selector

**Low Energy** 🙁
- Workload reduced
- More breaks added
- Easier tasks prioritized
- Wellness activities suggested

**Normal** 😐
- Balanced schedule
- Standard breaks
- Mixed task difficulty

**High Energy** 😊
- More tasks scheduled
- Longer focus sessions
- Challenging work first

### Optimal Scheduling

**Do's:**
- ✅ Set realistic durations
- ✅ Use mood selector honestly
- ✅ Take suggested breaks
- ✅ Schedule hardest tasks when energetic
- ✅ Sync regularly

**Don'ts:**
- ❌ Overschedule when tired
- ❌ Skip breaks for long periods
- ❌ Ignore AI suggestions
- ❌ Procrastinate high-priority tasks

### Time Management

**Pomodoro Technique**
```
"Schedule 25-minute study session"
"Add 5-minute break after"
"Repeat 4 times, then 30-minute break"
```

**Block Scheduling**
```
"Block Monday 2-5 PM for CS project"
"Reserve mornings for reading"
"Keep evenings free for review"
```

### Wellness Tips

MindFlow suggests:
- 🧘 Mindfulness exercises
- 🚶 Walking breaks
- 🎵 Music breaks
- ☕ Social time
- 💤 Rest periods

Take them seriously - they prevent burnout!

---

## Troubleshooting

### Calendar Not Syncing

**Check:**
1. Google account connected?
2. Calendar API enabled?
3. Refresh token valid?
4. Internet connection?

**Fix:**
- Disconnect and reconnect Google
- Check browser console for errors
- Try manual sync button

### Canvas Assignments Missing

**Check:**
1. Canvas token still valid?
2. Correct SDSU Canvas URL?
3. Courses are active?

**Fix:**
- Generate new Canvas token
- Re-enter in settings
- Click "Sync Canvas" manually

### AI Not Understanding

**Tips:**
- Be more specific
- Include course names
- Mention exact dates
- Use simple language

**Examples:**
❌ "add the thing"
✅ "add CS601 homework"

❌ "what's up?"
✅ "what's due this week?"

### Reminders Not Working

**Check:**
1. Browser notifications enabled?
2. Backend server running?
3. Task has scheduled time?

**Fix:**
- Enable notifications in browser
- Check reminder settings
- Reschedule the task

### Performance Issues

**Slow Loading:**
- Clear browser cache
- Check internet speed
- Restart both servers

**Lag in Chat:**
- OpenAI API might be slow
- Check API key quota
- Try again in a moment

---

## Keyboard Shortcuts

### General
- `Ctrl/Cmd + K` - Focus chat
- `Esc` - Close dialogs
- `Tab` - Navigate tabs

### Chat
- `Enter` - Send message
- `Shift + Enter` - New line
- `↑` - Previous message

---

## Privacy & Data

### What We Store
- Your email & name
- Calendar events
- Tasks & assignments
- Chat history
- Progress data

### What We Don't Store
- Canvas password
- Google password
- Credit card info
- Personal documents

### Data Security
- Encrypted connections (HTTPS)
- JWT authentication
- Secure database (Supabase)
- No data selling
- GDPR compliant

---

## Getting Help

### Documentation
- 📖 SETUP.md - Installation
- 📖 QUICKSTART.md - Quick start
- 📖 ARCHITECTURE.md - System design
- 📖 PROJECT_SUMMARY.md - Overview

### Support Channels
- 💬 GitHub Issues
- 📧 Email maintainers
- 💡 Check FAQ

### Common Questions

**Q: Is this free?**
A: Yes! Open source MIT license.

**Q: Does it work on mobile?**
A: Yes! Fully responsive design.

**Q: Can I use without Google/Canvas?**
A: Yes! Manual task entry works great.

**Q: Is my data private?**
A: Yes! Only you can see your data.

**Q: Can I export my data?**
A: Yes! Use export feature (coming soon).

---

## Pro Tips 🚀

1. **Use the chat liberally** - It learns from you
2. **Update mood daily** - For better scheduling
3. **Set realistic durations** - AI improves over time
4. **Take suggested breaks** - Productivity boost!
5. **Review analytics weekly** - Track improvement
6. **Sync before big planning** - Fresh data matters
7. **Trust the AI** - It optimizes better than manual
8. **Complete tasks promptly** - Keeps streak alive
9. **Use course codes** - Better organization
10. **Give feedback** - Help improve MindFlow

---

## Congratulations! 🎉

You're now a MindFlow expert! 

Remember:
- Chat naturally
- Trust the AI
- Take breaks
- Track progress
- Stay organized

**You've got this! 💪🧠**

---

*MindFlow - Empowering SDSU students to thrive!*
