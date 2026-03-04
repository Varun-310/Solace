# 💚 Solace

> A compassionate mental health companion powered by AI

Solace is an empathy-first mental health assistant that uses emotion detection and contextual memory to provide warm, human-like responses. Built as a curiosity-driven student project, it leverages free-tier cloud services to make mental health support accessible to everyone.

**🔗 Live Demo:** [trysolace.vercel.app](https://trysolace.vercel.app)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎭 **Emotion Detection** | Recognizes 27 emotions using LLM-powered classification with keyword fallback |
| 🧠 **Contextual Memory** | Remembers conversation history for coherent, evolving interactions |
| 💬 **Empathetic Responses** | Natural responses adapted to your emotional state via Groq LLM |
| 🔒 **End-to-End Encryption** | All stored conversations are encrypted per-user (AES-256-CBC) |
| 📱 **Mobile-First Design** | Glassmorphic UI with bottom-sheet navigation and responsive layout |
| 👤 **User Accounts** | Sign up, log in (including Google OAuth), and access history across sessions |
| 📝 **Conversation History** | Browse and reload past conversations from the "Your Journey" section |
| 🛡️ **Crisis Detection** | Automatic redirection to helplines when crisis keywords are detected |
| ⚡ **Graceful Limits** | Friendly message when free-tier tokens are temporarily exhausted |

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19 + Vite + TailwindCSS |
| Backend | FastAPI + Python 3.11 |
| LLM | Groq Cloud (Llama 3.1 8B + Gemma2 fallback) |
| Emotion Detection | Groq LLM-powered (27 emotion categories) |
| Database | Supabase PostgreSQL |
| Auth | bcrypt + session tokens + Google OAuth |
| Encryption | AES-256-CBC per-user server-side |
| Deployment | Vercel (frontend) + Render (backend) |

### 🔄 Emotion Detection — Model Optimization

Solace originally used a **local RoBERTa model** (`SamLowe/roberta-base-go_emotions`) for fine-grained emotion detection across 27 categories. While highly accurate, this approach had significant production constraints:

- **~500MB model download** on first run
- **High memory usage** — exceeded free-tier hosting limits (512MB RAM on Render)
- **Slow cold starts** — 10-15 seconds to load PyTorch + Transformers

To optimize for cloud deployment, emotion detection was migrated to **Groq LLM-based classification** — using the same Groq API already powering the chat responses. This approach:

- **Zero additional memory overhead** — no local ML models to load
- **Instant server startup** — backend is ready in under 2 seconds
- **Same 27 emotion categories** — identical classification capability
- **Keyword-based fallback** — works even when the API is temporarily unavailable

> This tradeoff between local model accuracy and production viability is a real-world engineering decision that mirrors how production AI systems are built at scale.

---

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
│   │   ├── emotion.py      # Groq LLM-powered emotion classification
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

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Groq API Key** (free at [console.groq.com](https://console.groq.com))
- **Supabase Account** (free at [supabase.com](https://supabase.com))

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

---

## 🔧 Configuration

Copy `.env.example` to `backend/.env` and update:

```env
# Groq Cloud LLM (free tier — powers both chat and emotion detection)
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

---

## 📡 API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | No | Health check |
| `/api/chat` | POST | No | Send a message |
| `/api/session/new` | POST | No | Create new session |
| `/api/session/{id}` | DELETE | No | Clear session |
| `/api/session/{id}/history` | GET | No | Get session history |
| `/api/chat/save-pair` | POST | Yes | Save encrypted message pair |
| `/api/chat/sessions` | GET | Yes | List user's past conversations |
| `/api/chat/session/{id}/messages` | GET | Yes | Load a past conversation |
| `/api/auth/register` | POST | No | Create account |
| `/api/auth/login` | POST | No | Log in |
| `/api/auth/google` | POST | No | Google OAuth login |
| `/api/auth/me` | GET | Yes | Get current user |

---

## 🚀 Production Deployment

See **[PRODUCTION.md](PRODUCTION.md)** for a complete step-by-step guide to deploying Solace on free-tier services (Vercel + Render + Supabase).

---

## 🔒 Privacy & Security

- **Encrypted Storage** — All saved conversations are encrypted with AES-256-CBC using per-user salt
- **No Third-Party Tracking** — No analytics, no cookies, no tracking scripts
- **Session Expiry** — In-memory sessions expire automatically
- **Password Security** — bcrypt with 12 rounds of salting

---

## ⚠️ Disclaimer

Solace is a supportive companion tool, **not a replacement for professional mental health care**. If you're experiencing a crisis, please contact:

- **iCall**: 9152987821
- **Vandrevala Foundation**: 1860-2662-345 (24/7)
- **NIMHANS**: 080-46110007

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

Built with 💚 for mental health awareness
