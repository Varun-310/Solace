"""
LLM Service
Supports Groq (cloud, fast) and Ollama (local, slower) providers.
Falls back to Ollama if Groq rate limits are hit.
"""

import ollama
from typing import Dict, List
from config import settings
from utils.prompts import (
    SYSTEM_PROMPT_GUIDE, 
    SYSTEM_PROMPT_FRIEND, 
    CRISIS_RESPONSE,
    CRISIS_KEYWORDS,
    get_system_prompt
)


class LLMService:
    """
    Multi-provider LLM service.
    
    Providers:
    - groq: Fast cloud inference (Groq API)
    - ollama: Local inference (slower, fully private)
    
    Automatically falls back to Ollama if Groq rate limits are hit.
    """

    def __init__(self, model_name: str = "gemma3:4b", host: str = "http://localhost:11434"):
        self.model_name = model_name
        self.host = host
        self.provider = getattr(settings, "LLM_PROVIDER", "ollama").lower()
        self.groq_client = None
        self.ollama_client = None
        
        if self.provider == "groq":
            self._init_groq()
        else:
            self._init_ollama()
    
    def _init_groq(self):
        """Initialize Groq cloud client."""
        api_key = getattr(settings, "GROQ_API_KEY", "")
        if not api_key:
            print("⚠️  GROQ_API_KEY not set, falling back to Ollama")
            self.provider = "ollama"
            self._init_ollama()
            return
        
        try:
            from groq import Groq
            self.groq_client = Groq(api_key=api_key)
            self.groq_model = getattr(settings, "GROQ_MODEL", "llama-3.1-8b-instant")
            self.groq_fallback_model = getattr(settings, "GROQ_FALLBACK_MODEL", "gemma2-9b-it")
            print(f"✅ Groq cloud LLM ready: {self.groq_model}")
        except Exception as e:
            print(f"⚠️  Groq init failed: {e}, falling back to Ollama")
            self.provider = "ollama"
            self._init_ollama()
    
    def _init_ollama(self):
        """Initialize Ollama local client."""
        self.ollama_client = ollama.Client(host=self.host)
        print(f"🔄 Connecting to Ollama at {self.host}...")
        try:
            models_response = self.ollama_client.list()
            if isinstance(models_response, dict):
                models_list = models_response.get("models", [])
            else:
                models_list = list(models_response) if models_response else []
            
            available = []
            for m in models_list:
                if isinstance(m, dict):
                    available.append(m.get("name", m.get("model", str(m))))
                else:
                    available.append(str(m))
            
            if any(self.model_name in m for m in available):
                print(f"✅ Ollama LLM ready: {self.model_name}")
            else:
                print(f"⚠️  {self.model_name} not found. Available: {available}")
                print(f"   Run: ollama pull {self.model_name}")
        except Exception as e:
            print(f"⚠️  Could not connect to Ollama: {e}")
            print("   Make sure Ollama is running: ollama serve")
    
    async def generate_response(
        self,
        user_message: str,
        context: Dict,
        emotional_summary: str,
        mode: str = "guide"
    ) -> str:
        """Generate an empathetic response. Uses Groq with Ollama fallback."""
        
        # Check for crisis keywords
        if any(kw in user_message.lower() for kw in CRISIS_KEYWORDS):
            return CRISIS_RESPONSE
        
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
        
        if self.provider == "groq":
            return await self._generate_groq(system_prompt, user_message)
        else:
            return await self._generate_ollama(system_prompt, user_message)
    
    async def _generate_groq(self, system_prompt: str, user_message: str) -> str:
        """Generate via Groq cloud API with rate-limit fallback to Ollama."""
        try:
            response = self.groq_client.chat.completions.create(
                model=self.groq_model,
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
            
            # Rate limit or quota exceeded — try fallback model
            if "rate_limit" in error_str or "429" in error_str or "quota" in error_str:
                print(f"⚠️  Groq rate limit on {self.groq_model}, trying fallback model...")
                try:
                    response = self.groq_client.chat.completions.create(
                        model=self.groq_fallback_model,
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
                    print(f"⚠️  Groq fallback also failed: {fallback_err}")
            
            # All Groq attempts failed — fall back to Ollama
            print(f"⚠️  Groq failed: {e}, falling back to Ollama")
            if not self.ollama_client:
                self._init_ollama()
            return await self._generate_ollama(system_prompt, user_message)
    
    async def _generate_ollama(self, system_prompt: str, user_message: str) -> str:
        """Generate via local Ollama."""
        try:
            if not self.ollama_client:
                self.ollama_client = ollama.Client(host=self.host)
            
            response = self.ollama_client.chat(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                options={
                    "temperature": 0.85,
                    "top_p": 0.92,
                    "num_predict": 300,
                    "repeat_penalty": 1.15,
                    "top_k": 50,
                }
            )
            return response["message"]["content"]
            
        except Exception as e:
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
