"""
Authentication API Routes
User registration, login, logout, profile management, and password reset.
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import secrets

from core.user import User, UserSession, PasswordReset, AsyncSessionLocal
from utils.email_service import generate_otp, send_otp_email

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ============ Schemas ============

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    display_name: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    display_name: str
    avatar_color: str
    theme: str
    chat_mode: str
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
    chat_mode: Optional[str] = None
    notifications_enabled: Optional[bool] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: str
    otp: str


class VerifyOtpResponse(BaseModel):
    reset_token: str
    message: str


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str


# ============ Helpers ============

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


def _user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        display_name=user.display_name,
        avatar_color=user.avatar_color,
        theme=user.theme,
        chat_mode=user.chat_mode,
        notifications_enabled=user.notifications_enabled,
        created_at=user.created_at
    )


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Get current user from auth token."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.replace("Bearer ", "")
    
    result = await db.execute(
        select(UserSession).where(UserSession.token == token)
    )
    session = result.scalar_one_or_none()
    
    if not session or not session.is_valid:
        return None
    
    result = await db.execute(
        select(User).where(User.id == session.user_id)
    )
    return result.scalar_one_or_none()


# ============ Endpoints ============


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    result = await db.execute(
        select(User).where(User.username == request.username.lower())
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    result = await db.execute(
        select(User).where(User.email == request.email.lower())
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User.create(
        username=request.username,
        email=request.email,
        password=request.password,
        display_name=request.display_name
    )
    db.add(user)
    
    session = UserSession.create(user.id)
    db.add(session)
    
    await db.commit()
    
    return AuthResponse(
        user=_user_response(user),
        token=session.token,
        message="Account created successfully!"
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with username/email and password."""
    result = await db.execute(
        select(User).where(
            (User.username == request.username.lower()) | 
            (User.email == request.username.lower())
        )
    )
    user = result.scalar_one_or_none()
    
    if not user or not user.verify_password(request.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    user.last_login = datetime.utcnow()
    
    session = UserSession.create(user.id)
    db.add(session)
    
    await db.commit()
    
    return AuthResponse(
        user=_user_response(user),
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
    return _user_response(user)


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    request: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile."""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await db.execute(select(User).where(User.id == user.id))
    db_user = result.scalar_one()
    
    if request.display_name is not None:
        db_user.display_name = request.display_name
    if request.avatar_color is not None:
        db_user.avatar_color = request.avatar_color
    if request.theme is not None:
        db_user.theme = request.theme
    if request.chat_mode is not None:
        db_user.chat_mode = request.chat_mode
    if request.notifications_enabled is not None:
        db_user.notifications_enabled = request.notifications_enabled
    
    await db.commit()
    await db.refresh(db_user)
    
    return _user_response(db_user)


# ============ Password Reset ============


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Send OTP to user's email for password reset."""
    result = await db.execute(
        select(User).where(User.email == request.email.lower())
    )
    user = result.scalar_one_or_none()
    
    if not user:
        # Don't reveal whether email exists
        return {"message": "If an account with this email exists, a reset code has been sent."}
    
    otp = generate_otp()
    
    reset = PasswordReset(
        email=request.email.lower(),
        otp=otp,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(reset)
    await db.commit()
    
    send_otp_email(user.email, otp)
    
    return {"message": "If an account with this email exists, a reset code has been sent."}


@router.post("/verify-otp", response_model=VerifyOtpResponse)
async def verify_otp(request: VerifyOtpRequest, db: AsyncSession = Depends(get_db)):
    """Verify OTP and issue reset token."""
    result = await db.execute(
        select(PasswordReset).where(
            PasswordReset.email == request.email.lower(),
            PasswordReset.otp == request.otp,
            PasswordReset.used == False
        ).order_by(PasswordReset.created_at.desc())
    )
    reset = result.scalar_one_or_none()
    
    if not reset or not reset.is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Issue reset token
    reset_token = secrets.token_hex(32)
    reset.reset_token = reset_token
    await db.commit()
    
    return VerifyOtpResponse(
        reset_token=reset_token,
        message="OTP verified. Use the reset token to set a new password."
    )


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset password using reset token."""
    result = await db.execute(
        select(PasswordReset).where(
            PasswordReset.reset_token == request.reset_token,
            PasswordReset.used == False
        )
    )
    reset = result.scalar_one_or_none()
    
    if not reset or not reset.is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Find user
    result = await db.execute(
        select(User).where(User.email == reset.email)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    # Update password
    user.password_hash = User._hash_password(request.new_password)
    reset.used = True
    
    await db.commit()
    
    return {"message": "Password reset successfully. You can now sign in with your new passphrase."}


# ============ Google OAuth ============


class GoogleAuthRequest(BaseModel):
    credential: str  # Google ID token


@router.post("/google", response_model=AuthResponse)
async def google_auth(request: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with Google — verifies token and creates/finds user."""
    import httpx
    
    # Verify Google token
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={request.credential}"
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google token")
            
            google_data = resp.json()
            email = google_data.get("email", "").lower()
            name = google_data.get("name", "")
            
            if not email:
                raise HTTPException(status_code=400, detail="Email not provided by Google")
    except httpx.HTTPError:
        raise HTTPException(status_code=401, detail="Failed to verify Google token")
    
    # Check if user exists
    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        # Create new user from Google data
        username = email.split("@")[0]
        
        # Ensure unique username
        base_username = username
        counter = 1
        while True:
            existing = await db.execute(
                select(User).where(User.username == username)
            )
            if not existing.scalar_one_or_none():
                break
            username = f"{base_username}{counter}"
            counter += 1
        
        import uuid
        user = User(
            id=str(uuid.uuid4()),
            username=username,
            email=email,
            password_hash=User._hash_password(secrets.token_hex(32)),  # Random password for Google users
            display_name=name or username,
            avatar_color=f"#{secrets.token_hex(3)}",
            encryption_salt=secrets.token_hex(16)
        )
        db.add(user)
    
    user.last_login = datetime.utcnow()
    
    session = UserSession.create(user.id)
    db.add(session)
    
    await db.commit()
    
    return AuthResponse(
        user=_user_response(user),
        token=session.token,
        message="Welcome!" if user.last_login else "Account created with Google!"
    )
