"""
Admin API Routes
Hidden admin dashboard — only accessible by admin email.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from core.user import User, UserSession, ChatMessage, PasswordReset, AsyncSessionLocal, get_db as _get_db
from .auth import get_current_user

router = APIRouter(prefix="/s0l-ctrl", tags=["Admin"])

ADMIN_EMAIL = "itsvarun310@gmail.com"


async def get_db():
    async for session in _get_db():
        yield session


def require_admin(user: User):
    """Verify user is the admin. Returns nothing or raises 404."""
    if not user or user.email.lower() != ADMIN_EMAIL:
        # Return 404 to hide the endpoint's existence
        raise HTTPException(status_code=404, detail="Not found")


@router.get("/stats")
async def get_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get system statistics — admin only."""
    require_admin(user)

    # Total users
    user_count = await db.execute(select(func.count(User.id)))
    total_users = user_count.scalar()

    # Total messages
    msg_count = await db.execute(select(func.count(ChatMessage.id)))
    total_messages = msg_count.scalar()

    # Active sessions
    session_count = await db.execute(select(func.count(UserSession.token)))
    active_sessions = session_count.scalar()

    # Recent signups (last 7 days)
    from datetime import datetime, timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_count = await db.execute(
        select(func.count(User.id)).where(User.created_at >= week_ago)
    )
    recent_signups = recent_count.scalar()

    return {
        "total_users": total_users,
        "total_messages": total_messages,
        "active_sessions": active_sessions,
        "recent_signups": recent_signups
    }


@router.get("/users")
async def list_users(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all users — admin only."""
    require_admin(user)

    result = await db.execute(
        select(User).order_by(User.created_at.desc())
    )
    users = result.scalars().all()

    return {
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "display_name": u.display_name,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "last_login": u.last_login.isoformat() if u.last_login else None,
                "chat_mode": u.chat_mode,
                "notifications_enabled": u.notifications_enabled
            }
            for u in users
        ],
        "total": len(users)
    }


@router.get("/messages/stats")
async def message_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get message statistics per user — admin only. Content is never exposed."""
    require_admin(user)

    try:
        # Messages per user, sessions per user, last activity
        result = await db.execute(
            select(
                ChatMessage.user_id,
                func.count(ChatMessage.id).label("message_count"),
                func.count(distinct(ChatMessage.session_id)).label("session_count"),
                func.max(ChatMessage.created_at).label("last_active"),
                func.min(ChatMessage.created_at).label("first_message")
            ).group_by(ChatMessage.user_id)
        )
        per_user = [
            {
                "user_id": row[0],
                "message_count": row[1],
                "session_count": row[2],
                "last_active": row[3].isoformat() if row[3] else None,
                "first_message": row[4].isoformat() if row[4] else None
            }
            for row in result.all()
        ]
    except Exception:
        # Fallback: simpler query without distinct/dates
        result = await db.execute(
            select(
                ChatMessage.user_id,
                func.count(ChatMessage.id).label("message_count")
            ).group_by(ChatMessage.user_id)
        )
        per_user = [
            {"user_id": row[0], "message_count": row[1], "session_count": 0, "last_active": None, "first_message": None}
            for row in result.all()
        ]

    return {"per_user": per_user}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a user and their data — admin only."""
    require_admin(user)

    if user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    # Delete user's messages
    result = await db.execute(select(ChatMessage).where(ChatMessage.user_id == user_id))
    for msg in result.scalars().all():
        await db.delete(msg)

    # Delete user's sessions
    result = await db.execute(select(UserSession).where(UserSession.user_id == user_id))
    for session in result.scalars().all():
        await db.delete(session)

    # Delete user
    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()
    if target_user:
        await db.delete(target_user)

    await db.commit()
    return {"message": f"User and all data deleted"}
