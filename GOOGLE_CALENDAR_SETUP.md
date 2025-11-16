# Google Calendar Integration Setup Guide

Follow these steps to connect your Google Calendar to MindFlow and sync all your events!

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give it a name like "MindFlow Calendar"
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on it and press **Enable**
4. Also search for "Google+ API" and enable it (for user profile)

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app name: "MindFlow"
   - Add your email as support email
   - Add scopes: `calendar.readonly`, `calendar.events`, `userinfo.email`, `userinfo.profile`
   - Add test users: your Gmail address
   - Save and continue

4. Now create the OAuth client ID:
   - Application type: **Web application**
   - Name: "MindFlow Web Client"
   - Authorized JavaScript origins: `http://localhost:5001`
   - Authorized redirect URIs: `http://localhost:5001/api/google/callback`
   - Click **Create**

5. Copy your **Client ID** and **Client Secret**

## Step 4: Update MindFlow Configuration

1. Open `/backend/.env` file
2. Replace these values:
   ```
   GOOGLE_CLIENT_ID=your_actual_client_id_from_step_3
   GOOGLE_CLIENT_SECRET=your_actual_client_secret_from_step_3
   GOOGLE_REDIRECT_URI=http://localhost:5001/api/google/callback
   ```
3. Save the file

## Step 5: Restart MindFlow Backend

```bash
cd backend
npm start
```

## Step 6: Connect Your Google Calendar

1. Open MindFlow in your browser: http://localhost:5173
2. Login with your account
3. Click the **Settings** icon (⚙️) in the header
4. Scroll to the "Google Calendar Integration" section
5. Click **"Connect Google Calendar"**
6. You'll be redirected to Google - sign in and authorize MindFlow
7. After authorization, you'll be redirected back to MindFlow
8. Click **"Sync Google Calendar Now"** to import your events!

## What Gets Synced?

- ✅ All events from your primary Google Calendar
- ✅ Events from the next 30 days
- ✅ Event titles, descriptions, start/end times, locations
- ✅ Recurring events (each occurrence)

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URI in Google Console exactly matches: `http://localhost:5001/api/google/callback`
- No trailing slash!
- Must be HTTP (not HTTPS) for localhost

### "Access blocked: This app's request is invalid"
- Make sure you've enabled Google Calendar API
- Add your email as a test user in OAuth consent screen
- Check that scopes are configured correctly

### "Failed to connect"
- Check that backend is running on port 5001
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set correctly in .env
- Restart the backend server after updating .env

## Security Notes

- Your Google credentials are stored securely
- Only the refresh token is saved (never your password)
- MindFlow only reads calendar data (read-only access)
- You can disconnect anytime from Settings

## Need Help?

If you encounter any issues:
1. Check the backend console for error messages
2. Verify all environment variables are set
3. Make sure you're using the correct Google account
4. Try disconnecting and reconnecting

---

**Congratulations!** 🎉 Once connected, all your Google Calendar events will appear in your MindFlow planner, and they'll sync automatically every 15 minutes!
