"""
LLM Service — Groq Cloud
Fast cloud inference via the Groq API.
Uses AsyncGroq for non-blocking async calls.
"""

from groq import AsyncGroq
from typing import Dict, List
from config import settings
from utils.prompts import (
    SYSTEM_PROMPT_GUIDE, 
    SYSTEM_PROMPT_FRIEND, 
    CRISIS_RESPONSE,
    CRISIS_KEYWORDS,
    get_system_prompt
)


class TokenExhaustedException(Exception):
    """Raised when both primary and fallback LLM models hit rate limits."""
    pass


class LLMService:
    """
    Groq-powered LLM service with automatic fallback model.
    
    Uses AsyncGroq for proper async I/O — never blocks the event loop.
    Falls back to a secondary model if the primary hits rate limits.
    """

    def __init__(self):
        self.groq_client = None
        self.model = settings.GROQ_MODEL
        self.fallback_model = settings.GROQ_FALLBACK_MODEL
        self._init_groq()
    
    def _init_groq(self):
        """Initialize Groq async client."""
        api_key = settings.GROQ_API_KEY
        if not api_key:
            print("⚠️  GROQ_API_KEY not set — LLM will not work!")
            return
        
        try:
            self.groq_client = AsyncGroq(api_key=api_key)
            print(f"✅ Groq LLM ready: {self.model} (fallback: {self.fallback_model})")
        except Exception as e:
            print(f"⚠️  Groq init failed: {e}")
    
    async def generate_response(
        self,
        user_message: str,
        context: Dict,
        emotional_summary: str,
        mode: str = "guide"
    ) -> str:
        """Generate an empathetic response via Groq."""
        
        # Check for crisis keywords
        if any(kw in user_message.lower() for kw in CRISIS_KEYWORDS):
            return CRISIS_RESPONSE
        
        if not self.groq_client:
            return "I'm having trouble connecting right now. Please try again in a moment."
        
        # Build system prompt
        history = self._format_history(context["messages"])
        base_prompt = get_system_prompt(mode)
        
        system_prompt = f"""{base_prompt}

---
USER'S CURRENT STATE: {emotional_summary}

CONVERSATION SO FAR:
{history}

---
RESPOND NOW: Validate briefly, then ENCOURAGE and UPLIFT them. Help them feel stronger and more hopeful. Don't just ask questions - offer support.""".strip()
        
        # Try primary model, then fallback
        return await self._generate(system_prompt, user_message)
    
    async def _generate(self, system_prompt: str, user_message: str) -> str:
        """Generate via Groq with automatic fallback model on rate limit."""
        try:
            response = await self.groq_client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.85,
                top_p=0.92,
                max_tokens=300,
            )
            return response.choices[0].message.content
            
        except Exception as e:
            error_str = str(e).lower()
            
            # Rate limit — try fallback model
            if "rate_limit" in error_str or "429" in error_str or "quota" in error_str:
                print(f"⚠️  Groq rate limit on {self.model}, trying {self.fallback_model}...")
                try:
                    response = await self.groq_client.chat.completions.create(
                        model=self.fallback_model,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_message}
                        ],
                        temperature=0.85,
                        top_p=0.92,
                        max_tokens=300,
                    )
                    return response.choices[0].message.content
                except Exception as fallback_err:
                    fallback_str = str(fallback_err).lower()
                    print(f"⚠️  Fallback model also failed: {fallback_err}")
                    
                    # Both models exhausted → raise structured exception
                    if "rate_limit" in fallback_str or "429" in fallback_str or "quota" in fallback_str:
                        raise TokenExhaustedException(
                            "Free-tier API tokens are temporarily exhausted. Please try again shortly."
                        )
            
            print(f"LLM Error: {e}")
            return "I'm having a moment - could you say that again?"
    
    def _format_history(self, messages: List[Dict], max_messages: int = 8) -> str:
        """Format recent conversation for the prompt."""
        if not messages:
            return "This is the start of our conversation."
        
        recent = messages[-max_messages:]
        formatted = []
        
        for msg in recent:
            role = "User" if msg["role"] == "user" else "Solace"
            formatted.append(f"{role}: {msg['content']}")
        
        return "\n".join(formatted)
