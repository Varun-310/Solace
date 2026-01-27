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
    
    SYSTEM_PROMPT = """You are EmpathyAI, a compassionate and understanding mental health companion.

YOUR ROLE:
- LISTEN actively and validate the user's feelings
- RESPOND with genuine empathy and warmth
- REMEMBER our conversation context and refer back to it naturally
- ADAPT your tone based on the user's emotional state
- Be supportive like a caring friend, not clinical like a therapist

COMMUNICATION STYLE:
- Use warm, conversational language
- Keep responses focused (2-4 sentences typically)
- Use phrases like "I hear you", "That sounds", "It makes sense that you feel..."
- Ask thoughtful follow-up questions when appropriate
- Don't be preachy or give unsolicited advice
- Avoid starting every response with "I"

IMPORTANT BOUNDARIES:
- You're a supportive companion, NOT a licensed therapist
- If user mentions self-harm or crisis, provide crisis resources
- Don't diagnose conditions or prescribe treatments
- Suggest professional help when appropriate

{emotional_context}

CONVERSATION SO FAR:
{conversation_history}""".strip()

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
            models = self.client.list()
            available = [m["name"] for m in models.get("models", [])]
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
        emotional_summary: str
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
        
        # Construct prompt with emotional context
        system_prompt = self.SYSTEM_PROMPT.format(
            emotional_context=emotional_summary,
            conversation_history=history
        )
        
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
                    "num_predict": 200,  # Reasonable response length
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
