"""
API Routes for Solace
Clean, RESTful endpoints for chat functionality.
"""

from fastapi import APIRouter, HTTPException
import uuid

from .schemas import (
    ChatRequest, ChatResponse,
    SessionResponse, SessionClearResponse,
    HistoryResponse, MessageHistory,
    HealthResponse
)
from config import settings

# Import core services (will be implemented in Phase 2)
# For now, using placeholder implementations
from core.emotion import EmotionClassifier
from core.context import ContextManager
from core.llm import LLMService

router = APIRouter()

# Initialize services (lazy loading in production)
emotion_classifier = None
context_manager = None
llm_service = None


def get_services():
    """Lazy initialization of services."""
    global emotion_classifier, context_manager, llm_service
    
    if emotion_classifier is None:
        emotion_classifier = EmotionClassifier()
    if context_manager is None:
        context_manager = ContextManager(
            redis_url=settings.REDIS_URL,
            context_window=settings.CONTEXT_WINDOW,
            emotion_classifier=emotion_classifier
        )
    if llm_service is None:
        llm_service = LLMService(
            model_name=settings.OLLAMA_MODEL,
            host=settings.OLLAMA_HOST
        )
    
    return emotion_classifier, context_manager, llm_service


# ============ Health Endpoint ============

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check if all services are running."""
    import ollama
    
    # Check Ollama
    ollama_status = "disconnected"
    try:
        client = ollama.Client(host=settings.OLLAMA_HOST)
        client.list()
        ollama_status = "connected"
    except Exception:
        pass
    
    # Check Redis
    redis_status = "disconnected"
    try:
        import redis.asyncio as redis_client
        r = redis_client.from_url(settings.REDIS_URL)
        await r.ping()
        redis_status = "connected"
        await r.close()
    except Exception:
        redis_status = "using_fallback"  # In-memory storage will be used
    
    # Overall status - healthy if Ollama works (Redis has fallback)
    status = "healthy" if ollama_status == "connected" else "degraded"
    
    return HealthResponse(
        status=status,
        ollama=ollama_status,
        model=settings.OLLAMA_MODEL,
        redis=redis_status
    )


# ============ Chat Endpoints ============

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint.
    
    Processes user message through:
    1. Emotion classification (hidden from response)
    2. Context retrieval
    3. LLM response generation
    """
    _, context_mgr, llm_svc = get_services()
    
    # Create or use existing session
    session_id = request.session_id or str(uuid.uuid4())
    
    try:
        # 1. Add user message to context (emotion classified internally)
        await context_mgr.add_message(
            session_id=session_id,
            role="user",
            content=request.message
        )
        
        # 2. Get conversation context and emotional summary
        context = await context_mgr.get_context(session_id)
        emotional_summary = await context_mgr.get_emotional_summary(session_id)
        
        # 3. Generate empathetic response
        response_text = await llm_svc.generate_response(
            user_message=request.message,
            context=context,
            emotional_summary=emotional_summary,
            mode=request.mode or "guide"
        )
        
        # 4. Store bot response in context
        await context_mgr.add_message(
            session_id=session_id,
            role="assistant",
            content=response_text
        )
        
        # Return response (emotion data intentionally excluded)
        return ChatResponse(
            response=response_text,
            session_id=session_id
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
