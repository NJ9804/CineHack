# 🎬 CineHack Promotions Feature - Social Media Analytics Dashboard

## Overview

The Promotions feature is a comprehensive social media analytics dashboard that provides real-time insights into your film's online presence and audience engagement across YouTube and other social platforms.

## ✨ Features

### 1. **YouTube Video Analytics**
- **Automatic Discovery**: Fetches all YouTube videos related to your film
- **Engagement Metrics**: Views, likes, comments, and engagement rates
- **Video Rankings**: Automatically ranks videos by performance
- **Top Comments**: Extracts and displays the most popular comments from each video
- **Direct Links**: Quick access to watch videos on YouTube

### 2. **Comprehensive Dashboard**
- **Real-time Stats**: Total views, likes, comments across all videos
- **Industry Insights**: AI-powered analysis of your film's market position
- **Performance Comparison**: Visual charts comparing video performance
- **Engagement Tracking**: Calculate and display engagement rates for each video

### 3. **Multi-Project Support**
- Track promotions for multiple projects
- Historical analysis tracking
- Compare different analysis snapshots over time

### 4. **Beautiful UI/UX**
- **Modern Design**: Gradient cards with glassmorphism effects
- **Dark Theme**: Eye-friendly interface for production teams
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Interactive Elements**: Hover effects, smooth transitions, and animations

## 🚀 How to Use

### Analyzing Your Film's Social Trends

1. **Navigate to Project**
   - Go to any project in your dashboard
   - Click on the "Promotions" tab

2. **Run Analysis**
   - Enter your film's name in the input field
   - Click "Analyze Trends" button
   - Wait for the backend to fetch and analyze YouTube data (takes ~10-30 seconds)

3. **View Results**
   - Overview cards show total metrics across all videos
   - Industry analysis provides market insights
   - Video cards display detailed performance metrics
   - Click video links to watch on YouTube
   - Read top comments to gauge audience sentiment

### Accessing Global Promotions

1. Navigate to `/promotions` in the main menu
2. View all promotion analyses across all projects
3. Click "View Project" to go to specific project details

## 📊 Data Displayed

### Overview Metrics
- **Total Views**: Aggregate views across all videos
- **Total Likes**: Sum of likes from all videos
- **Total Comments**: Community engagement count
- **Videos Found**: Number of YouTube videos analyzed

### Per-Video Metrics
- Video title and description
- View count with formatted numbers (K/M notation)
- Like count and engagement percentage
- Comment count
- Top 3 community comments
- Direct YouTube link
- Performance ranking

### Industry Insights
- AI-generated analysis of film's popularity
- Market position based on metrics
- Audience reception indicators

## 🔧 Technical Implementation

### Frontend Components

**Main Components:**
- `PromotionsTab.tsx` - Full-featured dashboard for project-level analytics
- `promotions/page.tsx` - Global promotions overview page

**Key Features:**
- TypeScript for type safety
- React hooks for state management
- Responsive design with Tailwind CSS
- Real-time data fetching from backend API

### API Integration

**Endpoints Used:**
```typescript
POST /api/promotions
- Create new promotion analysis
- Body: { film: string, project_id: number }

GET /api/promotions/projects/{project_id}
- Get all promotions for a project

GET /api/promotions/{promotion_id}
- Get specific promotion details

GET /api/promotions
- Get all promotions across all projects
```

### Data Types

```typescript
interface Promotion {
  id: number;
  project_id: number;
  film: string;
  created_at: string;
  report: PromotionReport;
}

interface PromotionReport {
  film: string;
  total_views: number;
  total_likes: number;
  total_comments: number;
  videos: VideoAnalytics[];
  industry_progress: string;
}

interface VideoAnalytics {
  video_title: string;
  video_description: string;
  views: number;
  likes: number;
  comments_count: number;
  url: string;
  top_comments: string[];
}
```

## 🎨 UI Components

### Cards & Metrics
- Gradient backgrounds with brand colors (purple, pink, blue)
- Icon indicators for different metrics
- Hover effects for interactivity
- Responsive grid layouts

### Video Performance Cards
- Full video information display
- Stats grid with icons
- Expandable description
- Top comments section
- External link to YouTube

### Comparison Charts
- Horizontal bar charts
- Gradient progress bars
- Percentage-based width calculation
- Formatted number displays

## 💡 Best Practices

### For Production Teams
1. **Regular Monitoring**: Run analysis weekly to track trends
2. **Compare Over Time**: Use multiple analyses to see growth
3. **Engagement Focus**: High engagement rate > raw view count
4. **Comment Analysis**: Read top comments for audience feedback
5. **Content Strategy**: Identify which video types perform best

### For Marketing Teams
1. **Identify Influencers**: Videos with high engagement may be from influencers
2. **Track Sentiment**: Read comments to gauge audience reception
3. **Competitive Analysis**: Compare your metrics with similar films
4. **Content Gaps**: Identify what content is missing or underperforming

## 🔮 Future Enhancements

Potential features for future iterations:
- [ ] Sentiment analysis on comments
- [ ] Twitter/X integration
- [ ] Instagram metrics
- [ ] Trending hashtags tracking
- [ ] Competitor comparison
- [ ] Export reports to PDF
- [ ] Email notifications for viral videos
- [ ] Predictive analytics for box office
- [ ] Regional breakdown of views
- [ ] Demographic insights

## 🐛 Troubleshooting

### "No promotions found"
- Ensure the film name is spelled correctly
- Some films may have limited YouTube content
- Try alternative names or titles

### "Analysis taking too long"
- YouTube API may be rate-limited
- Large datasets take longer to process
- Check backend logs for errors

### "Error creating promotion"
- Verify backend server is running
- Check network connectivity
- Ensure project_id is valid

## 📝 Notes

- Analysis uses YouTube Data API v3
- Data is cached for performance
- Historical data is preserved
- All metrics are pulled in real-time during analysis
- Top comments are filtered for quality and relevance

## 🎯 Success Metrics

Track these KPIs to measure your film's success:
- **Viral Coefficient**: Videos with >1M views
- **Engagement Rate**: (Likes + Comments) / Views
- **Audience Retention**: Comment quality and length
- **Growth Rate**: Compare analyses over time
- **Reach**: Total views across all platforms

---

**Built with ❤️ for CineHack - Revolutionizing Film Production Management**
