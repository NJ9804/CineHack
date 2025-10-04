from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict to frontend in production
    allow_methods=["*"],
    allow_headers=["*"],
)

YOUTUBE_API_KEY = "AIzaSyCLRQL8AFVzK0j1pV8B56i-RYMMl6Ljtgk"

class FilmRequest(BaseModel):
    film: str

@app.post("/film-report")
def film_report(request: FilmRequest):
    film = request.film

    # 1️⃣ Search top 5 interview/review videos
    search_url = "https://www.googleapis.com/youtube/v3/search"
    search_params = {
        "part": "snippet",
        "q": f"{film} interview OR review",
        "type": "video",
        "maxResults": 5,
        "key": YOUTUBE_API_KEY
    }
    search_response = requests.get(search_url, params=search_params).json()
    if not search_response.get("items"):
        return {"message": "No videos found"}

    videos_info = []

    for item in search_response["items"]:
        video_id = item["id"]["videoId"]

        # 2️⃣ Get video details
        video_url = "https://www.googleapis.com/youtube/v3/videos"
        video_params = {
            "part": "snippet,statistics",
            "id": video_id,
            "key": YOUTUBE_API_KEY
        }
        video_response = requests.get(video_url, params=video_params).json()
        video = video_response["items"][0]

        # 3️⃣ Get top 3 comments for the video
        comments_url = "https://www.googleapis.com/youtube/v3/commentThreads"
        comments_params = {
            "part": "snippet",
            "videoId": video_id,
            "maxResults": 3,
            "order": "relevance",
            "key": YOUTUBE_API_KEY
        }
        comments_response = requests.get(comments_url, params=comments_params).json()
        top_comments = [
            comment["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
            for comment in comments_response.get("items", [])
        ]

        videos_info.append({
            "video_title": video["snippet"]["title"],
            "video_description": video["snippet"]["description"],
            "views": video["statistics"].get("viewCount", "0"),
            "likes": video["statistics"].get("likeCount", "0"),
            "comments_count": video["statistics"].get("commentCount", "0"),
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "top_comments": top_comments
        })

    # 4️⃣ Calculate overall popularity metrics
    total_views = sum(int(v["views"]) for v in videos_info)
    total_likes = sum(int(v["likes"]) for v in videos_info)
    total_comments = sum(int(v["comments_count"]) for v in videos_info)

    report = {
        "film": film,
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "videos": videos_info,
        "industry_progress": f"Based on YouTube stats, '{film}' has {total_views} views and {total_comments} comments indicating its popularity."
    }

    return report
