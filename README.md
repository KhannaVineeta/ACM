# 🧠 MindFlow - AI-Powered Student Planner for SDSU

<div align="center">

![MindFlow Banner](https://img.shields.io/badge/MindFlow-AI%20Student%20Planner-blue?style=for-the-badge)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](package.json)
[![React](https://img.shields.io/badge/react-18.2.0-blue?style=flat-square)](package.json)

**An intelligent student planner that understands natural language, integrates with Google Calendar and Canvas LMS, and helps SDSU students stay organized, stress-free, and in control.**

[Quick Start](#-quick-start) • [Features](#-features) • [Demo](#-demo) • [Documentation](#-documentation)

</div>

---

## 🎯 What is MindFlow?

MindFlow is your AI-powered academic assistant that:

- 🗣️ **Understands you naturally** - Just chat: "Add study time at 6 PM" or "What's due next week?"
- 🤖 **Thinks for you** - AI automatically schedules tasks, adds breaks, and prevents burnout
- 📅 **Syncs everything** - Google Calendar + Canvas LMS integration with auto-sync every 15 minutes
- � **Adapts to your mood** - Low energy? It lightens your workload. High energy? It maximizes productivity
- 📊 **Tracks your progress** - See study hours, streaks, and get motivational insights
- 🎨 **Looks beautiful** - Calm dark theme designed for long study sessions

---

## ✨ Features

### 🤝 Smart Integrations
- ✅ Google Calendar OAuth & real-time sync
- ✅ Canvas LMS (SDSU) - courses, assignments, quizzes
- ✅ Automatic background sync every 15 minutes
- ✅ Two-way data flow (read & write)

### 💬 AI Chat Interface
- ✅ Natural language understanding
- ✅ Context-aware responses
- ✅ Task creation, queries, rescheduling
- ✅ Conversation history

### 🧠 Intelligent Scheduling
- ✅ Priority-based task ordering
- ✅ Dynamic time slot allocation
- ✅ Automatic break insertion
- ✅ Commute time calculation
- ✅ Conflict detection & resolution

### 😊 Wellness & Mood
- ✅ 3-level mood selector (Low/Normal/High)
- ✅ Workload adjustment based on energy
- ✅ Mindfulness suggestions
- ✅ Burnout prevention

### 📊 Analytics & Progress
- ✅ Study hours tracking
- ✅ Task completion metrics
- ✅ Streak calculation
- ✅ Interactive charts
- ✅ Motivational messages

### 🎨 Beautiful UI
- ✅ Modern dark theme
- ✅ Fully responsive (mobile-first)
- ✅ Color-coded calendar
- ✅ Smooth animations
- ✅ Accessible design

---

## 🚀 Quick Start

### 1️⃣ Automated Setup (Recommended)

```bash
# Clone and navigate
cd mindflow

# Run automated setup
chmod +x setup.sh
./setup.sh
```

### 2️⃣ Configure Services

**Set up Supabase Database:**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run SQL from `database-schema.sql` in SQL Editor
4. Copy credentials to `backend/.env`

**Get API Keys:**
- **OpenAI**: [platform.openai.com](https://platform.openai.com) → API Keys
- **Google Calendar**: [console.cloud.google.com](https://console.cloud.google.com) → Enable Calendar API
- **Canvas**: [sdsu.instructure.com](https://sdsu.instructure.com) → Settings → Access Token

**Update .env files:**
```bash
# backend/.env
SUPABASE_URL=your_url
OPENAI_API_KEY=your_key
GOOGLE_CLIENT_ID=your_client_id
CANVAS_ACCESS_TOKEN=your_token

# frontend/.env  
VITE_API_URL=http://localhost:5000/api
```

### 3️⃣ Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend  
npm run dev
```

**Visit:** http://localhost:5173 🎉

---

## 📸 Demo

### Chat Interface
```
You: "I have a CS601 assignment due in 2 weeks"
MindFlow: "Got it! I've added your CS601 assignment with a 
          due date of Nov 29. I've scheduled 3 hours for it 
          starting next week. Want me to adjust anything? 📚"
```

### Natural Commands
```
✅ "Add study time at 6 PM"
✅ "What's due next week?"
✅ "Move my lab to tomorrow"
✅ "I'm feeling low energy today"
✅ "Show my progress this week"
```

---

## 🏗️ Tech Stack

### Backend
```
Node.js + Express
├── Supabase (PostgreSQL)
├── OpenAI GPT-4 (NLP)
├── Google Calendar API
├── Canvas LMS API
├── JWT Authentication
└── Node-cron (Auto-sync)
```

### Frontend
```
React 18 + Vite
├── TailwindCSS
├── shadcn/ui
├── Recharts
├── React Router
├── Axios
└── date-fns
```

---

## 📁 Project Structure

```
mindflow/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/      # DB, Google, OpenAI configs
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic (AI, Calendar, Canvas)
│   │   ├── middleware/  # Auth, validation
│   │   └── utils/       # Cron jobs, helpers
│   └── package.json
│
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route pages
│   │   ├── services/    # API client
│   │   └── lib/         # Utilities
│   └── package.json
│
├── README.md             # This file
├── SETUP.md              # Detailed setup guide
├── QUICKSTART.md         # Quick reference
├── PROJECT_SUMMARY.md    # Complete overview
├── database-schema.sql   # DB schema
└── setup.sh              # Auto-setup script
```

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup guide with screenshots
- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference guide
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Full project overview
- **[database-schema.sql](database-schema.sql)** - Database schema

---

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/google` | Google OAuth URL |
| GET | `/api/tasks` | Get tasks |
| POST | `/api/tasks` | Create task |
| POST | `/api/chat` | Send chat message |
| POST | `/api/calendar/sync` | Sync Google Calendar |
| POST | `/api/canvas/sync` | Sync Canvas data |
| GET | `/api/analytics/summary` | Get progress summary |

[Full API documentation →](PROJECT_SUMMARY.md#-api-endpoints)

---

## 🧪 Testing

### Demo Mode
Test without external APIs:
```bash
# After login, generate mock data
POST /api/demo/generate
```

### Manual Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test
```

---

## 🚢 Deployment

### Backend (Heroku/Railway/Render)
1. Connect GitHub repo
2. Set environment variables
3. Update `FRONTEND_URL`
4. Update Google OAuth redirect URIs

### Frontend (Vercel/Netlify)
1. Connect GitHub repo
2. Build: `npm run build`
3. Output: `dist`
4. Set `VITE_API_URL` to production backend

---

## 🤝 Contributing

We welcome contributions! This project was built for SDSU students.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 🐛 Troubleshooting

**Backend won't start?**
```bash
# Check port availability
lsof -i :5000

# Verify environment variables
cat backend/.env
```

**Frontend connection issues?**
- Ensure backend is running
- Check `VITE_API_URL` in frontend/.env
- Clear browser cache

**Google Calendar not syncing?**
- Verify OAuth credentials
- Check redirect URIs match exactly
- Enable Calendar API in Google Cloud Console

[More troubleshooting →](SETUP.md#-troubleshooting)

---

## 📊 Project Stats

- **Lines of Code**: 5,000+
- **Files**: 50+
- **API Endpoints**: 25+
- **Database Tables**: 8
- **External APIs**: 3 (Google, Canvas, OpenAI)

---

## 🏆 Built For

<div align="center">

**SDSU Students**

Made with ❤️ to help San Diego State University students stay organized, reduce stress, and achieve academic success.

</div>

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- **SDSU** for inspiration
- **OpenAI** for GPT-4 capabilities  
- **Google** for Calendar API
- **Canvas** for LMS integration
- **Supabase** for database hosting

---

## 📞 Support

- 📖 Check [documentation](SETUP.md)
- 💬 Open an [issue](../../issues)
- 📧 Contact maintainers

---

<div align="center">

**⭐ Star this repo if MindFlow helps you stay organized! ⭐**

**MindFlow - Empowering SDSU students to thrive! 🧠✨**

</div>
