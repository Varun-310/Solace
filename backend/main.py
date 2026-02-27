"""
Solace Backend - FastAPI Application
A compassionate mental health companion powered by AI.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import threading

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
    print("✅ Database initialized")
    
    # Pre-load AI services in background thread so server starts accepting requests immediately
    def _preload():
        print("🔄 Pre-loading AI services in background...")
        preload_services()
        print("✅ All AI services ready!")
    
    thread = threading.Thread(target=_preload, daemon=True)
    thread.start()
    
    provider = settings.LLM_PROVIDER.upper()
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║                    Solace Backend v2.1                       ║
╠══════════════════════════════════════════════════════════════╣
║  Provider: {provider:<49} ║
║  Redis: {settings.REDIS_URL:<52} ║
╚══════════════════════════════════════════════════════════════╝
    """)
    yield
    print("Solace Backend shutting down...")


app = FastAPI(
    title="Solace",
    description="A compassionate mental health companion powered by AI",
    version="2.1.0",
    lifespan=lifespan
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
        "version": "2.1.0",
        "status": "running",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=settings.DEBUG
    )
