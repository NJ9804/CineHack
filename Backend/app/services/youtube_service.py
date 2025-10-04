import os
import requests

# Load key from env var YOUTUBE_API_KEY. If not present, try .env (python-dotenv) and
# finally fall back to the legacy top-level `youtube.py` file (dev convenience only).
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

if not YOUTUBE_API_KEY:
    # Try loading .env if python-dotenv is installed (optional)
    try:
        from dotenv import load_dotenv
        # load .env from repository root
        load_dotenv()
        YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    except Exception:
        # dotenv not available or .env absent -> continue to next fallback
        YOUTUBE_API_KEY = YOUTUBE_API_KEY

if not YOUTUBE_API_KEY:
    # Last-resort: try to import legacy hardcoded value from top-level youtube.py
    try:
        import youtube as legacy_youtube  # top-level file `Backend/youtube.py`
        YOUTUBE_API_KEY = getattr(legacy_youtube, "YOUTUBE_API_KEY", None)
    except Exception:
        YOUTUBE_API_KEY = YOUTUBE_API_KEY

class YouTubeService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or YOUTUBE_API_KEY

    def film_report(self, film: str) -> dict:
        if not self.api_key:
            raise RuntimeError("YouTube API key not configured")

        # Search top 5 interview/review videos
        search_url = "https://www.googleapis.com/youtube/v3/search"
        search_params = {
            "part": "snippet",
            "q": f"{film} interview OR review",
            "type": "video",
            "maxResults": 5,
            "key": self.api_key
        }
        search_response = requests.get(search_url, params=search_params).json()
        if not search_response.get("items"):
            return {"message": "No videos found"}

        videos_info = []

        for item in search_response["items"]:
            video_id = item["id"].get("videoId")
            if not video_id:
                continue

            # Get video details
            video_url = "https://www.googleapis.com/youtube/v3/videos"
            video_params = {
                "part": "snippet,statistics",
                "id": video_id,
                "key": self.api_key
            }
            video_response = requests.get(video_url, params=video_params).json()
            items = video_response.get("items") or []
            if not items:
                continue
            video = items[0]

            # Get top 3 comments for the video
            comments_url = "https://www.googleapis.com/youtube/v3/commentThreads"
            comments_params = {
                "part": "snippet",
                "videoId": video_id,
                "maxResults": 3,
                "order": "relevance",
                "key": self.api_key
            }
            comments_response = requests.get(comments_url, params=comments_params).json()
            top_comments = [
                comment["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
                for comment in comments_response.get("items", [])
            ]

            videos_info.append({
                "video_title": video["snippet"].get("title"),
                "video_description": video["snippet"].get("description"),
                "views": int(video.get("statistics", {}).get("viewCount", 0)),
                "likes": int(video.get("statistics", {}).get("likeCount", 0)),
                "comments_count": int(video.get("statistics", {}).get("commentCount", 0)),
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "top_comments": top_comments
            })

        total_views = sum(v.get("views", 0) for v in videos_info)
        total_likes = sum(v.get("likes", 0) for v in videos_info)
        total_comments = sum(v.get("comments_count", 0) for v in videos_info)

        report = {
            "film": film,
            "total_views": total_views,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "videos": videos_info,
            "industry_progress": f"Based on YouTube stats, '{film}' has {total_views} views and {total_comments} comments indicating its popularity."
        }

        return report

# global instance
youtube_service = YouTubeService()
