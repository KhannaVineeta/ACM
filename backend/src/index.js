import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import { startSyncJob, startReminderJob } from './utils/cronJobs.js';

// Routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import chatRoutes from './routes/chat.js';
import calendarRoutes from './routes/calendar.js';
import canvasRoutes from './routes/canvas.js';
import analyticsRoutes from './routes/analytics.js';
import demoRoutes from './routes/demo.js';
import syncRoutes from './routes/sync.js';
import googleAuthRoutes from './routes/google-auth.js';
import reminderRoutes from './routes/reminders.js';
import testRoutes from './routes/test.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MindFlow API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/canvas', canvasRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/google', googleAuthRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/test', testRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Start cron jobs
    startSyncJob();
    startReminderJob();

    app.listen(PORT, () => {
      console.log(`
🚀 MindFlow API Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 API: http://localhost:${PORT}
📊 Health: http://localhost:${PORT}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
