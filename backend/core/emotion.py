"""
Emotion Classification Service
Uses Groq LLM for lightweight emotion detection — no heavy local models.

IMPORTANT: Emotions are detected but HIDDEN from users - used only for AI context.
Uses the same Groq API already available, adding zero memory overhead.
"""

from typing import Dict, List
import hashlib
import json


class EmotionClassifier:
    """
    Lightweight emotion detection using Groq LLM.
    Results are used internally by the AI, not shown to users.
    
    Uses the same Groq API the app already relies on — no torch,
    no transformers, no 500MB model downloads. Starts instantly.
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
    
    # All valid emotions
    ALL_EMOTIONS = []
    for group_emotions in EMOTION_GROUPS.values():
        ALL_EMOTIONS.extend(group_emotions)
    
    def __init__(self):
        """Initialize the emotion classifier — instant, no model download."""
        from groq import Groq
        from config import settings
        
        api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.client = None
        
        if api_key:
            try:
                self.client = Groq(api_key=api_key)
                print("✅ Emotion classifier ready (Groq-powered, lightweight)")
            except Exception as e:
                print(f"⚠️  Emotion classifier init failed: {e}")
        else:
            print("⚠️  No GROQ_API_KEY — emotion detection disabled")
        
        # Cache for classify results — avoids redundant API calls
        self._cache: Dict[str, Dict] = {}
        self._cache_max = 500
    
    def _cache_key(self, text: str) -> str:
        """Generate a cache key for the text."""
        return hashlib.md5(text[:512].encode()).hexdigest()
    
    def classify(self, text: str) -> Dict:
        """
        Classify emotion of a single message using Groq LLM.
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
        
        # Fallback if no client
        if not self.client:
            return self._fallback_classify(text)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an emotion classifier. Given a message, respond with ONLY a JSON object "
                            "containing the primary emotion. Valid emotions: "
                            "admiration, amusement, anger, annoyance, approval, caring, confusion, curiosity, "
                            "desire, disappointment, disapproval, disgust, embarrassment, excitement, fear, "
                            "gratitude, grief, joy, love, nervousness, optimism, pride, realization, relief, "
                            "remorse, sadness, surprise, neutral. "
                            "Respond with ONLY: {\"emotion\": \"<emotion>\", \"confidence\": <0.0-1.0>}"
                        )
                    },
                    {"role": "user", "content": text[:512]}
                ],
                temperature=0.1,
                max_tokens=50,
            )
            
            raw = response.choices[0].message.content.strip()
            # Parse the JSON response
            # Handle cases where LLM wraps in markdown code block
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
            
            data = json.loads(raw)
            emotion = data.get("emotion", "neutral").lower()
            confidence = min(max(float(data.get("confidence", 0.7)), 0.0), 1.0)
            
            # Validate emotion
            if emotion not in self.ALL_EMOTIONS:
                emotion = "neutral"
            
            emotion_group = self._get_group(emotion)
            
            result = {
                "primary_emotion": emotion,
                "confidence": round(confidence, 3),
                "emotion_group": emotion_group,
                "all_emotions": [
                    {"emotion": emotion, "score": round(confidence, 3)}
                ]
            }
            
        except Exception as e:
            print(f"⚠️  Emotion classification failed: {e}")
            result = self._fallback_classify(text)
        
        # Store in cache (evict oldest if full)
        if len(self._cache) >= self._cache_max:
            oldest_key = next(iter(self._cache))
            del self._cache[oldest_key]
        self._cache[key] = result
        
        return result
    
    def _fallback_classify(self, text: str) -> Dict:
        """Simple keyword-based fallback when Groq is unavailable."""
        text_lower = text.lower()
        
        negative_words = {"sad", "angry", "frustrated", "depressed", "anxious", "worried", 
                         "stressed", "overwhelmed", "hopeless", "lonely", "hurt", "scared",
                         "afraid", "tired", "exhausted", "lost", "broken", "crying", "pain"}
        positive_words = {"happy", "grateful", "excited", "good", "great", "wonderful",
                         "amazing", "love", "thankful", "better", "hopeful", "proud", "joy"}
        
        words = set(text_lower.split())
        neg_count = len(words & negative_words)
        pos_count = len(words & positive_words)
        
        if neg_count > pos_count:
            emotion = "sadness"
            group = "negative"
        elif pos_count > neg_count:
            emotion = "joy"
            group = "positive"
        else:
            emotion = "neutral"
            group = "neutral"
        
        return {
            "primary_emotion": emotion,
            "confidence": 0.6,
            "emotion_group": group,
            "all_emotions": [{"emotion": emotion, "score": 0.6}]
        }
    
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
