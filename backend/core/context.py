"""
Context Management Service
Manages conversation history and emotional context.
Uses Redis for fast session storage.
"""

from typing import Dict, List, Optional
from datetime import datetime
import json
import redis.asyncio as redis


class Message:
    """Represents a single message in the conversation."""
    
    def __init__(
        self, 
        role: str, 
        content: str, 
        emotion: Optional[Dict] = None
    ):
        self.role = role
        self.content = content
        self.emotion = emotion  # Hidden from user, used by AI
        self.timestamp = datetime.now()
    
    def to_dict(self) -> Dict:
        return {
            "role": self.role,
            "content": self.content,
            "emotion": self.emotion,
            "timestamp": self.timestamp.isoformat()
        }


class ContextManager:
    """
    Manages conversation context with emotional awareness.
    
    Features:
    - Stores conversation history in Redis
    - Tracks emotional trajectory (hidden from user)
    - Provides context summaries for the LLM
    """
    
    def __init__(
        self, 
        redis_url: str,
        context_window: int = 10,
        emotion_classifier = None
    ):
        self.redis_url = redis_url
        self.context_window = context_window
        self.emotion_classifier = emotion_classifier
        self._redis = None
    
    async def _get_redis(self):
        """Lazy Redis connection."""
        if self._redis is None:
            self._redis = redis.from_url(self.redis_url)
        return self._redis
    
    async def add_message(
        self, 
        session_id: str, 
        role: str, 
        content: str
    ) -> Message:
        """Add a message to the conversation."""
        r = await self._get_redis()
        
        # Classify emotion for user messages (hidden from UI)
        emotion = None
        if role == "user" and self.emotion_classifier:
            emotion = self.emotion_classifier.classify(content)
        
        message = Message(role=role, content=content, emotion=emotion)
        
        # Store in Redis
        key = f"session:{session_id}:messages"
        await r.rpush(key, json.dumps(message.to_dict()))
        
        # Keep only recent messages (context window * 2 for both user and assistant)
        await r.ltrim(key, -self.context_window * 2, -1)
        
        # Set expiry (24 hours)
        await r.expire(key, 86400)
        
        # Track emotions separately for trajectory analysis
        if emotion:
            emotion_key = f"session:{session_id}:emotions"
            await r.rpush(emotion_key, json.dumps({
                "emotion": emotion["primary_emotion"],
                "group": emotion["emotion_group"],
                "confidence": emotion["confidence"],
                "timestamp": message.timestamp.isoformat()
            }))
            await r.ltrim(emotion_key, -20, -1)
            await r.expire(emotion_key, 86400)
        
        return message
    
    async def get_context(self, session_id: str) -> Dict:
        """Get full conversation context."""
        r = await self._get_redis()
        
        # Get messages
        key = f"session:{session_id}:messages"
        raw_messages = await r.lrange(key, 0, -1)
        messages = [json.loads(m) for m in raw_messages]
        
        # Get emotion history
        emotion_key = f"session:{session_id}:emotions"
        raw_emotions = await r.lrange(emotion_key, 0, -1)
        emotion_history = [json.loads(e) for e in raw_emotions]
        
        # Analyze overall emotional state
        user_messages = [m["content"] for m in messages if m["role"] == "user"]
        if user_messages and self.emotion_classifier:
            overall = self.emotion_classifier.analyze_conversation(user_messages)
        else:
            overall = {
                "dominant_emotion": "neutral",
                "emotion_group": "neutral",
                "trajectory": "conversation just started"
            }
        
        return {
            "messages": messages,
            "emotion_history": emotion_history,
            "emotional_state": overall,
            "message_count": len(messages)
        }
    
    async def get_emotional_summary(self, session_id: str) -> str:
        """
        Generate a natural language summary of emotional state.
        This is injected into the LLM prompt (hidden from user).
        """
        context = await self.get_context(session_id)
        
        if not context["emotion_history"]:
            return "The user just started the conversation. Be warm and welcoming."
        
        state = context["emotional_state"]
        history = context["emotion_history"]
        recent = [e["emotion"] for e in history[-5:]]
        
        summary = f"""
EMOTIONAL CONTEXT (internal use only - don't mention to user):
- Current emotional state: {state['dominant_emotion']} ({state['emotion_group']})
- Emotional trajectory: {state.get('trajectory', 'unknown')}
- Recent emotions: {', '.join(recent)}

Adapt your response accordingly:
- If negative emotions: Be extra gentle, validate feelings, don't rush to solutions
- If positive emotions: Share their joy, be encouraging
- If ambiguous: Ask clarifying questions, show curiosity
        """.strip()
        
        return summary
    
    async def clear_session(self, session_id: str):
        """Clear a session's conversation history."""
        r = await self._get_redis()
        await r.delete(f"session:{session_id}:messages")
        await r.delete(f"session:{session_id}:emotions")
    
    async def close(self):
        """Close Redis connection."""
        if self._redis:
            await self._redis.close()
            self._redis = None
