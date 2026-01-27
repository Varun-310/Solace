"""
Authentication API Routes
User registration, login, logout, and profile management.
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.user import User, UserSession, AsyncSessionLocal, init_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ============ Schemas ============

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    display_name: Optional[str] = None


class LoginRequest(BaseModel):
    username: str  # Can be username or email
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    display_name: str
    avatar_color: str
    theme: str
    notifications_enabled: bool
    created_at: datetime


class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    message: str


class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    avatar_color: Optional[str] = None
    theme: Optional[str] = None
    notifications_enabled: Optional[bool] = None


# ============ Helpers ============

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Get current user from auth token."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.replace("Bearer ", "")
    
    # Find session
    result = await db.execute(
        select(UserSession).where(UserSession.token == token)
    )
    session = result.scalar_one_or_none()
    
    if not session or not session.is_valid:
        return None
    
    # Get user
    result = await db.execute(
        select(User).where(User.id == session.user_id)
    )
    return result.scalar_one_or_none()


# ============ Endpoints ============

@router.on_event("startup")
async def startup():
    """Initialize database on startup."""
    await init_db()


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    # Check if username exists
    result = await db.execute(
        select(User).where(User.username == request.username.lower())
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check if email exists
    result = await db.execute(
        select(User).where(User.email == request.email.lower())
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User.create(
        username=request.username,
        email=request.email,
        password=request.password,
        display_name=request.display_name
    )
    db.add(user)
    
    # Create session
    session = UserSession.create(user.id)
    db.add(session)
    
    await db.commit()
    
    return AuthResponse(
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            display_name=user.display_name,
            avatar_color=user.avatar_color,
            theme=user.theme,
            notifications_enabled=user.notifications_enabled,
            created_at=user.created_at
        ),
        token=session.token,
        message="Account created successfully!"
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with username/email and password."""
    # Find user by username or email
    result = await db.execute(
        select(User).where(
            (User.username == request.username.lower()) | 
            (User.email == request.username.lower())
        )
    )
    user = result.scalar_one_or_none()
    
    if not user or not user.verify_password(request.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Update last login
    user.last_login = datetime.utcnow()
    
    # Create new session
    session = UserSession.create(user.id)
    db.add(session)
    
    await db.commit()
    
    return AuthResponse(
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            display_name=user.display_name,
            avatar_color=user.avatar_color,
            theme=user.theme,
            notifications_enabled=user.notifications_enabled,
            created_at=user.created_at
        ),
        token=session.token,
        message="Welcome back!"
    )


@router.post("/logout")
async def logout(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """Logout and invalidate token."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        result = await db.execute(
            select(UserSession).where(UserSession.token == token)
        )
        session = result.scalar_one_or_none()
        if session:
            await db.delete(session)
            await db.commit()
    
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_profile(user: User = Depends(get_current_user)):
    """Get current user profile."""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        display_name=user.display_name,
        avatar_color=user.avatar_color,
        theme=user.theme,
        notifications_enabled=user.notifications_enabled,
        created_at=user.created_at
    )


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    request: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile."""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get fresh user from DB
    result = await db.execute(select(User).where(User.id == user.id))
    db_user = result.scalar_one()
    
    # Update fields
    if request.display_name is not None:
        db_user.display_name = request.display_name
    if request.avatar_color is not None:
        db_user.avatar_color = request.avatar_color
    if request.theme is not None:
        db_user.theme = request.theme
    if request.notifications_enabled is not None:
        db_user.notifications_enabled = request.notifications_enabled
    
    await db.commit()
    await db.refresh(db_user)
    
    return UserResponse(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        display_name=db_user.display_name,
        avatar_color=db_user.avatar_color,
        theme=db_user.theme,
        notifications_enabled=db_user.notifications_enabled,
        created_at=db_user.created_at
    )
