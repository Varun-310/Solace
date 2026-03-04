# 💚 Solace

> A compassionate mental health companion powered by AI

Solace is an empathy-first mental health assistant that uses emotion detection and contextual memory to provide warm, human-like responses. Built as a student project, it leverages free-tier cloud services to make mental health support accessible to everyone.

## ✨ Features

- **🎭 Emotion Detection** — Recognizes 27 emotions using fine-grained NLP (RoBERTa/GoEmotions)
- **🧠 Contextual Memory** — Remembers conversation history for coherent, evolving interactions
- **💬 Empathetic Responses** — Natural responses adapted to your emotional state
- **🔒 End-to-End Encryption** — All stored conversations are encrypted per-user
- **📱 Mobile-First Design** — Glassmorphic UI with bottom-sheet navigation and responsive layout
- **👤 User Accounts** — Sign up, log in, and access your conversation history across sessions
- **📝 Conversation History** — Browse and reload past conversations from the "Your Journey" section
- **⚡ Graceful Limits** — Friendly message when free-tier tokens are temporarily exhausted
- **🛡️ Crisis Detection** — Automatic redirection to helplines when crisis keywords are detected

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19 + Vite + TailwindCSS |
| Backend | FastAPI + Python 3.11 |
| LLM | Groq Cloud (Llama 3.1 8B + Gemma2 fallback) |
| Emotion Detection | RoBERTa (GoEmotions) |
| Database | Supabase PostgreSQL |
| Session Cache | Redis (optional, in-memory fallback) |
| Auth | bcrypt + session tokens |
| Encryption | AES-256-CBC per-user server-side |

## 📋 Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Groq API Key** (free at [console.groq.com](https://console.groq.com))
- **Supabase Account** (free at [supabase.com](https://supabase.com))
- **Redis** (optional — app falls back to in-memory store)

## 🚀 Quick Start

### 1. Clone & Configure

```bash
git clone https://github.com/Varun-310/Solace.git
cd Solace

# Copy environment template
cp .env.example backend/.env
# Edit backend/.env with your Groq API key and Supabase credentials
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Open the App

Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Solace/
├── backend/
│   ├── api/
│   │   ├── routes.py       # Chat, session, and history endpoints
│   │   ├── auth.py         # Authentication (signup, login, Google OAuth)
│   │   ├── admin.py        # Admin dashboard endpoints
│   │   └── schemas.py      # Pydantic request/response models
│   ├── core/
│   │   ├── emotion.py      # RoBERTa emotion classification
│   │   ├── context.py      # Conversation context management
│   │   ├── llm.py          # Groq LLM service with fallback
│   │   └── user.py         # SQLAlchemy models (User, ChatMessage, etc.)
│   ├── utils/
│   │   ├── encryption.py   # AES-256-CBC message encryption
│   │   ├── prompts.py      # System prompts and crisis handling
│   │   └── email_service.py # SMTP for password reset OTP
│   ├── config.py           # Pydantic settings loader
│   ├── main.py             # FastAPI app with CORS and lifespan
│   └── requirements.txt
│
├── frontend/
│   ├── public/             # Favicon, manifest, PWA assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBot.jsx       # Main chat interface
│   │   │   ├── Message.jsx       # Individual message bubble
│   │   │   ├── BottomSheet.jsx   # Mobile navigation + history
│   │   │   ├── DesktopMenu.jsx   # Desktop floating menu + history
│   │   │   ├── Sidebar.jsx       # Legacy sidebar (unused)
│   │   │   └── TypingIndicator.jsx
│   │   ├── hooks/
│   │   │   ├── useChat.jsx       # Chat state, sessions, history
│   │   │   ├── useAuth.jsx       # Authentication context
│   │   │   └── useSettings.jsx   # User preferences context
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing (ChatBot)
│   │   │   ├── Auth.jsx          # Login / Signup
│   │   │   ├── Settings.jsx      # User preferences
│   │   │   ├── About.jsx         # About page
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   ├── api.js            # Backend API client
│   │   │   └── auth.js           # Auth token management
│   │   ├── index.css             # Design system & animations
│   │   ├── main.jsx              # React entry point
│   │   └── App.jsx               # Router & providers
│   ├── vite.config.js
│   └── package.json
│
├── .env.example              # Environment template
├── .gitignore
├── LICENSE
└── README.md
```

## 🔧 Configuration

Copy `.env.example` to `backend/.env` and update:

```env
# Groq Cloud LLM (free tier)
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant
GROQ_FALLBACK_MODEL=gemma2-9b-it

# Supabase PostgreSQL
DB_HOST=aws-0-region.pooler.supabase.com
DB_PORT=5432
DB_USER=postgres.your-project-ref
DB_PASSWORD=your-password
DB_NAME=postgres

# Encryption (random 32+ char string)
ENCRYPTION_SECRET=your-random-secret
```

## 📡 API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | No | Health check |
| `/api/chat` | POST | No | Send a message |
| `/api/session/new` | POST | No | Create new session |
| `/api/session/{id}` | DELETE | No | Clear session |
| `/api/session/{id}/history` | GET | No | Get session history (in-memory) |
| `/api/chat/save-pair` | POST | Yes | Save encrypted message pair |
| `/api/chat/sessions` | GET | Yes | List user's past conversations |
| `/api/chat/session/{id}/messages` | GET | Yes | Load a past conversation |
| `/api/auth/signup` | POST | No | Create account |
| `/api/auth/login` | POST | No | Log in |
| `/api/auth/me` | GET | Yes | Get current user |

## 🚀 Production Deployment (Free Tier)

### Step 1: Frontend → Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repository
3. Set framework to **Vite**
4. Add environment variable: `VITE_API_URL` = your backend URL + `/api`
5. Deploy — you'll get a `https://your-app.vercel.app` URL

### Step 2: Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repository
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3.11
4. Add all environment variables from your `.env` file
5. Deploy — you'll get a `https://your-app.onrender.com` URL

### Step 3: Database → Supabase (Already Done)

Your Supabase PostgreSQL is already in production. Just ensure your Render backend has the correct `DB_*` environment variables.

### Step 4: Update CORS

In `backend/main.py`, add your Vercel URL to the CORS origins list:

```python
allow_origins=[
    "https://your-app.vercel.app",
    "http://localhost:3000",
]
```

### Step 5: Update Frontend API URL

Set `VITE_API_URL` in Vercel's environment variables:

```
VITE_API_URL=https://your-app.onrender.com/api
```

### Free Tier Limits

| Service | Free Tier Limit |
|---------|----------------|
| **Groq** | 6,000 requests/day, 30/min |
| **Supabase** | 500MB database, 1GB storage |
| **Render** | 750 hours/month, sleeps after 15 min inactivity |
| **Vercel** | 100GB bandwidth/month |

> **Note**: Render's free tier sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds to cold-start. Consider using [UptimeRobot](https://uptimerobot.com) to ping your backend every 14 minutes to keep it alive.

## 🔒 Privacy & Security

- **Encrypted Storage**: All saved conversations are encrypted with AES-256-CBC using per-user salt
- **No Third-Party Tracking**: No analytics, no cookies, no tracking scripts
- **Session Expiry**: In-memory sessions expire automatically
- **Password Security**: bcrypt with 12 rounds of salting

## ⚠️ Disclaimer

Solace is a supportive companion tool, **not a replacement for professional mental health care**. If you're experiencing a crisis, please contact:

- **iCall**: 9152987821
- **Vandrevala Foundation**: 1860-2662-345 (24/7)
- **NIMHANS**: 080-46110007

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

Built with 💚 for mental health awareness
