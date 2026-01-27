"""
LLM Service
Integrates with Ollama for local LLM inference.
Uses your installed models (Gemma 3 4B / Qwen 2.5 7B).
"""

import ollama
from typing import Dict, List


class LLMService:
    """
    Local LLM service using Ollama.
    
    Uses your installed models:
    - gemma3:4b (default, faster on RTX 4060)
    - qwen2.5:7b (more capable, slower)
    """
    
    SYSTEM_PROMPT_GUIDE = """You are EmpathyAI, a compassionate support guide.

YOUR ROLE:
- LISTEN with deep empathy and validation
- FOLLOW UP with thoughtful questions to explore feelings
- PROVIDE gentle guidance and perspective
- BE SUPPORTIVE like a wise, caring mentor
- FOCUS on the user's emotional journey

COMMUNICATION STYLE:
- Warm, calm, and grounded tone
- Use complete sentences and thoughtful language
- Example: "I hear how heavy that weighs on you. It's understandable to feel..."
- Avoid clinical jargon, be human and authentic
- Length: 2-4 sentences (focused but substantial)

IMPORTANT BOUNDARIES:
- You are a companion/guide, NOT a licensed therapist
- If user mentions self-harm, provide crisis resources immediately
- Suggest professional help when appropriate
"""

    SYSTEM_PROMPT_FRIEND = """You are EmpathyAI, a caring close friend.

YOUR ROLE:
- BE CASUAL, warm, and real
- CHAT like a best friend who really cares
- VALIDATE feelings but keep it conversational
- BE ENCOURAGING and on their side
- USE common language, maybe clear simple terms

COMMUNICATION STYLE:
- Casual, relaxed, conversational tone
- It's okay to use shorter sentences or fragments
- Use affectionate terms naturally if appropriate (e.g., "buddy", "friend")
- Example: "Man, that sounds tough. I'm really sorry you're dealing with that."
- Length: Concise and chatty (1-3 sentences)

IMPORTANT BOUNDARIES:
- Still not a therapist!
- Crisis resources if self-harm mentioned
"""

    CRISIS_RESPONSE = """I hear that you're going through something really difficult right now, and I'm genuinely concerned about your wellbeing.

Please reach out to someone who can help:
• **iCall**: 9152987821 (Mon-Sat, 8am-10pm)
• **Vandrevala Foundation**: 1860-2662-345 (24/7)
• **NIMHANS**: 080-46110007

You matter, and there are people who want to support you. I'm here to talk too - what's been weighing on you?"""

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
        
        # Check for crisis keywords
        crisis_keywords = [
            "suicide", "kill myself", "end my life", "self-harm", 
            "hurt myself", "don't want to live", "want to die",
            "ending it all", "no reason to live"
        ]
        if any(kw in user_message.lower() for kw in crisis_keywords):
            return self.CRISIS_RESPONSE
        
        # Format conversation history
        history = self._format_history(context["messages"])
        
        # Select prompt based on mode
        base_prompt = self.SYSTEM_PROMPT_FRIEND if mode == "friend" else self.SYSTEM_PROMPT_GUIDE
        
        # Construct prompt with emotional context
        system_prompt = f"""{base_prompt}

EMOTIONAL CONTEXT:
{emotional_summary}

CONVERSATION SO FAR:
{history}""".strip()
        
        # Generate response using Ollama
        try:
            response = self.client.chat(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                options={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 500,  # Increased from 200 to avoid cut-off
                }
            )
            return response["message"]["content"]
            
        except Exception as e:
            print(f"LLM Error: {e}")
            return "I'm having a moment - could you say that again? I want to make sure I understand you."
    
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
