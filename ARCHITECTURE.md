# MindFlow Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                     (React + TailwindCSS)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Dashboard│  │ Calendar │  │  Tasks   │  │ Analytics│      │
│  │   Page   │  │   View   │  │   List   │  │Dashboard │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              ChatBox (AI Interface)                  │      │
│  │  "Add study time at 6 PM"  →  AI Response          │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API SERVER                         │
│                   (Node.js + Express)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   Auth   │  │  Tasks   │  │   Chat   │  │Calendar  │      │
│  │Controller│  │Controller│  │Controller│  │Controller│      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐        │
│  │              Service Layer                          │        │
│  ├────────────────────────────────────────────────────┤        │
│  │ • AIService (OpenAI GPT-4)                        │        │
│  │ • CalendarService (Google Calendar API)           │        │
│  │ • CanvasService (Canvas LMS API)                  │        │
│  │ • MockDataService (Demo/Testing)                  │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐        │
│  │           Background Jobs (node-cron)              │        │
│  ├────────────────────────────────────────────────────┤        │
│  │ • Auto-sync (every 15 minutes)                    │        │
│  │ • Reminders (every minute)                        │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                            │
│                    (Supabase/PostgreSQL)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  users   │  │  tasks   │  │  events  │  │ courses  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   chat   │  │reminders │  │ progress │  │   ...    │      │
│  │ messages │  │          │  │          │  │          │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   OpenAI API     │  │ Google Calendar  │  │  Canvas LMS  │ │
│  │   (GPT-4 NLP)    │  │   (OAuth2 Sync)  │  │  (SDSU API)  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Chat Interaction
```
User → "Add study time for CS601 at 6 PM tomorrow"
  ↓
ChatBox Component
  ↓
POST /api/chat
  ↓
chatController.sendMessage()
  ↓
AIService.parseCommand() → OpenAI GPT-4
  ↓
Intent: "add_task"
Entities: { course: "CS601", time: "6 PM tomorrow" }
  ↓
handleAddTask() → Create task in DB
  ↓
AIService.generateResponse()
  ↓
Response: "Got it! I've scheduled CS601 study time..."
  ↓
Display in ChatBox
```

### 2. Calendar Sync Flow
```
Cron Job (every 15 min) OR Manual Sync Button
  ↓
GoogleCalendarService.syncCalendar()
  ↓
Google Calendar API → Fetch events
  ↓
Store in Supabase events table
  ↓
Frontend fetches updated events
  ↓
CalendarView displays color-coded blocks
```

### 3. Canvas Integration
```
User connects Canvas token
  ↓
CanvasService.syncCourses()
  ↓
Canvas API → Get active courses
  ↓
Store in courses table
  ↓
CanvasService.syncAssignments()
  ↓
Canvas API → Get assignments/quizzes
  ↓
Create tasks with due dates
  ↓
AI schedules tasks automatically
```

### 4. Smart Scheduling
```
User sets mood: "Low Energy"
  ↓
Update progress table
  ↓
AI generates schedule
  ↓
AIService.generateSchedule()
  ↓
Consider:
  - Existing events
  - Task priorities
  - User preferences
  - Current mood
  - Break times
  ↓
Return optimized schedule
  ↓
Display in calendar view
```

## Component Hierarchy

```
App.jsx
├── Router
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Dashboard.jsx
│       ├── Header
│       │   ├── Logo
│       │   ├── MoodSelector
│       │   └── Actions (Sync, Settings, Logout)
│       │
│       ├── Main Content
│       │   ├── Today View
│       │   │   ├── CalendarView (day)
│       │   │   └── TaskList (pending)
│       │   │
│       │   ├── Week View
│       │   │   └── CalendarView (week)
│       │   │
│       │   ├── Tasks View
│       │   │   └── TaskList (all)
│       │   │
│       │   └── Analytics View
│       │       └── AnalyticsDashboard
│       │           ├── Summary Cards
│       │           ├── Charts
│       │           └── Motivational Messages
│       │
│       └── Sidebar
│           ├── ChatBox
│           │   ├── MessageList
│           │   └── InputArea
│           │
│           └── Quick Tips
```

## API Request Flow

```
Frontend Component
  ↓
api.js (Axios client)
  ↓
Add JWT token from localStorage
  ↓
HTTP Request to Backend
  ↓
Express Middleware
  ├── CORS check
  ├── authenticateToken()
  └── JSON body parsing
  ↓
Route Handler (e.g., /api/tasks)
  ↓
Controller Function
  ↓
Service Layer (business logic)
  ├── Database queries (Supabase)
  ├── External API calls
  └── AI processing
  ↓
Response JSON
  ↓
Frontend Component updates state
  ↓
UI re-renders
```

## Database Relationships

```
users (1) ──────────── (M) tasks
  │                          │
  │                          │ (FK: user_id)
  │                          │
  ├────────── (M) events     │
  │              │           │
  │              │           │
  │              │           │
  ├────────── (M) courses ───┘ (FK: course_code)
  │              
  │
  ├────────── (M) chat_messages
  │
  ├────────── (M) reminders ──→ tasks (FK: task_id)
  │
  └────────── (M) progress (daily tracking)
```

## Security Flow

```
User Registration/Login
  ↓
bcrypt password hashing
  ↓
Generate JWT token
  ↓
Store in localStorage (frontend)
  ↓
Include in Authorization header
  ↓
Backend verifies JWT
  ↓
Extract userId from token
  ↓
Use in all DB queries
  ↓
Ensure data isolation per user
```

## Deployment Architecture

```
┌──────────────────┐         ┌──────────────────┐
│   Vercel/Netlify │         │ Heroku/Railway   │
│   (Frontend)     │ ←────→  │  (Backend API)   │
│   Static Site    │  HTTPS  │   Node.js        │
└──────────────────┘         └──────────────────┘
                                      ↕
                             ┌──────────────────┐
                             │   Supabase       │
                             │   (Database)     │
                             └──────────────────┘
                                      ↕
         ┌────────────────────────────┴────────────────────────────┐
         ↓                            ↓                             ↓
┌──────────────────┐     ┌──────────────────┐      ┌──────────────────┐
│   OpenAI API     │     │ Google Calendar  │      │   Canvas LMS     │
│   (GPT-4)        │     │   API            │      │   API            │
└──────────────────┘     └──────────────────┘      └──────────────────┘
```

## Key Design Patterns

1. **MVC Pattern**: Models (DB), Views (React), Controllers (Express)
2. **Service Layer**: Business logic separated from controllers
3. **Middleware**: Authentication, error handling, logging
4. **Repository Pattern**: Database access abstraction (Supabase client)
5. **Singleton**: Database connection, AI client instances
6. **Factory**: Creating different types of tasks/events
7. **Observer**: Real-time updates via WebSocket (future enhancement)

## Performance Optimizations

- Database indexes on frequently queried fields
- Caching of AI responses
- Pagination for large datasets
- Lazy loading of components
- Code splitting in React
- CDN for static assets
- Connection pooling for database
- Rate limiting on API endpoints

---

**This architecture ensures scalability, maintainability, and excellent user experience!**
