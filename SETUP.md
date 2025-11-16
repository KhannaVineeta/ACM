# MindFlow - Complete Setup Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works!)
- Google Cloud Project with Calendar API enabled
- Canvas LMS API token from SDSU

---

## Step 1: Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to Settings → API to get your credentials
3. Go to SQL Editor and run the database schema from `backend/src/config/database.js`
4. Copy the SQL commands shown in the console output and execute them

---

## Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your favorite editor
```

**Required Environment Variables:**

```env
PORT=5000
NODE_ENV=development

# Supabase (from Step 1)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT Secret (generate a random string)
JWT_SECRET=your_random_secret_key_here

# OpenAI API Key
OPENAI_API_KEY=sk-your_openai_api_key

# Google OAuth & Calendar
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Canvas LMS
CANVAS_API_URL=https://sdsu.instructure.com/api/v1
CANVAS_ACCESS_TOKEN=your_canvas_access_token

FRONTEND_URL=http://localhost:5173
```

**Start the backend:**
```bash
npm run dev
```

You should see:
```
🚀 MindFlow API Server Running
Port: 5000
```

---

## Step 3: Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
```

---

## Step 4: Google Calendar API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google Calendar API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: Web application
6. Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:5173/auth/callback`
7. Copy Client ID and Client Secret to your backend `.env`

---

## Step 5: Canvas LMS API Token

1. Log in to Canvas at [sdsu.instructure.com](https://sdsu.instructure.com)
2. Go to Account → Settings
3. Scroll to "Approved Integrations"
4. Click "+ New Access Token"
5. Purpose: "MindFlow Integration"
6. Copy the token to your backend `.env`

---

## Step 6: OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create new secret key
5. Copy to your backend `.env`

**Note:** GPT-4 is recommended for best results. You can also use GPT-3.5-turbo by changing the model in `backend/src/services/aiService.js`

---

## 🎉 You're All Set!

Visit [http://localhost:5173](http://localhost:5173) and:

1. **Register** a new account with your SDSU email
2. **Connect** Google Calendar (click the Google button on login)
3. **Add** your Canvas token in settings
4. **Start chatting** with the AI: "What's due next week?"

---

## 🧪 Testing the App

Try these commands in the chat:

```
"Add study time for CS601 at 6 PM tomorrow"
"What assignments are due this week?"
"I have a Data Structures project due in 2 weeks"
"Move my lab to tomorrow morning"
"I'm feeling low energy today"
```

---

## 🔧 Troubleshooting

### Backend won't start
- Check if port 5000 is available: `lsof -i :5000`
- Verify all .env variables are set
- Check Supabase connection

### Frontend won't connect
- Make sure backend is running first
- Check browser console for errors
- Verify VITE_API_URL in frontend/.env

### Google Calendar not syncing
- Verify OAuth credentials are correct
- Check redirect URIs match exactly
- Make sure Calendar API is enabled in Google Cloud

### Canvas sync failing
- Verify Canvas token is valid (they expire!)
- Check Canvas API URL is correct for SDSU
- Try generating a new token

---

## 📱 Features Overview

### ✅ Implemented
- User authentication (email + Google OAuth)
- Google Calendar integration & auto-sync
- Canvas LMS integration (courses, assignments, quizzes)
- AI-powered natural language chat interface
- Intelligent task scheduling
- Smart reminders system
- Progress analytics & streaks
- Mood-based workload adjustment
- Beautiful dark theme UI
- Responsive mobile design
- Background auto-sync (every 15 minutes)

### 🎨 UI Components
- Calendar week/day view
- Task list with filtering
- Analytics dashboard with charts
- Chat interface with history
- Mood selector
- Priority indicators
- Color-coded event types

---

## 🚢 Production Deployment

### Backend (Heroku/Railway/Render)
1. Push code to GitHub
2. Connect your hosting service
3. Set environment variables
4. Update FRONTEND_URL to your deployed URL
5. Update Google OAuth redirect URIs

### Frontend (Vercel/Netlify)
1. Connect GitHub repo
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set VITE_API_URL to your backend URL

---

## 📊 Database Schema

The app uses these main tables:
- `users` - User accounts and preferences
- `tasks` - Assignments and tasks
- `events` - Calendar events
- `courses` - Canvas courses
- `chat_messages` - Chat history
- `reminders` - Task reminders
- `progress` - Daily progress tracking

All tables are created automatically when you run the SQL in Supabase.

---

## 🤝 Contributing

This is a hackathon project! Feel free to:
- Add new features
- Improve the AI prompts
- Enhance the UI/UX
- Fix bugs
- Add tests

---

## 📝 License

MIT License - feel free to use this for your own projects!

---

## 🎓 Built for SDSU Students

Made with ❤️ to help SDSU students stay organized and stress-free!

**Questions?** Check the code comments or raise an issue.

**Enjoy MindFlow! 🧠✨**
