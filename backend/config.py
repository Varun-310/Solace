"""
Solace Configuration
Loads settings from environment variables.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment."""
    
    # Application
    APP_NAME: str = "Solace"
    DEBUG: bool = False
    
    # Ollama - Local LLM
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma3:4b"
    
    # LLM Provider (ollama or groq)
    LLM_PROVIDER: str = "ollama"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    GROQ_FALLBACK_MODEL: str = "gemma2-9b-it"
    
    # Memory Settings
    CONTEXT_WINDOW: int = 6
    MAX_RESPONSE_TOKENS: int = 250
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./empathy.db"
    REDIS_URL: str = "redis://localhost:6379"
    
    # Encryption
    ENCRYPTION_SECRET: str = "change-this-to-a-secure-random-string"
    
    # Email (for password reset OTP)
    SMTP_EMAIL: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    
    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
