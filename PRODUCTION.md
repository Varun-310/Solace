# 🚀 Solace — Production Deployment Guide (Free Tier)

This guide walks you through deploying Solace to the internet for **$0/month** using free-tier services.

---

## Overview

| Component | Service | Free Tier |
|-----------|---------|-----------|
| Frontend | **Vercel** | 100GB bandwidth/month |
| Backend | **Render** | 750 hours/month |
| Database | **Supabase** | 500MB storage (already set up) |
| LLM | **Groq** | 6,000 requests/day |
| Uptime Monitor | **UptimeRobot** | 50 monitors free |

---

## Step 1: Push Code to GitHub

Make sure your latest code is pushed:

```bash
git add -A
git commit -m "production ready"
git push origin main
```

> ⚠️ **Important**: Make sure `backend/.env` is in your `.gitignore` so your API keys and passwords never get uploaded to GitHub. You can verify by running `git ls-files backend/.env` — if it shows nothing, you're safe.

---

## Step 2: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **"Add New"** → **"Project"**
3. Select your **Solace** repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
5. Add this **Environment Variable**:
   ```
   VITE_API_URL = https://your-backend-name.onrender.com/api
   ```
   _(You'll get this URL after Step 3 — you can add it later and redeploy)_
6. Click **Deploy**

✅ Your frontend will be live at `https://your-project.vercel.app`

---

## Step 3: Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New"** → **"Web Service"**
3. Connect your **Solace** repository
4. Configure:
   - **Name**: `solace-backend` (or whatever you like)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Choose **Free** plan
6. Add **Environment Variables** (same values from your `backend/.env`):

   | Key | Value |
   |-----|-------|
   | `GROQ_API_KEY` | Your Groq API key |
   | `GROQ_MODEL` | `llama-3.1-8b-instant` |
   | `GROQ_FALLBACK_MODEL` | `gemma2-9b-it` |
   | `DB_HOST` | `aws-0-region.pooler.supabase.com` |
   | `DB_PORT` | `5432` |
   | `DB_USER` | `postgres.your-ref` |
   | `DB_PASSWORD` | Your Supabase DB password |
   | `DB_NAME` | `postgres` |
   | `ENCRYPTION_SECRET` | Your random 32+ character string |
   | `REDIS_URL` | _(leave empty — it will use in-memory fallback)_ |

7. Click **Create Web Service**

✅ Your backend will be live at `https://solace-backend.onrender.com`

---

## Step 4: Connect Frontend ↔ Backend

### 4a. Update Vercel Environment Variable

Now that you have your Render URL, go back to Vercel:

1. Go to your project → **Settings** → **Environment Variables**
2. Set:
   ```
   VITE_API_URL = https://solace-backend.onrender.com/api
   ```
3. Click **Redeploy** (Deployments → click ⋮ on latest → Redeploy)

### 4b. Update Backend CORS

In your `backend/main.py`, update the CORS origins to include your Vercel URL:

```python
allow_origins=[
    "https://your-project.vercel.app",  # ← Add your Vercel URL here
    "http://localhost:3000",
    "http://localhost:5173",
]
```

Then push and Render will auto-redeploy:

```bash
git add backend/main.py
git commit -m "add production CORS origin"
git push origin main
```

---

## Step 5: Keep Backend Alive (Optional but Recommended)

Render's free tier puts your backend to **sleep after 15 minutes** of no traffic. The first request after sleep takes ~30 seconds (cold start).

To prevent this:

1. Go to [uptimerobot.com](https://uptimerobot.com) and sign up (free)
2. Click **"Add New Monitor"**
3. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `Solace Backend`
   - **URL**: `https://solace-backend.onrender.com/api/health`
   - **Monitoring Interval**: `Every 5 minutes`
4. Click **Create Monitor**

This pings your backend every 5 minutes, keeping it awake 24/7.

---

## Step 6: Test Everything

1. Open your Vercel URL in a browser
2. You should see the Solace chat interface
3. Try sending a message — it should respond from the backend
4. Try creating an account and logging in
5. Verify conversations are saved and show up in "Your Journey"

---

## 🔧 Troubleshooting

### "Network Error" or "Cannot connect to backend"
- Check that `VITE_API_URL` in Vercel matches your Render URL
- Check that CORS in `main.py` includes your Vercel domain
- Check Render logs for errors (Dashboard → your service → Logs)

### Backend takes 30 seconds to respond
- This is Render cold-starting. Set up UptimeRobot (Step 5)

### "Token Exhausted" message
- This is normal! Groq free tier has limits (30 requests/minute, 6,000/day)
- Wait 1-2 minutes and try again
- The banner will auto-dismiss when ready

### Database connection error
- Check your `DB_*` environment variables on Render
- Make sure the Supabase project is active (not paused)

---

## 📊 Free Tier Limits to Know

| Service | Limit | What Happens When Hit |
|---------|-------|-----------------------|
| **Groq** | 30 req/min, 6,000/day | Solace shows "token exhausted" banner |
| **Render** | 750 hrs/month, sleeps after 15 min | Cold start delay (~30s) |
| **Supabase** | 500MB database | DB stops accepting writes |
| **Vercel** | 100GB bandwidth | Site goes down until next month |

> For a student project demo, these limits are more than sufficient. A typical demo session uses < 50 API calls.

---

## 🎉 You're Live!

Share your Vercel URL with the world:

```
https://your-project.vercel.app
```

Built with 💚 for mental health awareness
