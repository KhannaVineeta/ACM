import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Use demo database if using demo credentials
const isDemo = supabaseUrl === 'https://demo.supabase.co';

let supabase;
if (isDemo) {
  console.log('🎭 Running in DEMO MODE with in-memory database');
  const { supabase: demoDb } = await import('./demo-database.js');
  supabase = demoDb;
} else {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };

// Database schema initialization
export const initializeDatabase = async () => {
  console.log('Database connection established with Supabase');
  
  // Note: Run these SQL commands in Supabase SQL Editor to set up the database
  console.log(`
    Database Schema Required:
    
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      name VARCHAR(255),
      google_id VARCHAR(255) UNIQUE,
      canvas_token TEXT,
      google_refresh_token TEXT,
      preferences JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Tasks table
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      due_date TIMESTAMP WITH TIME ZONE,
      estimated_duration INTEGER, -- in minutes
      priority VARCHAR(20) DEFAULT 'medium',
      difficulty VARCHAR(20) DEFAULT 'medium',
      status VARCHAR(20) DEFAULT 'pending',
      course_code VARCHAR(50),
      source VARCHAR(50), -- 'canvas', 'manual', 'chat'
      canvas_assignment_id VARCHAR(100),
      scheduled_start TIMESTAMP WITH TIME ZONE,
      scheduled_end TIMESTAMP WITH TIME ZONE,
      completed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Events table (from Google Calendar)
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      google_event_id VARCHAR(255) UNIQUE,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      start_time TIMESTAMP WITH TIME ZONE NOT NULL,
      end_time TIMESTAMP WITH TIME ZONE NOT NULL,
      location VARCHAR(500),
      event_type VARCHAR(50) DEFAULT 'event',
      color VARCHAR(20),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Chat history table
    CREATE TABLE IF NOT EXISTS chat_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      response TEXT NOT NULL,
      intent VARCHAR(100),
      entities JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Reminders table
    CREATE TABLE IF NOT EXISTS reminders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
      reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      snoozed_until TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Progress tracking table
    CREATE TABLE IF NOT EXISTS progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      study_hours DECIMAL(5,2) DEFAULT 0,
      tasks_completed INTEGER DEFAULT 0,
      tasks_pending INTEGER DEFAULT 0,
      mood VARCHAR(20),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, date)
    );

    -- Courses table (from Canvas)
    CREATE TABLE IF NOT EXISTS courses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      canvas_course_id VARCHAR(100) UNIQUE,
      course_code VARCHAR(50) NOT NULL,
      course_name VARCHAR(255) NOT NULL,
      color VARCHAR(20),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
    CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
    CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
    CREATE INDEX IF NOT EXISTS idx_reminders_time ON reminders(reminder_time);
  `);
};
