"""
User Model and Authentication
Database models for users, sessions, chat messages, and password reset.
"""

from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import bcrypt
from datetime import datetime
import secrets
import os

Base = declarative_base()


class User(Base):
    """User model for persistent profiles."""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    display_name = Column(String(100), nullable=True)
    avatar_color = Column(String(7), default="#2D6A4F")
    encryption_salt = Column(String(32), nullable=False)  # Per-user salt for chat encryption
    
    # Profile settings
    theme = Column(String(20), default="light")
    chat_mode = Column(String(20), default="guide")
    notifications_enabled = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    def verify_password(self, password: str) -> bool:
        """Verify password against stored bcrypt hash."""
        return bcrypt.checkpw(
            password[:72].encode("utf-8"),
            self.password_hash.encode("utf-8")
        )
    
    @staticmethod
    def _hash_password(password: str) -> str:
        """Hash password with bcrypt (slow, salted, secure)."""
        hashed = bcrypt.hashpw(
            password[:72].encode("utf-8"),
            bcrypt.gensalt(rounds=10)
        )
        return hashed.decode("utf-8")
    
    @classmethod
    def create(cls, username: str, email: str, password: str, display_name: str = None):
        """Create a new user with hashed password."""
        import uuid
        return cls(
            id=str(uuid.uuid4()),
            username=username.lower(),
            email=email.lower(),
            password_hash=cls._hash_password(password),
            display_name=display_name or username,
            avatar_color=f"#{secrets.token_hex(3)}",
            encryption_salt=secrets.token_hex(16)
        )


class UserSession(Base):
    """User session for authentication tokens."""
    __tablename__ = "user_sessions"
    
    token = Column(String(64), primary_key=True)
    user_id = Column(String(36), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    
    @classmethod
    def create(cls, user_id: str, days_valid: int = 30):
        """Create a new session token."""
        from datetime import timedelta
        return cls(
            token=secrets.token_hex(32),
            user_id=user_id,
            expires_at=datetime.utcnow() + timedelta(days=days_valid)
        )
    
    @property
    def is_valid(self) -> bool:
        return datetime.utcnow() < self.expires_at


class ChatMessage(Base):
    """Encrypted chat message model."""
    __tablename__ = "chat_messages"
    
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False, index=True)
    session_id = Column(String(36), nullable=False, index=True)
    encrypted_content = Column(Text, nullable=False)  # base64 ciphertext
    iv = Column(String(32), nullable=False)            # base64 IV
    role = Column(String(10), nullable=False)          # "user" or "assistant"
    created_at = Column(DateTime, default=datetime.utcnow)


class PasswordReset(Base):
    """Password reset OTP tracking."""
    __tablename__ = "password_resets"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(100), nullable=False, index=True)
    otp = Column(String(6), nullable=False)
    reset_token = Column(String(64), nullable=True)  # Issued after OTP verification
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    
    @property
    def is_valid(self) -> bool:
        return not self.used and datetime.utcnow() < self.expires_at


class ActiveContext(Base):
    """Temporary storage for active chat session context used by the LLM."""
    __tablename__ = "active_contexts"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), nullable=False, index=True)
    message_data = Column(Text, nullable=False)  # JSON string containing role, content, emotion
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


# Database setup — Supabase PostgreSQL via asyncpg
# Uses pydantic settings which auto-loads from .env
from config import settings
from sqlalchemy import URL

_db_url = URL.create(
    drivername="postgresql+asyncpg",
    username=settings.DB_USER,
    password=settings.DB_PASSWORD,
    host=settings.DB_HOST,
    port=settings.DB_PORT,
    database=settings.DB_NAME,
)

engine = create_async_engine(
    _db_url,
    echo=False,
    pool_size=3,
    max_overflow=5,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_timeout=30,
    connect_args={
        "ssl": "require",
        "prepared_statement_cache_size": 0,
        "server_settings": {
            "options": f"-c search_path=public",
        },
    },
)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"Database initialization note: {e}")


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
