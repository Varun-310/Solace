"""
Solace Backend - FastAPI Application
A compassionate mental health companion powered by AI.
"""

import os


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.routes import router, preload_services
from api.auth import router as auth_router
from api.admin import router as admin_router
from core.user import init_db
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Initialize database
    await init_db()
    print("✅ Database initialized (Supabase PostgreSQL)")
    
    # Initialize AI services (lightweight — no heavy models)
    print("🔄 Initializing AI services...")
    preload_services()
    print("✅ All AI services ready!")
    
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║                    Solace Backend v2.3                       ║
╠══════════════════════════════════════════════════════════════╣
║  LLM: Groq ({settings.GROQ_MODEL:<44}) ║
║  Emotion: Groq-powered (lightweight)                        ║
║  Database: Supabase PostgreSQL                               ║
╚══════════════════════════════════════════════════════════════╝
    """)
    yield
    print("Solace Backend shutting down...")


app = FastAPI(
    title="Solace",
    description="A compassionate mental health companion powered by AI",
    version="2.2.0",
    lifespan=lifespan
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",    # Vite dev server
        "http://127.0.0.1:5173",
        os.environ.get("FRONTEND_URL", "https://trysolace.vercel.app"),  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


@app.get("/")
def root():
    """Root endpoint - API info."""
    return {
        "name": "Solace",
        "version": "2.2.0",
        "status": "running",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.DEBUG
    )
