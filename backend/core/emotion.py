"""
Emotion Classification Service
Uses GoEmotions-trained RoBERTa for fine-grained emotion detection.

IMPORTANT: Emotions are detected but HIDDEN from users - used only for AI context.
Downloads model on first run (~500MB), then runs fully offline.

Heavy imports (torch, transformers) are deferred to __init__ to keep server startup fast.
"""

from typing import Dict, List
import hashlib


class EmotionClassifier:
    """
    Fine-grained emotion detection with 27 emotion categories.
    Results are used internally by the AI, not shown to users.
    
    Heavy ML libraries (torch, transformers) are imported lazily
    so the server starts accepting requests in <2 seconds.
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
        import time
        start = time.time()
        print("🔄 Loading emotion detection model...")
        print("   (First run downloads ~500MB, subsequent runs use cache)")
        
        # Lazy import — these are ~10-15s to import
        import torch
        from transformers import pipeline
        
        # Use GPU if available
        device = 0 if torch.cuda.is_available() else -1
        
        self.classifier = pipeline(
            "text-classification",
            model="SamLowe/roberta-base-go_emotions",
            top_k=5,
            device=device
        )
        
        # Cache for classify results — avoids redundant inference
        self._cache: Dict[str, Dict] = {}
        self._cache_max = 500
        
        gpu_status = "GPU (CUDA)" if torch.cuda.is_available() else "CPU"
        elapsed = time.time() - start
        print(f"✅ Emotion model loaded in {elapsed:.1f}s! Running on: {gpu_status}")
    
    def _cache_key(self, text: str) -> str:
        """Generate a cache key for the text."""
        return hashlib.md5(text[:512].encode()).hexdigest()
    
    def classify(self, text: str) -> Dict:
        """
        Classify emotion of a single message.
        Returns emotion data for AI context (hidden from user).
        Results are cached — same text always produces same emotion.
        """
        if not text or not text.strip():
            return {
                "primary_emotion": "neutral",
                "confidence": 1.0,
                "emotion_group": "neutral",
                "all_emotions": []
            }
        
        # Check cache
        key = self._cache_key(text)
        if key in self._cache:
            return self._cache[key]
        
        # Run classification
        results = self.classifier(text[:512])
        
        primary = results[0][0]
        emotion_group = self._get_group(primary["label"])
        
        result = {
            "primary_emotion": primary["label"],
            "confidence": round(primary["score"], 3),
            "emotion_group": emotion_group,
            "all_emotions": [
                {"emotion": r["label"], "score": round(r["score"], 3)} 
                for r in results[0]
            ]
        }
        
        # Store in cache (evict oldest if full)
        if len(self._cache) >= self._cache_max:
            oldest_key = next(iter(self._cache))
            del self._cache[oldest_key]
        self._cache[key] = result
        
        return result
    
    def analyze_conversation(self, messages: List[str]) -> Dict:
        """
        Analyze emotions across multiple messages.
        More recent messages have higher weight.
        Uses cached results — no redundant inference.
        """
        if not messages:
            return {
                "dominant_emotion": "neutral",
                "emotion_group": "neutral",
                "trajectory": "conversation just started",
                "top_emotions": []
            }
        
        n = len(messages)
        weights = [2 ** (i / n) for i in range(n)]
        total_weight = sum(weights)
        weights = [w / total_weight for w in weights]
        
        emotion_scores = {}
        classifications = []
        for msg, weight in zip(messages, weights):
            result = self.classify(msg)
            classifications.append(result)
            for emotion_data in result["all_emotions"]:
                emotion = emotion_data["emotion"]
                score = emotion_data["score"] * weight
                emotion_scores[emotion] = emotion_scores.get(emotion, 0) + score
        
        sorted_emotions = sorted(
            emotion_scores.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        dominant = sorted_emotions[0][0] if sorted_emotions else "neutral"
        
        trajectory = self._analyze_trajectory_from_results(classifications)
        
        return {
            "dominant_emotion": dominant,
            "emotion_group": self._get_group(dominant),
            "top_emotions": sorted_emotions[:3],
            "trajectory": trajectory
        }
    
    def _get_group(self, emotion: str) -> str:
        """Get the emotional category."""
        for group, emotions in self.EMOTION_GROUPS.items():
            if emotion in emotions:
                return group
        return "neutral"
    
    def _analyze_trajectory_from_results(self, classifications: List[Dict]) -> str:
        """Generate trajectory description from already-classified results."""
        if len(classifications) < 2:
            return "early in conversation"
        
        mid = len(classifications) // 2
        early_groups = [c["emotion_group"] for c in classifications[:mid]]
        recent_groups = [c["emotion_group"] for c in classifications[mid:]]
        
        early_negative = early_groups.count("negative")
        recent_negative = recent_groups.count("negative")
        
        if recent_negative < early_negative:
            return "improving - user seems to be feeling better"
        elif recent_negative > early_negative:
            return "declining - user may need extra support"
        else:
            return "stable emotional state"
