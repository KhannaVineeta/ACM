# 🚀 MindFlow Quick Start

## ⚡ Get Running in 5 Minutes

### Step 1: Clone & Install

```bash
# Clone repository
git clone https://github.com/KhannaVineeta/ACM.git
cd ACM

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment

**Backend** (`backend/.env`):
```env
# Enable demo mode (no database needed!)
DEMO_MODE=true

# Required
OPENAI_API_KEY=your_openai_key_here
JWT_SECRET=your_secret_here

# Optional (for full features)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5001/api
```

### Step 3: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 4: Access & Login

- URL: http://localhost:5173
- Email: `demo@sdsu.edu`
- Password: `demo123`

---

## 🎯 Quick Test

### Try Chat Commands:
```
"I have a CS601 assignment due in 2 weeks"
"Add study time at 6 PM"  
"What's due next week?"
```

### Test Features:
1. Click **"🧪 Testing"** tab
2. Click "Test Scheduling"
3. Click "Test Reminder"
4. Open browser console (F12) to see logs

---

## Configuration

1. **Supabase Database**
   - Create account at supabase.com
   - Create new project
   - Run SQL from `database-schema.sql` in SQL Editor
   - Copy credentials to `backend/.env`

2. **API Keys**
   - OpenAI: platform.openai.com
   - Google Calendar: console.cloud.google.com
   - Canvas: sdsu.instructure.com → Settings → Access Token

3. **Update Environment Files**
   ```bash
   # backend/.env
   SUPABASE_URL=...
   OPENAI_API_KEY=...
   GOOGLE_CLIENT_ID=...
   CANVAS_ACCESS_TOKEN=...
   
   # frontend/.env
   VITE_API_URL=http://localhost:5000/api
   ```

## Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Visit: http://localhost:5173

## First Steps

1. Register with SDSU email
2. Login with Google (for Calendar sync)
3. Add Canvas token in settings
4. Chat: "What's due next week?"

## Features

✅ Google Calendar sync (every 15 min)
✅ Canvas LMS integration
✅ AI chat interface
✅ Smart scheduling
✅ Progress analytics
✅ Mood-based workload
✅ Task reminders
✅ Dark theme UI

## Architecture

```
mindflow/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── config/   # Database, Google, OpenAI
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/ # AI, Calendar, Canvas
│   │   └── middleware/
│   └── package.json
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── lib/
│   └── package.json
└── README.md
```

## API Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/tasks` - Get tasks
- `POST /api/chat` - Chat message
- `POST /api/calendar/sync` - Sync calendar
- `POST /api/canvas/sync` - Sync Canvas
- `GET /api/analytics/summary` - Stats

## Tech Stack

**Backend:** Node.js, Express, Supabase, OpenAI, Google APIs
**Frontend:** React, Vite, TailwindCSS, shadcn/ui, Recharts
**Database:** PostgreSQL (Supabase)
**AI:** OpenAI GPT-4

## Troubleshooting

**Port in use?**
```bash
lsof -i :5000  # backend
lsof -i :5173  # frontend
```

**Database error?**
- Check Supabase credentials
- Verify SQL schema ran successfully

**Google OAuth failing?**
- Check redirect URIs match exactly
- Enable Calendar API in Google Cloud

**Canvas not syncing?**
- Token might be expired, generate new one
- Check CANVAS_API_URL is correct

## Demo Mode

The app works without Google/Canvas:
- Create account with email/password
- Add tasks manually via chat
- Use all AI scheduling features

## Production Deploy

**Backend:** Heroku, Railway, or Render
**Frontend:** Vercel or Netlify
**Database:** Supabase (already hosted)

Update environment variables with production URLs.

## Support

See `SETUP.md` for detailed setup guide.

Built with ❤️ for SDSU students!
