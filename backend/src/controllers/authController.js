import bcrypt from 'bcryptjs';
import { google } from 'googleapis';
import { supabase } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import { oauth2Client } from '../config/google.js';

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        preferences: {
          taskStyle: 'single', // 'single' or 'chunks'
          maxTasksPerDay: 3,
          preferredStartHour: 9,
          preferredEndHour: 22,
          breakDuration: 30
        }
      })
      .select()
      .single();

    if (error) throw error;

    const token = generateToken(newUser.id, newUser.email);

    res.json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.email);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const googleAuth = async (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.json({ url });
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Check if user exists
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', userInfo.id)
      .single();

    if (!user) {
      // Create new user
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          email: userInfo.email,
          name: userInfo.name,
          google_id: userInfo.id,
          google_refresh_token: tokens.refresh_token,
          preferences: {
            taskStyle: 'single',
            maxTasksPerDay: 3,
            preferredStartHour: 9,
            preferredEndHour: 22,
            breakDuration: 30
          }
        })
        .select()
        .single();
      
      user = newUser;
    } else {
      // Update refresh token
      await supabase
        .from('users')
        .update({ google_refresh_token: tokens.refresh_token })
        .eq('id', user.id);
    }

    const token = generateToken(user.id, user.email);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    const preferences = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ preferences })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, preferences: data.preferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};
