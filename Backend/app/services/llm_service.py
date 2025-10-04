import os
from google import genai
import json
import PyPDF2
import io

class LLMService:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv('GEMINI_API_KEY', 'AIzaSyC2P95fKrpkvv582iXf4iyQTWwV8ZDvGN8'))
    
    def parse_script_to_scenes(self, text_chunk: str) -> dict:
        """Parse script text into structured scene data using Gemini AI."""
        
        prompt = f"""
        Analyze this film script and extract scene information. Return a JSON response with the following structure:

        {{
            "scenes": [
                {{
                    "scene_number": "Scene number or identifier",
                    "scene_heading": "Scene heading (INT/EXT, location, time)",
                    "actors": [
                        {{
                            "name": "Character/Actor name",
                            "role": "main/supporting/background",
                            "description": "Brief description of character's role in scene"
                        }}
                    ],
                    "props": ["list of props needed"],
                    "location": {{
                        "name": "Location name",
                        "type": "indoor/outdoor",
                        "specific_details": "Detailed location description"
                    }},
                    "crowd": {{
                        "people_needed": "Number estimate (e.g., 5-10, 20+, none)",
                        "crowd_type": "Type of background extras needed"
                    }},
                    "time": {{
                        "time_of_day": "morning/afternoon/evening/night/day",
                        "season": "season if specified",
                        "weather": "weather conditions if mentioned",
                        "specific_time": "specific time if mentioned"
                    }},
                    "scene_type": "dialogue/action/montage/etc",
                    "duration_estimate": "estimated scene length",
                    "technical_notes": "Special equipment, lighting, camera notes"
                }}
            ]
        }}

        Script content:
        {text_chunk}

        Return ONLY valid JSON. Be thorough in extracting all relevant production details.
        """

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            return self._parse_json_response(response.text)
        except Exception as e:
            return {"error": f"LLM parsing failed: {str(e)}"}
    
    def estimate_scene_cost(self, scene_data: dict, cost_catalog: dict) -> dict:
        """Estimate cost for a scene based on requirements and cost catalog."""
        
        prompt = f"""
        Based on this scene data and cost catalog, estimate the total cost breakdown:
        
        Scene: {json.dumps(scene_data, indent=2)}
        
        Cost Catalog: {json.dumps(cost_catalog, indent=2)}
        
        Return JSON with:
        {{
            "total_estimated_cost": 0,
            "breakdown": {{
                "actors": 0,
                "props": 0,
                "location": 0,
                "equipment": 0,
                "crowd": 0,
                "other": 0
            }},
            "reasoning": "Brief explanation of cost calculation"
        }}
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            return self._parse_json_response(response.text)
        except Exception as e:
            return {"error": f"Cost estimation failed: {str(e)}"}
    
    def analyze_sentiment(self, comments: list, video_title: str = "") -> dict:
        """Analyze sentiment of comments using Gemini AI."""
        
        if not comments or len(comments) == 0:
            return {
                "overall_sentiment": "neutral",
                "positive_count": 0,
                "negative_count": 0,
                "neutral_count": 0,
                "positive_percentage": 0,
                "average_score": 0.5,
                "sentiment_summary": "No comments available for analysis",
                "total_analyzed": 0,
                "total_comments": 0
            }
        
        # Limit to first 100 comments for analysis to avoid token limits
        comments_to_analyze = comments[:100]
        comments_text = "\n".join([f"- {comment}" for comment in comments_to_analyze])
        
        prompt = f"""
        Analyze the sentiment of these YouTube comments for the video "{video_title}".
        
        Comments:
        {comments_text}
        
        Provide a detailed sentiment analysis in JSON format:
        {{
            "overall_sentiment": "positive/negative/neutral/mixed",
            "positive_count": <number of positive comments>,
            "negative_count": <number of negative comments>,
            "neutral_count": <number of neutral comments>,
            "positive_percentage": <percentage of positive comments>,
            "average_score": <average sentiment score from 0 to 1, where 0 is very negative, 0.5 is neutral, 1 is very positive>,
            "sentiment_summary": "<2-3 sentence summary of the overall sentiment and key themes in the comments>"
        }}
        
        Return ONLY valid JSON.
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            result = self._parse_json_response(response.text)
            
            # Add total counts
            result["total_analyzed"] = len(comments_to_analyze)
            result["total_comments"] = len(comments)
            
            return result
        except Exception as e:
            return {
                "overall_sentiment": "neutral",
                "positive_count": 0,
                "negative_count": 0,
                "neutral_count": 0,
                "positive_percentage": 0,
                "average_score": 0.5,
                "sentiment_summary": f"Sentiment analysis failed: {str(e)}",
                "total_analyzed": 0,
                "total_comments": len(comments)
            }
    
    def generate_industry_analysis(self, film_name: str, analytics_data: dict, sentiment_data: dict) -> str:
        """Generate an impressive industry analysis based on film performance and sentiment."""
        
        sentiment = sentiment_data.get('overall_sentiment', 'neutral')
        positive_pct = sentiment_data.get('positive_percentage', 0)
        
        prompt = f"""
        You are a professional film industry analyst. Generate an impressive, engaging industry analysis for the film "{film_name}" based on the following data:
        
        Analytics Summary:
        - Total Views: {analytics_data.get('total_views', 0):,}
        - Total Likes: {analytics_data.get('total_likes', 0):,}
        - Total Comments: {analytics_data.get('total_comments', 0):,}
        - Number of Videos: {len(analytics_data.get('videos', []))}
        
        Sentiment Analysis:
        - Overall Sentiment: {sentiment}
        - Positive Percentage: {positive_pct}%
        - Average Sentiment Score: {sentiment_data.get('average_score', 0.5)}
        
        Generate a compelling 3-4 sentence industry analysis that:
        1. MUST START with the sentiment classification: If positive, start with "✅ POSITIVE ANALYSIS - This is a GOOD FILM!" or "✅ EXCELLENT FILM - Positive Reception!"
        2. If negative, start with "⚠️ NEEDS IMPROVEMENT -" or "📊 MIXED RECEPTION -"
        3. If neutral/mixed, start with "🎯 BALANCED ANALYSIS -" or "📈 GROWTH POTENTIAL -"
        4. Uses exciting language and LOTS of emojis including smiling faces (😊 😄 😃 🎬 🌟 💫 🔥 ✨ 🎯 📈 💪 🎉 👏 ⭐ 🚀 💖 🏆 etc.)
        5. MUST include smiling emojis (😊 😄 😃) throughout the text
        6. Highlights the film's performance in an impressive way
        7. Mentions specific metrics naturally
        8. Sounds professional yet enthusiastic
        9. Makes outsiders feel impressed about the film's success
        
        IMPORTANT: Clearly label the analysis as "POSITIVE", "GOOD FILM", "NEGATIVE", or "MIXED" at the beginning!
        
        If sentiment is positive, emphasize the success with happy emojis. If mixed/neutral, focus on growth potential with encouraging emojis. If negative, focus on areas of strength with supportive emojis.
        
        Return ONLY the analysis text (no JSON, just the paragraph with LOTS of emojis including smiling faces and clear sentiment label).
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            return response.text.strip()
        except Exception as e:
            # Fallback message with sentiment label
            if sentiment == 'positive':
                return f"✅ POSITIVE ANALYSIS - This is a GOOD FILM! 😊 🎬 {film_name} is making waves in the industry with {analytics_data.get('total_views', 0):,} views across {len(analytics_data.get('videos', []))} videos! 🌟 With {positive_pct}% positive sentiment, audiences are loving it! 😄"
            else:
                return f"📊 ANALYSIS: 🎬 {film_name} has {analytics_data.get('total_views', 0):,} views across {len(analytics_data.get('videos', []))} videos! 🌟 😊"
    
    def _parse_json_response(self, response_text: str) -> dict:
        """Parse JSON response from LLM, handling potential formatting issues."""
        try:
            # Try to extract JSON from the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                return {
                    "error": "No valid JSON found in response",
                    "raw_response": response_text
                }
        except json.JSONDecodeError as e:
            return {
                "error": f"JSON parsing failed: {str(e)}",
                "raw_response": response_text
            }

# Global instance
llm_service = LLMService()