"""
LLM Service
Integrates with Ollama for local LLM inference.
Uses your installed models (Gemma 3 4B / Qwen 2.5 7B).
"""

import ollama
from typing import Dict, List
from utils.prompts import (
    SYSTEM_PROMPT_GUIDE, 
    SYSTEM_PROMPT_FRIEND, 
    CRISIS_RESPONSE,
    CRISIS_KEYWORDS,
    get_system_prompt
)


class LLMService:
    """
    Local LLM service using Ollama.
    
    Uses your installed models:
    - gemma3:4b (default, faster on RTX 4060)
    - qwen2.5:7b (more capable, slower)
    """

    def __init__(self, model_name: str = "gemma3:4b", host: str = "http://localhost:11434"):
        self.model_name = model_name
        self.host = host
        self.client = ollama.Client(host=host)
        
        # Verify model is available
        print(f"🔄 Connecting to Ollama at {host}...")
        try:
            models_response = self.client.list()
            # Handle different response formats
            if isinstance(models_response, dict):
                models_list = models_response.get("models", [])
            else:
                # Newer ollama versions might return a different structure
                models_list = list(models_response) if models_response else []
            
            available = []
            for m in models_list:
                if isinstance(m, dict):
                    available.append(m.get("name", m.get("model", str(m))))
                else:
                    available.append(str(m))
            
            if any(model_name in m for m in available):
                print(f"✅ LLM ready: {model_name}")
            else:
                print(f"⚠️  Warning: {model_name} not found. Available: {available}")
                print(f"   Run: ollama pull {model_name}")
        except Exception as e:
            print(f"⚠️  Could not connect to Ollama: {e}")
            print("   Make sure Ollama is running: ollama serve")
    
    async def generate_response(
        self,
        user_message: str,
        context: Dict,
        emotional_summary: str,
        mode: str = "guide"  # "guide" (default) or "friend"
    ) -> str:
        """Generate an empathetic response based on context and emotion."""
        
        # Check for crisis keywords (imported from prompts.py)
        if any(kw in user_message.lower() for kw in CRISIS_KEYWORDS):
            return CRISIS_RESPONSE
        
        # Format conversation history
        history = self._format_history(context["messages"])
        
        # Select prompt based on mode (using helper from prompts.py)
        base_prompt = get_system_prompt(mode)
        
        # Construct rich emotional context for more personalized responses
        system_prompt = f"""{base_prompt}

---
USER'S CURRENT STATE: {emotional_summary}

CONVERSATION SO FAR:
{history}

---
RESPOND NOW: Validate briefly, then ENCOURAGE and UPLIFT them. Help them feel stronger and more hopeful. Don't just ask questions - offer support.""".strip()
        
        # Generate response using Ollama with tuned parameters
        try:
            response = self.client.chat(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                options={
                    "temperature": 0.85,      # Higher for more varied responses
                    "top_p": 0.92,            # Slightly higher for more diversity
                    "num_predict": 300,       # Focused response length
                    "repeat_penalty": 1.15,   # Reduce repetitive phrases
                    "top_k": 50,              # Consider more token options
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
            role = "User" if msg["role"] == "user" else "EmpathyAI"
            formatted.append(f"{role}: {msg['content']}")
        
        return "\n".join(formatted)
