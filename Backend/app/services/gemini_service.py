import os
import google.generativeai as genai
from typing import List, Dict
import json

class GeminiService:
    def __init__(self):
        # Configure API key from environment variable
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            print("Warning: GEMINI_API_KEY not set in environment variables")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")
    
    def analyze_comment_sentiment(self, comment: str) -> Dict:
        """
        Analyze sentiment of a single comment
        Returns: {"sentiment": "positive|negative|neutral", "score": 0-1, "explanation": "..."}
        """
        try:
            prompt = f"""
Analyze the sentiment of the following comment about a film.
Return ONLY a JSON object with this exact structure (no additional text):
{{
    "sentiment": "positive" or "negative" or "neutral",
    "score": a number between 0 and 1 (0=very negative, 0.5=neutral, 1=very positive),
    "explanation": "brief explanation in one sentence"
}}

Comment: "{comment}"
"""
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if result_text.startswith("```json"):
                result_text = result_text.replace("```json", "").replace("```", "").strip()
            elif result_text.startswith("```"):
                result_text = result_text.replace("```", "").strip()
            
            # Parse JSON response
            sentiment_data = json.loads(result_text)
            return sentiment_data
            
        except Exception as e:
            print(f"Error analyzing comment sentiment: {e}")
            return {
                "sentiment": "neutral",
                "score": 0.5,
                "explanation": "Could not analyze sentiment"
            }
    
    def analyze_bulk_comments(self, comments: List[str]) -> Dict:
        """
        Analyze sentiment of multiple comments and provide overall analysis
        Returns: {
            "overall_sentiment": "positive|negative|neutral|mixed",
            "positive_count": int,
            "negative_count": int,
            "neutral_count": int,
            "positive_percentage": float,
            "average_score": float,
            "sentiment_summary": str,
            "comments_analysis": [...]
        }
        """
        if not comments:
            return {
                "overall_sentiment": "neutral",
                "positive_count": 0,
                "negative_count": 0,
                "neutral_count": 0,
                "positive_percentage": 0,
                "average_score": 0.5,
                "sentiment_summary": "No comments to analyze",
                "comments_analysis": []
            }
        
        # Limit to analyzing first 50 comments to avoid API rate limits
        comments_to_analyze = comments[:50]
        
        try:
            # Create bulk prompt for efficiency
            comments_list = "\n".join([f"{i+1}. {comment}" for i, comment in enumerate(comments_to_analyze)])
            
            prompt = f"""
Analyze the sentiment of the following {len(comments_to_analyze)} comments about a film.
For each comment, determine if it's positive, negative, or neutral.

Return ONLY a JSON object with this exact structure (no additional text):
{{
    "comments": [
        {{"index": 1, "sentiment": "positive|negative|neutral", "score": 0.0-1.0}},
        ...
    ],
    "overall_summary": "A brief 1-2 sentence summary of the overall audience sentiment"
}}

Comments:
{comments_list}
"""
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if result_text.startswith("```json"):
                result_text = result_text.replace("```json", "").replace("```", "").strip()
            elif result_text.startswith("```"):
                result_text = result_text.replace("```", "").strip()
            
            # Parse JSON response
            bulk_analysis = json.loads(result_text)
            
            # Calculate statistics
            positive_count = sum(1 for c in bulk_analysis["comments"] if c["sentiment"] == "positive")
            negative_count = sum(1 for c in bulk_analysis["comments"] if c["sentiment"] == "negative")
            neutral_count = sum(1 for c in bulk_analysis["comments"] if c["sentiment"] == "neutral")
            
            total = len(bulk_analysis["comments"])
            positive_percentage = (positive_count / total * 100) if total > 0 else 0
            
            # Calculate average score
            scores = [c.get("score", 0.5) for c in bulk_analysis["comments"]]
            average_score = sum(scores) / len(scores) if scores else 0.5
            
            # Determine overall sentiment
            if positive_percentage > 60:
                overall_sentiment = "positive"
            elif positive_percentage < 40 and negative_count > positive_count:
                overall_sentiment = "negative"
            elif abs(positive_count - negative_count) <= total * 0.2:
                overall_sentiment = "mixed"
            else:
                overall_sentiment = "neutral"
            
            # Create detailed analysis for each comment
            comments_analysis = []
            for i, comment in enumerate(comments_to_analyze):
                analysis = bulk_analysis["comments"][i] if i < len(bulk_analysis["comments"]) else {
                    "sentiment": "neutral",
                    "score": 0.5
                }
                comments_analysis.append({
                    "comment": comment,
                    "sentiment": analysis["sentiment"],
                    "score": analysis.get("score", 0.5)
                })
            
            return {
                "overall_sentiment": overall_sentiment,
                "positive_count": positive_count,
                "negative_count": negative_count,
                "neutral_count": neutral_count,
                "positive_percentage": round(positive_percentage, 2),
                "average_score": round(average_score, 2),
                "sentiment_summary": bulk_analysis.get("overall_summary", "Mixed audience reactions"),
                "comments_analysis": comments_analysis,
                "total_analyzed": len(comments_to_analyze),
                "total_comments": len(comments)
            }
            
        except Exception as e:
            print(f"Error in bulk comment analysis: {e}")
            # Fallback to individual analysis if bulk fails
            return self._fallback_individual_analysis(comments_to_analyze)
    
    def _fallback_individual_analysis(self, comments: List[str]) -> Dict:
        """Fallback method if bulk analysis fails"""
        comments_analysis = []
        positive_count = 0
        negative_count = 0
        neutral_count = 0
        total_score = 0
        
        for comment in comments[:20]:  # Limit to 20 for fallback
            analysis = self.analyze_comment_sentiment(comment)
            comments_analysis.append({
                "comment": comment,
                "sentiment": analysis["sentiment"],
                "score": analysis["score"]
            })
            
            if analysis["sentiment"] == "positive":
                positive_count += 1
            elif analysis["sentiment"] == "negative":
                negative_count += 1
            else:
                neutral_count += 1
            
            total_score += analysis["score"]
        
        total = len(comments_analysis)
        positive_percentage = (positive_count / total * 100) if total > 0 else 0
        average_score = total_score / total if total > 0 else 0.5
        
        # Determine overall sentiment
        if positive_percentage > 60:
            overall_sentiment = "positive"
        elif positive_percentage < 40 and negative_count > positive_count:
            overall_sentiment = "negative"
        else:
            overall_sentiment = "mixed"
        
        return {
            "overall_sentiment": overall_sentiment,
            "positive_count": positive_count,
            "negative_count": negative_count,
            "neutral_count": neutral_count,
            "positive_percentage": round(positive_percentage, 2),
            "average_score": round(average_score, 2),
            "sentiment_summary": f"Analyzed {total} comments with {positive_percentage:.1f}% positive sentiment",
            "comments_analysis": comments_analysis,
            "total_analyzed": total,
            "total_comments": len(comments)
        }

# Singleton instance
gemini_service = GeminiService()
