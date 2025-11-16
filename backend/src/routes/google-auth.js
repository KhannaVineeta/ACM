import express from 'express';
import { google } from 'googleapis';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../config/database.js';

const router = express.Router();

// Google OAuth configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/google/callback'
);

// Generate Google OAuth URL
router.get('/auth-url', authenticateToken, (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: req.user.userId // Pass user ID for callback
    });

    res.json({ authUrl: url });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Google OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state: userId } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/settings?error=no_code`);
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Save refresh token to database
    const { error } = await supabase
      .from('users')
      .update({
        google_refresh_token: tokens.refresh_token,
        google_id: userInfo.data.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error saving tokens:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/settings?error=save_failed`);
    }

    console.log('✅ Google Calendar connected for user:', userId);
    
    // Redirect back to settings with success
    res.redirect(`${process.env.FRONTEND_URL}/settings?success=google_connected`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/settings?error=auth_failed`);
  }
});

// Disconnect Google Calendar
router.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { error } = await supabase
      .from('users')
      .update({
        google_refresh_token: null,
        google_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    res.json({ success: true, message: 'Google Calendar disconnected' });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect Google Calendar' });
  }
});

export default router;
