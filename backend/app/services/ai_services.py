import os
import base64
import json
import requests
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

HF_API_URL = "https://router.huggingface.co/hf-inference/models/intfloat/multilingual-e5-small/pipeline/sentence-similarity"

SENTIMENT_REFERENCES = {
    "positive": [
        "I am happy and satisfied with the service",
        "This is excellent and wonderful work",
        "Thank you for resolving my issue quickly",
        "I appreciate the help and support provided"
    ],
    "negative": [
        "This is terrible and frustrating",
        "I am very angry and upset about this problem",
        "This situation is unacceptable and causing hardship",
        "Nobody is helping me and I am suffering",
        "This has been going on for too long without resolution"
    ],
    "neutral": [
        "I am reporting a general issue for your attention",
        "This is a routine matter that needs attention",
        "I would like to submit information about a situation",
        "Please look into this matter when possible"
    ]
}

URGENCY_KEYWORDS = {
    "high": ["emergency", "urgent", "dangerous", "life-threatening", "immediate", "critical", "severe", "flooding", "fire", "collapse", "accident"],
    "medium": ["broken", "damaged", "not working", "leaking", "blocked", "delayed", "problem", "issue"],
    "low": ["request", "suggestion", "inquiry", "information", "general", "routine"]
}


def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Analyze sentiment of text using HuggingFace multilingual-e5-small model.
    Compares input text with reference sentences to determine sentiment.
    """
    if not HF_TOKEN:
        return {"error": "HF_TOKEN not configured", "sentiment": "neutral", "confidence": 0.0}

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}

    sentiment_scores = {}

    for sentiment, reference_sentences in SENTIMENT_REFERENCES.items():
        try:
            payload = {
                "inputs": {
                    "source_sentence": text,
                    "sentences": reference_sentences
                }
            }
            response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=30)

            if response.status_code == 200:
                scores = response.json()
                avg_score = sum(scores) / len(scores) if scores else 0
                sentiment_scores[sentiment] = avg_score
            else:
                sentiment_scores[sentiment] = 0.0
        except Exception as e:
            print(f"Error analyzing sentiment for {sentiment}: {e}")
            sentiment_scores[sentiment] = 0.0

    if not sentiment_scores or all(v == 0 for v in sentiment_scores.values()):
        return {
            "sentiment": "neutral",
            "confidence": 0.0,
            "similarity_scores": sentiment_scores,
            "error": "Could not determine sentiment"
        }

    detected_sentiment = max(sentiment_scores, key=sentiment_scores.get)
    max_score = sentiment_scores[detected_sentiment]

    total_score = sum(sentiment_scores.values())
    confidence = max_score / total_score if total_score > 0 else 0

    return {
        "sentiment": detected_sentiment,
        "confidence": round(confidence, 3),
        "similarity_scores": {k: round(v, 4) for k, v in sentiment_scores.items()}
    }


def calculate_urgency(text: str) -> int:
    """Calculate urgency score (1-10) based on keywords in text."""
    text_lower = text.lower()

    high_count = sum(1 for kw in URGENCY_KEYWORDS["high"] if kw in text_lower)
    medium_count = sum(1 for kw in URGENCY_KEYWORDS["medium"] if kw in text_lower)
    low_count = sum(1 for kw in URGENCY_KEYWORDS["low"] if kw in text_lower)

    if high_count >= 2:
        return 9
    elif high_count >= 1:
        return 8
    elif medium_count >= 3:
        return 7
    elif medium_count >= 2:
        return 6
    elif medium_count >= 1:
        return 5
    elif low_count >= 1:
        return 3
    else:
        return 4


def analyze_image_with_blip(image_base64: str) -> str:
    """
    Get image caption using HuggingFace BLIP model.
    Falls back to empty string if service unavailable.
    """
    if not HF_TOKEN:
        return ""

    try:
        from huggingface_hub import InferenceClient

        # Convert base64 to bytes
        if image_base64.startswith("data:"):
            image_base64 = image_base64.split(",")[1]

        image_bytes = base64.b64decode(image_base64)

        client = InferenceClient(token=HF_TOKEN)

        # Try multiple models
        models = [
            "Salesforce/blip-image-captioning-large",
            "Salesforce/blip-image-captioning-base",
            "nlpconnect/vit-gpt2-image-captioning",
        ]

        for model in models:
            try:
                result = client.image_to_text(image_bytes, model=model)
                if result:
                    return result
            except Exception:
                continue

        return ""
    except Exception as e:
        print(f"BLIP analysis error: {e}")
        return ""


def analyze_image_with_llm(image_description: str, grievance_context: str = "") -> Dict[str, Any]:
    """
    Use Groq LLM to analyze an image description in the context of grievance reporting.
    Generates technical, professional analysis for municipal administration.
    """
    if not GROQ_API_KEY:
        return {
            "description": image_description,
            "key_observations": [],
            "identified_problems": [],
            "affected_areas": [],
            "recommended_actions": [],
            "severity": "medium",
            "severity_reason": "Unable to perform detailed analysis"
        }

    try:
        client = Groq(api_key=GROQ_API_KEY)

        prompt = f"""You are a Senior Municipal Engineer analyzing evidence from a citizen grievance report for official documentation.

Image Evidence: "{image_description}"
{f'Complaint Details: {grievance_context}' if grievance_context else ''}

Provide a TECHNICAL and PROFESSIONAL analysis in JSON format. Use engineering/municipal terminology:

{{
    "description": "Technical description (3-4 sentences) using proper engineering terminology. Include: type of infrastructure affected, visible damage assessment, potential structural/safety implications, and estimated impact radius.",
    "key_observations": [
        "Technical observation with specific details (e.g., 'Asphalt surface degradation approximately 2-3 sq meters')",
        "Secondary observation with measurements/estimates",
        "Tertiary observation noting environmental or safety factors"
    ],
    "identified_problems": [
        "Primary deficiency: [technical term] - [specific description]",
        "Secondary issue: [technical term] - [impact assessment]",
        "Tertiary concern: [if applicable]"
    ],
    "affected_areas": [
        "Primary impact zone: [specific area/infrastructure type]",
        "Secondary affected systems: [related infrastructure]"
    ],
    "recommended_actions": [
        "Immediate: [urgent action with technical specification]",
        "Short-term: [remediation action with methodology]",
        "Long-term: [preventive measure or policy recommendation]"
    ],
    "severity": "low/medium/high/critical",
    "severity_reason": "Technical justification citing safety codes, structural integrity concerns, or public health standards"
}}

Use terminology like: structural integrity, load-bearing capacity, drainage coefficient, surface degradation, utility infrastructure, public right-of-way, municipal code violation, remediation protocol, preventive maintenance, etc.

Respond ONLY with valid JSON."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
            temperature=0.3
        )

        result_text = response.choices[0].message.content.strip()

        # Parse JSON
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()

        result = json.loads(result_text)
        return {
            "description": result.get("description", image_description),
            "key_observations": result.get("key_observations", []),
            "identified_problems": result.get("identified_problems", []),
            "affected_areas": result.get("affected_areas", []),
            "recommended_actions": result.get("recommended_actions", []),
            "severity": result.get("severity", "medium"),
            "severity_reason": result.get("severity_reason", "")
        }
    except Exception as e:
        print(f"LLM analysis error: {e}")
        return {
            "description": image_description,
            "key_observations": [],
            "identified_problems": [],
            "affected_areas": [],
            "recommended_actions": [],
            "severity": "medium",
            "severity_reason": "Analysis based on image caption"
        }


def analyze_image(image_base64: str, grievance_context: str = "") -> Dict[str, Any]:
    """
    Analyze an image using HuggingFace BLIP for captioning and Groq LLM for detailed analysis.
    Returns comprehensive analysis with key observations, problems, and recommendations.
    If image captioning fails, uses context-based analysis from the grievance description.
    """
    # Step 1: Try to get image description using BLIP
    print("Getting image caption with BLIP...")
    image_caption = analyze_image_with_blip(image_base64)

    if image_caption:
        print(f"BLIP caption: {image_caption}")
        # Step 2: Use LLM to expand on the caption
        print("Analyzing with LLM...")
        analysis = analyze_image_with_llm(image_caption, grievance_context)
        return analysis
    else:
        # Fallback: Generate analysis based on grievance context alone
        print("Image captioning unavailable, using context-based analysis...")
        if grievance_context:
            return analyze_image_with_llm(
                "Image related to citizen grievance (visual analysis temporarily unavailable)",
                grievance_context
            )
        else:
            return {
                "description": "Image uploaded as supporting evidence",
                "key_observations": ["Visual evidence provided by citizen"],
                "identified_problems": ["Issue documented in uploaded image"],
                "affected_areas": ["To be determined by manual review"],
                "recommended_actions": ["Manual inspection of uploaded image recommended"],
                "severity": "medium",
                "severity_reason": "Automated image analysis temporarily unavailable - manual review needed"
            }


def analyze_grievance(text: str, images: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Analyze a complete grievance including text and images.
    Returns combined analysis with sentiment, urgency, and image descriptions.
    """
    text_analysis = analyze_sentiment(text)
    urgency_score = calculate_urgency(text)

    text_analysis["urgency_score"] = urgency_score

    image_analyses = []
    if images:
        for idx, image_base64 in enumerate(images):
            try:
                # Pass grievance text as context for better image analysis
                analysis = analyze_image(image_base64, grievance_context=text)
                analysis["image_index"] = idx
                image_analyses.append(analysis)
            except Exception as e:
                image_analyses.append({
                    "image_index": idx,
                    "error": str(e),
                    "description": "",
                    "identified_problems": [],
                    "severity": "unknown"
                })

    overall_severity = "medium"
    if image_analyses:
        severities = [img.get("severity", "medium") for img in image_analyses]
        if "high" in severities:
            overall_severity = "high"
        elif all(s == "low" for s in severities):
            overall_severity = "low"

    return {
        "text_analysis": text_analysis,
        "image_analyses": image_analyses,
        "overall_urgency": urgency_score,
        "overall_severity": overall_severity
    }
