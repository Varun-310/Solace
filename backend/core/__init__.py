"""
EmpathyAI Core Package
Contains business logic for emotion detection, context management, and LLM integration.
"""

from .emotion import EmotionClassifier
from .context import ContextManager
from .llm import LLMService

__all__ = ["EmotionClassifier", "ContextManager", "LLMService"]
