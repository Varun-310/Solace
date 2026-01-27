# 🧠 Solace

> A compassionate mental health companion powered by local AI

Solace is a personalized mental health assistant that uses emotion detection and contextual memory to provide empathetic, human-like responses. It runs **100% locally** with no external API dependencies.

## ✨ Features

- **🎭 Emotion Detection**: Recognizes 27 different emotions using fine-grained NLP
- **🧠 Contextual Memory**: Remembers conversation history for coherent interactions
- **💬 Empathetic Responses**: Natural, human-like responses adapted to emotional state
- **🔒 Privacy-First**: All processing happens locally - your data never leaves your device
- **🚫 No API Keys**: Uses local Ollama models (Gemma, Qwen, Llama)

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | FastAPI + Python 3.11 |
| LLM | Ollama (Gemma 3 4B) |
| Emotion Detection | RoBERTa (GoEmotions) |
| Memory | Redis |
| Frontend | React 19 + TailwindCSS |

## 📋 Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Redis** (for session memory)
- **Ollama** with a model installed (`gemma3:4b` recommended)

## 🚀 Quick Start

### 1. Start Required Services

```bash
# Start Redis (using Docker)
docker run -d -p 6379:6379 redis:alpine

# Ensure Ollama is running
ollama serve

# Pull the model (if not already installed)
ollama pull gemma3:4b
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
npm start
```

### 4. Open the App

Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Solace/
├── backend/
│   ├── api/              # API routes and schemas
│   ├── core/             # Business logic
│   │   ├── emotion.py    # Emotion classification
│   │   ├── context.py    # Conversation context
│   │   └── llm.py        # Ollama integration
│   ├── utils/            # Utilities
│   ├── config.py         # Configuration
│   └── main.py           # FastAPI app
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   └── services/     # API client
│   └── package.json
│
├── .env.example          # Environment template
└── README.md
```

## 🔧 Configuration

Copy `.env.example` to `backend/.env` and update as needed:

```env
# Ollama settings
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma3:4b

# Redis
REDIS_URL=redis://localhost:6379

# Context window (messages to remember)
CONTEXT_WINDOW=10
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/chat` | POST | Send a message |
| `/api/session/new` | POST | Create new session |
| `/api/session/{id}` | DELETE | Clear session |
| `/api/session/{id}/history` | GET | Get conversation history |

## 🔒 Privacy

Solace is designed with privacy in mind:

- **Local Processing**: All AI inference runs on your machine
- **No Data Collection**: Conversations are stored only in your local Redis
- **No External APIs**: No data is sent to external services
- **Session Expiry**: Conversations auto-expire after 24 hours

## ⚠️ Disclaimer

Solace is a supportive companion tool, **not a replacement for professional mental health care**. If you're experiencing a crisis, please contact:

- **iCall**: 9152987821
- **Vandrevala Foundation**: 1860-2662-345 (24/7)
- **NIMHANS**: 080-46110007

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

Built with ❤️ for mental health awareness
