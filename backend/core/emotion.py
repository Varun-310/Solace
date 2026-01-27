"""
Emotion Classification Service
Uses GoEmotions-trained RoBERTa for fine-grained emotion detection.

IMPORTANT: Emotions are detected but HIDDEN from users - used only for AI context.
Downloads model on first run (~500MB), then runs fully offline.
"""

from transformers import pipeline
from typing import Dict, List
import torch


class EmotionClassifier:
    """
    Fine-grained emotion detection with 27 emotion categories.
    Results are used internally by the AI, not shown to users.
    """
    
    # Emotion groupings for context understanding
    EMOTION_GROUPS = {
        "positive": [
            "admiration", "amusement", "approval", "caring", "desire", 
            "excitement", "gratitude", "joy", "love", "optimism", 
            "pride", "relief"
        ],
        "negative": [
            "anger", "annoyance", "disappointment", "disapproval", 
            "disgust", "embarrassment", "fear", "grief", "nervousness", 
            "remorse", "sadness"
        ],
        "ambiguous": ["confusion", "curiosity", "realization", "surprise"],
        "neutral": ["neutral"]
    }
    
    def __init__(self):
        """Initialize the emotion classifier - downloads model on first run."""
        print("🔄 Loading emotion detection model...")
        print("   (First run downloads ~500MB, subsequent runs use cache)")
        
        # Use GPU if available (RTX 4060)
        device = 0 if torch.cuda.is_available() else -1
        
        self.classifier = pipeline(
            "text-classification",
            model="SamLowe/roberta-base-go_emotions",
            top_k=5,  # Get top 5 emotions
            device=device
        )
        
        gpu_status = "GPU (CUDA)" if torch.cuda.is_available() else "CPU"
        print(f"✅ Emotion model loaded! Running on: {gpu_status}")
    
    def classify(self, text: str) -> Dict:
        """
        Classify emotion of a single message.
        Returns emotion data for AI context (hidden from user).
        """
        if not text or not text.strip():
            return {
                "primary_emotion": "neutral",
                "confidence": 1.0,
                "emotion_group": "neutral",
                "all_emotions": []
            }
        
        results = self.classifier(text[:512])  # Limit input length
        
        primary = results[0][0]
        emotion_group = self._get_group(primary["label"])
        
        return {
            "primary_emotion": primary["label"],
            "confidence": round(primary["score"], 3),
            "emotion_group": emotion_group,
            "all_emotions": [
                {"emotion": r["label"], "score": round(r["score"], 3)} 
                for r in results[0]
            ]
        }
    
    def analyze_conversation(self, messages: List[str]) -> Dict:
        """
        Analyze emotions across multiple messages.
        More recent messages have higher weight.
        """
        if not messages:
            return {
                "dominant_emotion": "neutral",
                "emotion_group": "neutral",
                "trajectory": "conversation just started",
                "top_emotions": []
            }
        
        # Weight recent messages higher (exponential decay)
        n = len(messages)
        weights = [2 ** (i / n) for i in range(n)]
        total_weight = sum(weights)
        weights = [w / total_weight for w in weights]
        
        # Aggregate emotion scores
        emotion_scores = {}
        for msg, weight in zip(messages, weights):
            result = self.classify(msg)
            for emotion_data in result["all_emotions"]:
                emotion = emotion_data["emotion"]
                score = emotion_data["score"] * weight
                emotion_scores[emotion] = emotion_scores.get(emotion, 0) + score
        
        # Get dominant emotion
        sorted_emotions = sorted(
            emotion_scores.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        dominant = sorted_emotions[0][0] if sorted_emotions else "neutral"
        
        # Determine trajectory
        trajectory = self._analyze_trajectory(messages)
        
        return {
            "dominant_emotion": dominant,
            "emotion_group": self._get_group(dominant),
            "top_emotions": sorted_emotions[:3],
            "trajectory": trajectory
        }
    
    def _get_group(self, emotion: str) -> str:
        """Get the emotional category (positive/negative/ambiguous/neutral)."""
        for group, emotions in self.EMOTION_GROUPS.items():
            if emotion in emotions:
                return group
        return "neutral"
    
    def _analyze_trajectory(self, messages: List[str]) -> str:
        """Generate natural language description of emotional trajectory."""
        if len(messages) < 2:
            return "early in conversation"
        
        # Analyze first half vs second half
        mid = len(messages) // 2
        early_groups = [self.classify(m)["emotion_group"] for m in messages[:mid]]
        recent_groups = [self.classify(m)["emotion_group"] for m in messages[mid:]]
        
        early_negative = early_groups.count("negative")
        recent_negative = recent_groups.count("negative")
        
        if recent_negative < early_negative:
            return "improving - user seems to be feeling better"
        elif recent_negative > early_negative:
            return "declining - user may need extra support"
        else:
            return "stable emotional state"
