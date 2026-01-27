"""
Solace Configuration
Loads settings from environment variables.
100% local - no external API keys needed!
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment."""
    
    # Application
    APP_NAME: str = "Solace"
    DEBUG: bool = False
    
    # Ollama - Local LLM (uses your installed models)
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma3:4b"
    
    # Memory Settings
    CONTEXT_WINDOW: int = 10  # Number of messages to remember
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./empathy.db"
    REDIS_URL: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
