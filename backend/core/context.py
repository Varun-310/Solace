"""
Context Management Service
Manages conversation history and emotional context.
Supports Redis for production, falls back to in-memory storage for development.
"""

from typing import Dict, List, Optional
from datetime import datetime
import json


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


class InMemoryStorage:
    """Simple in-memory storage for development when Redis is not available."""
    
    def __init__(self):
        self._data: Dict[str, List] = {}
    
    async def rpush(self, key: str, value: str):
        if key not in self._data:
            self._data[key] = []
        self._data[key].append(value)
    
    async def lrange(self, key: str, start: int, end: int) -> List:
        if key not in self._data:
            return []
        data = self._data[key]
        if end == -1:
            return data[start:]
        return data[start:end + 1]
    
    async def ltrim(self, key: str, start: int, end: int):
        if key in self._data:
            if end == -1:
                self._data[key] = self._data[key][start:]
            else:
                self._data[key] = self._data[key][start:end + 1]
    
    async def expire(self, key: str, seconds: int):
        pass  # In-memory doesn't need expiry for dev
    
    async def delete(self, key: str):
        if key in self._data:
            del self._data[key]
    
    async def ping(self):
        return True
    
    async def close(self):
        pass


class ContextManager:
    """
    Manages conversation context with emotional awareness.
    
    Features:
    - Stores conversation history (Redis or in-memory)
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
        self._storage = None
        self._use_redis = True
    
    async def _get_storage(self):
        """Get storage backend (Redis or in-memory fallback)."""
        if self._storage is None:
            try:
                import redis.asyncio as redis_client
                self._storage = redis_client.from_url(self.redis_url)
                await self._storage.ping()
                print("✅ Connected to Redis for session storage")
            except Exception as e:
                print(f"⚠️  Redis not available ({e}), using in-memory storage")
                print("   Note: Sessions won't persist across restarts")
                self._storage = InMemoryStorage()
                self._use_redis = False
        return self._storage
    
    async def add_message(
        self, 
        session_id: str, 
        role: str, 
        content: str
    ) -> Message:
        """Add a message to the conversation."""
        storage = await self._get_storage()
        
        # Classify emotion for user messages (hidden from UI)
        emotion = None
        if role == "user" and self.emotion_classifier:
            emotion = self.emotion_classifier.classify(content)
        
        message = Message(role=role, content=content, emotion=emotion)
        
        # Store message
        key = f"session:{session_id}:messages"
        await storage.rpush(key, json.dumps(message.to_dict()))
        
        # Keep only recent messages (context window * 2 for both user and assistant)
        await storage.ltrim(key, -self.context_window * 2, -1)
        
        # Set expiry (24 hours) - only works with Redis
        await storage.expire(key, 86400)
        
        # Track emotions separately for trajectory analysis
        if emotion:
            emotion_key = f"session:{session_id}:emotions"
            await storage.rpush(emotion_key, json.dumps({
                "emotion": emotion["primary_emotion"],
                "group": emotion["emotion_group"],
                "confidence": emotion["confidence"],
                "timestamp": message.timestamp.isoformat()
            }))
            await storage.ltrim(emotion_key, -20, -1)
            await storage.expire(emotion_key, 86400)
        
        return message
    
    async def get_context(self, session_id: str) -> Dict:
        """Get full conversation context."""
        storage = await self._get_storage()
        
        # Get messages
        key = f"session:{session_id}:messages"
        raw_messages = await storage.lrange(key, 0, -1)
        messages = [json.loads(m) for m in raw_messages]
        
        # Get emotion history
        emotion_key = f"session:{session_id}:emotions"
        raw_emotions = await storage.lrange(emotion_key, 0, -1)
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
        storage = await self._get_storage()
        await storage.delete(f"session:{session_id}:messages")
        await storage.delete(f"session:{session_id}:emotions")
    
    async def close(self):
        """Close storage connection."""
        if self._storage:
            await self._storage.close()
            self._storage = None
