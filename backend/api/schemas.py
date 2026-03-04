"""
API Request/Response Schemas
Pydantic models for type validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============ Chat Schemas ============

class ChatRequest(BaseModel):
    """Request body for chat endpoint."""
    message: str = Field(..., max_length=2000)
    session_id: Optional[str] = None
    mode: Optional[str] = "guide"


class ChatResponse(BaseModel):
    """Response from chat endpoint."""
    response: str
    session_id: str


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
    llm: str
    model: str


# ============ Encrypted Message Schemas ============

class SaveEncryptedMessageRequest(BaseModel):
    """Request to save an encrypted message."""
    session_id: str
    encrypted_content: str  # base64 ciphertext
    iv: str                 # base64 IV
    role: str               # "user" or "assistant"


class EncryptedMessageResponse(BaseModel):
    """A single encrypted message."""
    id: str
    encrypted_content: str
    iv: str
    role: str
    created_at: datetime


class EncryptedHistoryResponse(BaseModel):
    """Response for encrypted message history."""
    messages: List[EncryptedMessageResponse]
    message_count: int


class SaveMessagePairRequest(BaseModel):
    """Request to save a user+AI message pair (JSON body, not URL params)."""
    user_msg: str
    ai_msg: str
    session_id: str


# ============ Session List Schemas ============

class SessionListItem(BaseModel):
    """A single session in the user's conversation list."""
    session_id: str
    preview: str        # First user message (truncated)
    last_active: datetime
    message_count: int


class SessionListResponse(BaseModel):
    """Response for listing user's conversation sessions."""
    sessions: List[SessionListItem]


# ============ Password Reset Schemas ============

class ForgotPasswordRequest(BaseModel):
    """Request to initiate password reset."""
    email: str


class VerifyOtpRequest(BaseModel):
    """Request to verify OTP."""
    email: str
    otp: str


class ResetPasswordRequest(BaseModel):
    """Request to set new password."""
    reset_token: str
    new_password: str
