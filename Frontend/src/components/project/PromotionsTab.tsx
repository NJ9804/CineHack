"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  Video, 
  BarChart3, 
  Play,
  RefreshCw,
  Loader2,
  ExternalLink,
  Calendar,
  Award,
  Users
} from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { Promotion, VideoAnalytics } from '@/lib/types';

interface PromotionsTabProps {
  projectId: string;
  projectName: string;
}

export default function PromotionsTab({ projectId, projectName }: PromotionsTabProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filmName, setFilmName] = useState(projectName || '');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPromotions(projectId);
      setPromotions(data);
      
      // Auto-select the latest promotion
      if (data.length > 0) {
        setSelectedPromotion(data[0]);
      }
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleCreatePromotion = async () => {
    if (!filmName.trim()) {
      alert('Please enter a film name');
      return;
    }

    try {
      setCreating(true);
      const response = await apiClient.createPromotion(filmName, projectId);
      
      console.log('Create promotion response:', response);
      
      if (response.success) {
        // Reload promotions to get the updated list
        await loadPromotions();
        alert('Promotion analysis completed successfully!');
      } else {
        alert('Failed to create promotion analysis. Please try again.');
      }
    } catch (error) {
      console.error('Error creating promotion:', error);
      alert(`Failed to create promotion analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateEngagementRate = (video: VideoAnalytics) => {
    if (video.views === 0) return 0;
    return ((video.likes + video.comments_count) / video.views * 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section - Create New Analysis */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-purple-400" />
            Social Media Analytics & Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Film Name</label>
              <Input
                type="text"
                value={filmName}
                onChange={(e) => setFilmName(e.target.value)}
                placeholder="Enter film name to analyze..."
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button
              onClick={handleCreatePromotion}
              disabled={creating || !filmName.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analyze Trends
                </>
              )}
            </Button>
            <Button
              onClick={loadPromotions}
              variant="outline"
              className="border-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* No Promotions State */}
      {promotions.length === 0 && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="py-16 text-center">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">No Promotion Analytics Yet</h3>
            <p className="text-gray-400 mb-6">
              Start by analyzing your film&apos;s social media presence and YouTube trends
            </p>
            <p className="text-sm text-gray-500">
              Enter your film name above and click &quot;Analyze Trends&quot; to get started
            </p>
          </CardContent>
        </Card>
      )}

      {/* Promotions List & Analytics */}
      {promotions.length > 0 && (
        <>
          {/* Promotion Selector */}
          {promotions.length > 1 && (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Analysis History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {promotions.map((promo) => (
                    <Button
                      key={promo.id}
                      onClick={() => setSelectedPromotion(promo)}
                      variant={selectedPromotion?.id === promo.id ? "default" : "outline"}
                      size="sm"
                      className={
                        selectedPromotion?.id === promo.id
                          ? "bg-purple-500 hover:bg-purple-600"
                          : "border-gray-700"
                      }
                    >
                      <Calendar className="w-3 h-3 mr-2" />
                      {formatDate(promo.created_at)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics Dashboard */}
          {selectedPromotion && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-400">Total Views</CardTitle>
                    <Eye className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {formatNumber(selectedPromotion.total_views)}
                    </div>
                    <p className="text-xs text-gray-400">Across all videos</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-500/10 to-rose-600/10 border-pink-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-pink-400">Total Likes</CardTitle>
                    <ThumbsUp className="h-4 w-4 text-pink-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {formatNumber(selectedPromotion.total_likes)}
                    </div>
                    <p className="text-xs text-gray-400">Positive engagement</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-400">Comments</CardTitle>
                    <MessageCircle className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {formatNumber(selectedPromotion.total_comments)}
                    </div>
                    <p className="text-xs text-gray-400">Community engagement</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-violet-600/10 border-purple-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-400">Videos Found</CardTitle>
                    <Video className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {selectedPromotion.videos.length}
                    </div>
                    <p className="text-xs text-gray-400">Content pieces</p>
                  </CardContent>
                </Card>
              </div>

              {/* Industry Progress Insight */}
              <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Award className="w-5 h-5 mr-2 text-amber-400" />
                    Industry Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedPromotion.industry_progress}
                  </p>
                </CardContent>
              </Card>

              {/* Video Analytics */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Video className="w-5 h-5 mr-2 text-purple-400" />
                    Video Performance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPromotion.videos.map((video: VideoAnalytics, index: number) => (
                      <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-purple-500/30 transition-all">
                        <CardContent className="p-6">
                          {/* Video Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Play className="w-5 h-5 text-red-500" />
                                <h3 className="text-lg font-semibold text-white line-clamp-2">
                                  {video.video_title}
                                </h3>
                              </div>
                              <a 
                                href={video.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                              >
                                Watch on YouTube
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs text-gray-400">Rank</span>
                              <span className="text-xl font-bold text-amber-400">#{index + 1}</span>
                            </div>
                          </div>

                          {/* Video Stats Grid */}
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                              <Eye className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                              <div className="text-lg font-bold text-white">{formatNumber(video.views)}</div>
                              <div className="text-xs text-gray-400">Views</div>
                            </div>
                            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                              <ThumbsUp className="w-4 h-4 text-pink-400 mx-auto mb-1" />
                              <div className="text-lg font-bold text-white">{formatNumber(video.likes)}</div>
                              <div className="text-xs text-gray-400">Likes</div>
                            </div>
                            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                              <MessageCircle className="w-4 h-4 text-green-400 mx-auto mb-1" />
                              <div className="text-lg font-bold text-white">{formatNumber(video.comments_count)}</div>
                              <div className="text-xs text-gray-400">Comments</div>
                            </div>
                            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                              <TrendingUp className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                              <div className="text-lg font-bold text-white">{calculateEngagementRate(video)}%</div>
                              <div className="text-xs text-gray-400">Engagement</div>
                            </div>
                          </div>

                          {/* Video Description */}
                          {video.video_description && (
                            <div className="mb-4">
                              <p className="text-xs text-gray-400 mb-1">Description:</p>
                              <p className="text-sm text-gray-300 line-clamp-2">
                                {video.video_description}
                              </p>
                            </div>
                          )}

                          {/* Top Comments */}
                          {video.top_comments && video.top_comments.length > 0 && (
                            <div className="bg-gray-900/50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-purple-400" />
                                <h4 className="text-sm font-semibold text-purple-400">Top Comments</h4>
                              </div>
                              <div className="space-y-2">
                                {video.top_comments.slice(0, 3).map((comment: string, commentIndex: number) => (
                                  <div key={commentIndex} className="border-l-2 border-purple-500/30 pl-3">
                                    <p className="text-sm text-gray-300 line-clamp-2">
                                      {comment}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Comparison Chart */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-amber-400" />
                    Video Performance Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedPromotion.videos.map((video: VideoAnalytics, index: number) => {
                      const maxViews = Math.max(...selectedPromotion.videos.map((v: VideoAnalytics) => v.views));
                      const percentage = (video.views / maxViews) * 100;
                      
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 truncate flex-1 mr-2">
                              {video.video_title.substring(0, 50)}...
                            </span>
                            <span className="text-white font-semibold">{formatNumber(video.views)}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
