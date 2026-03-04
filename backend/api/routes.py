"""
API Routes for Solace
RESTful endpoints for chat, encrypted storage, and health checks.
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
import uuid

from .schemas import (
    ChatRequest, ChatResponse,
    SessionResponse, SessionClearResponse,
    HistoryResponse, MessageHistory,
    HealthResponse,
    SaveEncryptedMessageRequest, EncryptedMessageResponse, EncryptedHistoryResponse,
    SaveMessagePairRequest,
    SessionListItem, SessionListResponse
)
from config import settings
from core.emotion import EmotionClassifier
from core.context import ContextManager
from core.llm import LLMService, TokenExhaustedException
from core.user import User, ChatMessage, AsyncSessionLocal, get_db as _get_db
from utils.encryption import encrypt_message, decrypt_message
from sqlalchemy import select, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession
from .auth import get_current_user

router = APIRouter()

# Initialize services (eager loading at startup)
emotion_classifier = None
context_manager = None
llm_service = None
_services_lock = __import__('threading').Lock()


def preload_services():
    """Eagerly initialize all services. Called from main.py at startup."""
    global emotion_classifier, context_manager, llm_service
    with _services_lock:
        if emotion_classifier is None:
            emotion_classifier = EmotionClassifier()
        if context_manager is None:
            context_manager = ContextManager(
                context_window=settings.CONTEXT_WINDOW,
                emotion_classifier=emotion_classifier
            )
        if llm_service is None:
            llm_service = LLMService()
    return emotion_classifier, context_manager, llm_service


def get_services():
    """Return initialized services. Falls back to init if not preloaded yet."""
    global emotion_classifier, context_manager, llm_service
    
    if emotion_classifier is None or context_manager is None or llm_service is None:
        return preload_services()
    
    return emotion_classifier, context_manager, llm_service


async def get_db():
    async for session in _get_db():
        yield session


# ============ Health Endpoint ============

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check if all services are running."""
    
    # Check Groq LLM
    llm_status = "connected" if settings.GROQ_API_KEY else "disconnected"
    
    status = "healthy" if llm_status == "connected" else "degraded"
    
    return HealthResponse(
        status=status,
        llm=llm_status,
        model=settings.GROQ_MODEL
    )


# ============ Chat Endpoints ============

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint.
    Processes: emotion → context → LLM → response
    """
    _, context_mgr, llm_svc = get_services()
    
    session_id = request.session_id or str(uuid.uuid4())
    
    try:
        await context_mgr.add_message(
            session_id=session_id,
            role="user",
            content=request.message
        )
        
        context = await context_mgr.get_context(session_id)
        emotional_summary = await context_mgr.get_emotional_summary(session_id)
        
        response_text = await llm_svc.generate_response(
            user_message=request.message,
            context=context,
            emotional_summary=emotional_summary,
            mode=request.mode or "guide"
        )
        
        await context_mgr.add_message(
            session_id=session_id,
            role="assistant",
            content=response_text
        )
        
        return ChatResponse(
            response=response_text,
            session_id=session_id
        )
    
    except TokenExhaustedException:
        raise HTTPException(
            status_code=429,
            detail={
                "error_type": "token_exhausted",
                "message": (
                    "I'm so sorry — our free-tier AI tokens have been used up for now. "
                    "Solace is a student project built with love, and we rely on free resources to keep running. "
                    "Please come back in about 1-2 minutes and I'll be here waiting for you. 💚"
                ),
                "retry_after_seconds": 90
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Session Endpoints ============

@router.post("/session/new", response_model=SessionResponse)
async def new_session():
    """Create a new chat session."""
    session_id = str(uuid.uuid4())
    return SessionResponse(
        session_id=session_id,
        message="Hi! I'm here to listen and support you. How are you feeling today?"
    )


@router.delete("/session/{session_id}", response_model=SessionClearResponse)
async def clear_session(session_id: str):
    """Clear a session's conversation history."""
    _, context_mgr, _ = get_services()
    
    await context_mgr.clear_session(session_id)
    return SessionClearResponse(
        status="cleared",
        session_id=session_id
    )


@router.get("/session/{session_id}/history", response_model=HistoryResponse)
async def get_history(session_id: str):
    """Get conversation history for a session."""
    _, context_mgr, _ = get_services()
    
    context = await context_mgr.get_context(session_id)
    
    messages = [
        MessageHistory(
            role=m["role"],
            content=m["content"],
            timestamp=m.get("timestamp")
        )
        for m in context["messages"]
    ]
    
    return HistoryResponse(
        session_id=session_id,
        messages=messages,
        message_count=context["message_count"]
    )


# ============ Encrypted Message Storage ============

@router.post("/chat/save-encrypted")
async def save_encrypted_message(
    request: SaveEncryptedMessageRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Save an encrypted message to persistent storage."""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    msg = ChatMessage(
        id=str(uuid.uuid4()),
        user_id=user.id,
        session_id=request.session_id,
        encrypted_content=request.encrypted_content,
        iv=request.iv,
        role=request.role
    )
    db.add(msg)
    await db.commit()
    
    return {"status": "saved", "id": msg.id}


@router.post("/chat/save-pair")
async def save_message_pair(
    request: SaveMessagePairRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Encrypt and save a user+AI message pair server-side."""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Encrypt user message
    user_enc = encrypt_message(request.user_msg, user.encryption_salt)
    user_record = ChatMessage(
        id=str(uuid.uuid4()),
        user_id=user.id,
        session_id=request.session_id,
        encrypted_content=user_enc["ciphertext"],
        iv=user_enc["iv"],
        role="user"
    )
    
    # Encrypt AI message
    ai_enc = encrypt_message(request.ai_msg, user.encryption_salt)
    ai_record = ChatMessage(
        id=str(uuid.uuid4()),
        user_id=user.id,
        session_id=request.session_id,
        encrypted_content=ai_enc["ciphertext"],
        iv=ai_enc["iv"],
        role="assistant"
    )
    
    db.add(user_record)
    db.add(ai_record)
    await db.commit()
    
    return {"status": "saved"}


@router.get("/chat/encrypted-history/{session_id}", response_model=EncryptedHistoryResponse)
async def get_encrypted_history(
    session_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get encrypted message history (decrypted server-side for the authenticated user)."""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user.id, ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
    )
    messages = result.scalars().all()
    
    response_messages = []
    for msg in messages:
        response_messages.append(EncryptedMessageResponse(
            id=msg.id,
            encrypted_content=msg.encrypted_content,
            iv=msg.iv,
            role=msg.role,
            created_at=msg.created_at
        ))
    
    return EncryptedHistoryResponse(
        messages=response_messages,
        message_count=len(response_messages)
    )


# ============ Conversation History (Logged-in Users) ============

@router.get("/chat/sessions", response_model=SessionListResponse)
async def list_user_sessions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all conversation sessions for the authenticated user."""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get distinct sessions with aggregate info
    result = await db.execute(
        select(
            ChatMessage.session_id,
            func.min(ChatMessage.created_at).label("first_msg"),
            func.max(ChatMessage.created_at).label("last_msg"),
            func.count(ChatMessage.id).label("msg_count"),
        )
        .where(ChatMessage.user_id == user.id)
        .group_by(ChatMessage.session_id)
        .order_by(func.max(ChatMessage.created_at).desc())
        .limit(20)
    )
    rows = result.all()
    
    sessions = []
    for row in rows:
        # Fetch first user message as preview
        first_msg_result = await db.execute(
            select(ChatMessage)
            .where(
                ChatMessage.user_id == user.id,
                ChatMessage.session_id == row.session_id,
                ChatMessage.role == "user"
            )
            .order_by(ChatMessage.created_at.asc())
            .limit(1)
        )
        first_msg = first_msg_result.scalar_one_or_none()
        
        preview = "New conversation"
        if first_msg:
            try:
                decrypted = decrypt_message(
                    first_msg.encrypted_content, first_msg.iv, user.encryption_salt
                )
                preview = decrypted[:80] + ("..." if len(decrypted) > 80 else "")
            except Exception:
                preview = "Encrypted conversation"
        
        sessions.append(SessionListItem(
            session_id=row.session_id,
            preview=preview,
            last_active=row.last_msg,
            message_count=row.msg_count
        ))
    
    return SessionListResponse(sessions=sessions)


@router.get("/chat/session/{session_id}/messages")
async def load_session_messages(
    session_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Load all messages for a specific session, decrypted for the authenticated user."""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user.id, ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
    )
    messages = result.scalars().all()
    
    decrypted_messages = []
    for msg in messages:
        try:
            content = decrypt_message(msg.encrypted_content, msg.iv, user.encryption_salt)
        except Exception:
            content = "[Message could not be decrypted]"
        
        decrypted_messages.append({
            "role": msg.role,
            "content": content,
            "timestamp": msg.created_at.isoformat()
        })
    
    return {"session_id": session_id, "messages": decrypted_messages}


@router.delete("/chat/session/{session_id}")
async def delete_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete all messages for a specific session (authenticated user only)."""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    from sqlalchemy import delete as sql_delete
    await db.execute(
        sql_delete(ChatMessage).where(
            ChatMessage.user_id == user.id,
            ChatMessage.session_id == session_id
        )
    )
    await db.commit()
    
    return {"status": "deleted", "session_id": session_id}
