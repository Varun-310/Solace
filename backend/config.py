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
    
    # Groq Cloud LLM
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    GROQ_FALLBACK_MODEL: str = "gemma2-9b-it"
    
    # Memory Settings
    CONTEXT_WINDOW: int = 6
    MAX_RESPONSE_TOKENS: int = 250
    
    # Database (Supabase PostgreSQL)
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "password"
    DB_NAME: str = "postgres"
    
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
