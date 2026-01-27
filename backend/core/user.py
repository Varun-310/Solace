"""
User Model and Authentication
Simple local user system without external authentication providers.
"""

from sqlalchemy import Column, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import hashlib
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
    avatar_color = Column(String(7), default="#8B5CF6")  # Purple default
    
    # Profile settings
    theme = Column(String(20), default="light")
    notifications_enabled = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    def verify_password(self, password: str) -> bool:
        """Verify password against stored hash."""
        return self.password_hash == self._hash_password(password)
    
    @staticmethod
    def _hash_password(password: str) -> str:
        """Hash password with SHA-256."""
        return hashlib.sha256(password.encode()).hexdigest()
    
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
            avatar_color=f"#{secrets.token_hex(3)}"
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


# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./empathy.db")
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """Get database session."""
    async with AsyncSessionLocal() as session:
        yield session
