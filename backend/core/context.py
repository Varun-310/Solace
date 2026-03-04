"""
Context Management Service
Manages conversation history and emotional context directly in Supabase (PostgreSQL).
"""

from typing import Dict, List, Optional
from datetime import datetime
import json
from sqlalchemy import select, delete
from core.user import ActiveContext, AsyncSessionLocal

class Message:
    """Represents a single message in the conversation."""
    
    def __init__(
        self, 
        role: str, 
        content: str, 
        emotion: Optional[Dict] = None,
        timestamp: Optional[datetime] = None
    ):
        self.role = role
        self.content = content
        self.emotion = emotion  # Hidden from user, used by AI
        self.timestamp = timestamp or datetime.utcnow()
    
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
    Reads and writes to the ActiveContext table in Supabase.
    """
    
    def __init__(
        self, 
        redis_url: str = None,  # Kept for backwards compatibility in init signatures
        context_window: int = 10,
        emotion_classifier = None
    ):
        self.context_window = context_window
        self.emotion_classifier = emotion_classifier
    
    async def add_message(
        self, 
        session_id: str, 
        role: str, 
        content: str
    ) -> Message:
        """Add a message to the conversation."""
        # Classify emotion for user messages (hidden from UI)
        emotion = None
        if role == "user" and self.emotion_classifier:
            emotion = self.emotion_classifier.classify(content)
        
        message = Message(role=role, content=content, emotion=emotion)
        
        async with AsyncSessionLocal() as session:
            # Add new message
            ctx = ActiveContext(
                session_id=session_id,
                message_data=json.dumps(message.to_dict())
            )
            session.add(ctx)
            await session.commit()
            
            # Enforce context window cleanly
            result = await session.execute(
                select(ActiveContext.id)
                .where(ActiveContext.session_id == session_id)
                .order_by(ActiveContext.created_at.desc())
                .offset(self.context_window * 2)
            )
            old_ids = result.scalars().all()
            if old_ids:
                await session.execute(
                    delete(ActiveContext).where(ActiveContext.id.in_(old_ids))
                )
                await session.commit()
                
        return message
    
    async def get_context(self, session_id: str) -> Dict:
        """Get full conversation context."""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(ActiveContext.message_data)
                .where(ActiveContext.session_id == session_id)
                .order_by(ActiveContext.created_at.asc())
            )
            raw_data = result.scalars().all()
            
        messages = [json.loads(data) for data in raw_data]
        
        # Build emotional history
        emotion_history = []
        for m in messages:
            if m.get("emotion"):
                e = m["emotion"]
                emotion_history.append({
                    "emotion": e["primary_emotion"],
                    "group": e["emotion_group"],
                    "confidence": e["confidence"],
                    "timestamp": m["timestamp"]
                })
        
        # Build overall state from stored history
        if emotion_history:
            emotion_scores = {}
            n = len(emotion_history)
            for i, e in enumerate(emotion_history):
                weight = 2 ** (i / max(n, 1))
                emotion_scores[e["emotion"]] = emotion_scores.get(e["emotion"], 0) + weight
            
            sorted_emotions = sorted(emotion_scores.items(), key=lambda x: x[1], reverse=True)
            dominant = sorted_emotions[0][0] if sorted_emotions else "neutral"
            
            groups = [e["group"] for e in emotion_history]
            mid = len(groups) // 2
            if mid > 0:
                early_neg = groups[:mid].count("negative")
                recent_neg = groups[mid:].count("negative")
                if recent_neg < early_neg:
                    trajectory = "improving - user seems to be feeling better"
                elif recent_neg > early_neg:
                    trajectory = "declining - user may need extra support"
                else:
                    trajectory = "stable emotional state"
            else:
                trajectory = "early in conversation"
            
            overall = {
                "dominant_emotion": dominant,
                "emotion_group": self._get_emotion_group(dominant),
                "trajectory": trajectory
            }
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
    
    def _get_emotion_group(self, emotion: str) -> str:
        if self.emotion_classifier:
            return self.emotion_classifier._get_group(emotion)
        return "neutral"
    
    async def get_emotional_summary(self, session_id: str) -> str:
        """Generate a natural language summary of emotional state."""
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
        async with AsyncSessionLocal() as session:
            await session.execute(
                delete(ActiveContext).where(ActiveContext.session_id == session_id)
            )
            await session.commit()
    
    async def close(self):
        """No-op. Keeping signature for backwards compatibility."""
        pass
