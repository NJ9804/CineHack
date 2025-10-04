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