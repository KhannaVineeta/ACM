# 🧪 MindFlow Testing Guide

## Quick Access
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5001
- **Login:** demo@sdsu.edu / demo123

---

## 🎯 Feature Testing Checklist

### 1. **Onboarding (First-Time Setup)**

**How to Test:**
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to: Application → Local Storage → http://localhost:5173
3. Delete `token` and `user` keys
4. Refresh the page
5. Login with demo@sdsu.edu / demo123

**Expected Result:**
- You'll see a beautiful 3-step onboarding wizard:
  - ✅ Step 1: Choose task style (one-go vs chunks)
  - ✅ Step 2: Set daily task limit (1-12 hours) and break duration
  - ✅ Step 3: Set preferred study hours
- After completion → redirects to dashboard
- Preferences saved to database

---

### 2. **Intelligent Scheduling via Chat**

**How to Test:**
1. Go to dashboard
2. Click on the **"🧪 Testing"** tab at the top
3. Click **"Test Scheduling"** button
4. OR manually type in chat:
   ```
   I have a CS601 assignment due in 2 weeks
   ```

**Expected Result:**
- ✅ AI understands your preferences from onboarding
- ✅ Finds available time slots (avoiding conflicts)
- ✅ Creates calendar events for work sessions
- ✅ Sets up reminders 15 minutes before
- ✅ Response shows scheduled time(s)
- ✅ Event appears on calendar

**More Test Commands:**
```
Schedule my MATH502 homework for next week
I need to study for my final exam for 4 hours by next Friday
Help me plan time for my project
```

---

### 3. **Reminder System**

**How to Test:**

#### Option A: Using Testing Panel (Easiest)
1. Go to **"🧪 Testing"** tab
2. Click **"Test Reminder"** button
3. Wait 5 seconds
4. Check browser console (F12) for reminder notification

#### Option B: Natural Flow
1. Create a task via chat (see #2 above)
2. The system creates a reminder automatically
3. Wait for the reminder time (or use testing panel to trigger manually)

**Expected Result:**
- ✅ Reminder created in database
- ✅ Cron job checks every minute
- ✅ Console logs: "📬 Checking for due reminders..."
- ✅ When triggered: "🔔 REMINDER: [task title]"

---

### 4. **Snooze Functionality**

**How to Test:**
1. First, trigger a reminder (see #3)
2. In chat, type:
   ```
   snooze
   ```
   OR:
   ```
   snooze my reminder
   ```
3. Click **"Test Snooze"** button in Testing Panel

**Expected Result:**
- ✅ Reminder status changes to 'snoozed'
- ✅ `snoozed_until` set to 2 hours later
- ✅ After 2 hours, reminder triggers again
- ✅ Creates auto-remind loop until dismissed

---

### 5. **Reschedule Feature**

**How to Test:**
1. Have an active reminder
2. In chat, type:
   ```
   reschedule this task
   ```

**Expected Result:**
- ✅ SchedulingService finds new available slots
- ✅ Updates task scheduled_start and scheduled_end
- ✅ Creates new calendar event
- ✅ Updates reminder time
- ✅ Chat confirms new time

---

### 6. **View All Reminders**

**How to Test:**
1. Go to **"🧪 Testing"** tab
2. Click **"View All"** button

**Expected Result:**
- ✅ Shows all reminders with status
- ✅ Displays task title
- ✅ Shows reminder time
- ✅ Lists snoozed reminders

---

### 7. **Manual Reminder Check**

**How to Test:**
1. Go to **"🧪 Testing"** tab
2. Click **"Check Reminders"** button

**Expected Result:**
- ✅ Manually triggers reminder check (like cron job)
- ✅ Shows count of triggered reminders
- ✅ Console logs reminder activity

---

## 🎨 UI Features to Verify

### Dashboard
- ✅ Clean modern interface with gradient accents
- ✅ Mood selector (low/normal/high energy)
- ✅ Navigation tabs: Today, This Week, All Tasks, Analytics, **🧪 Testing**
- ✅ Calendar view showing all 24 hours (0-23)
- ✅ Chat sidebar on the right
- ✅ Canvas sync button (book icon)

### Calendar
- ✅ Shows events at correct times (including midnight events)
- ✅ Color-coded events
- ✅ Day and week views

### Testing Panel (NEW!)
- ✅ Purple-bordered card with test buttons
- ✅ Real-time results display
- ✅ Color-coded success/error/info messages
- ✅ Timestamps for each action
- ✅ Instructions guide

---

## 📋 API Endpoints for Testing

### Test Endpoints
```bash
# Trigger test reminder (5 seconds)
POST http://localhost:5001/api/test/trigger-reminder
Headers: Authorization: Bearer <token>

# Check reminders manually
POST http://localhost:5001/api/test/check-reminders
Headers: Authorization: Bearer <token>

# View all reminders
GET http://localhost:5001/api/test/reminders
Headers: Authorization: Bearer <token>
```

### Reminder Endpoints
```bash
# Snooze a reminder
POST http://localhost:5001/api/reminders/:id/snooze
Body: { "duration": 120 }  # minutes

# Dismiss a reminder
POST http://localhost:5001/api/reminders/:id/dismiss

# Reschedule a task
POST http://localhost:5001/api/reminders/:id/reschedule
```

---

## 🐛 Troubleshooting

### Issue: "Features not showing"
- **Solution:** Make sure you're on the **"🧪 Testing"** tab in the dashboard

### Issue: "Reminders not triggering"
- **Solution:** Check console logs for "📬 Checking for due reminders..."
- Cron job runs every minute
- Use Testing Panel → "Check Reminders" to trigger manually

### Issue: "Onboarding not showing"
- **Solution:** Clear local storage and login again

### Issue: "Chat not responding"
- **Solution:** Check backend console for errors
- Make sure OpenAI API key is set in .env

### Issue: "Calendar empty"
- **Solution:** Create tasks via chat first
- Check that events are being created (Testing Panel → View All)

---

## 💡 Pro Tips

1. **Open Browser Console (F12)** to see real-time logs:
   - Reminder notifications
   - API calls
   - Scheduling activity

2. **Use Testing Panel** for quick feature verification:
   - No need to wait for natural triggers
   - See results immediately
   - Copy-paste test output for debugging

3. **Check Backend Console** for detailed logs:
   - Scheduling decisions
   - Conflict detection
   - Reminder processing

4. **Reset Demo User:**
   ```bash
   # Restart backend to reset demo data
   npm start
   ```

---

## ✅ Complete Feature List

| Feature | Status | Test Method |
|---------|--------|-------------|
| Onboarding Wizard | ✅ | Clear storage → login |
| Preference Capture | ✅ | Complete onboarding |
| Intelligent Scheduling | ✅ | Chat command / Test button |
| Conflict Avoidance | ✅ | Schedule multiple tasks |
| Auto Calendar Events | ✅ | Check calendar after scheduling |
| Smart Reminders | ✅ | Test button / wait for trigger |
| Snooze (2 hours) | ✅ | Chat "snooze" / test button |
| Auto-Remind Loop | ✅ | Snooze → wait → check console |
| Reschedule | ✅ | Chat "reschedule" |
| Task Style Respect | ✅ | Onboarding → schedule task |
| Daily Limit Respect | ✅ | Schedule multiple tasks |
| Study Hours Respect | ✅ | Check scheduled times |
| Testing Panel | ✅ | Dashboard → 🧪 Testing tab |

---

## 📞 Need Help?

1. Check browser console (F12)
2. Check backend console
3. Use Testing Panel to diagnose
4. Review this guide

**Everything is implemented and working!** 🎉
