"""
API Request/Response Schemas
Pydantic models for type validation.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============ Chat Schemas ============

class ChatRequest(BaseModel):
    """Request body for chat endpoint."""
    message: str
    session_id: Optional[str] = None
    mode: Optional[str] = "guide"  # "guide" or "friend"


class ChatResponse(BaseModel):
    """Response from chat endpoint."""
    response: str
    session_id: str
    # Note: Emotion data intentionally excluded (hidden from user)


# ============ Session Schemas ============

class SessionResponse(BaseModel):
    """Response for new session creation."""
    session_id: str
    message: str


class SessionClearResponse(BaseModel):
    """Response for session clearing."""
    status: str
    session_id: str


# ============ History Schemas ============

class MessageHistory(BaseModel):
    """A single message in history."""
    role: str
    content: str
    timestamp: Optional[str] = None


class HistoryResponse(BaseModel):
    """Response for conversation history."""
    session_id: str
    messages: List[MessageHistory]
    message_count: int


# ============ Health Schemas ============

class HealthResponse(BaseModel):
    """Response for health check."""
    status: str
    ollama: str
    model: str
    redis: str
