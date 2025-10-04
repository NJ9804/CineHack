"use client"

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Film, Eye, ThumbsUp, MessageCircle } from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { Promotion } from '@/lib/types';
import Link from 'next/link';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllPromotions();
  }, []);

  const loadAllPromotions = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllPromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout title="Social Media Promotions">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Social Media Promotions" subtitle="Track YouTube trends and social media analytics">
      <div className="space-y-6">
        {/* Header Stats */}
        {promotions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-400">Total Analyses</CardTitle>
                <Film className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{promotions.length}</div>
                <p className="text-xs text-gray-400">Films analyzed</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-400">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(promotions.reduce((sum, p) => sum + p.total_views, 0))}
                </div>
                <p className="text-xs text-gray-400">Across all films</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/10 to-rose-600/10 border-pink-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-pink-400">Total Likes</CardTitle>
                <ThumbsUp className="h-4 w-4 text-pink-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(promotions.reduce((sum, p) => sum + p.total_likes, 0))}
                </div>
                <p className="text-xs text-gray-400">Engagement</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-violet-600/10 border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-400">Comments</CardTitle>
                <MessageCircle className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(promotions.reduce((sum, p) => sum + p.total_comments, 0))}
                </div>
                <p className="text-xs text-gray-400">Community buzz</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Promotions List */}
        {promotions.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="py-16 text-center">
              <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl text-white mb-2">No Promotion Analytics Yet</h3>
              <p className="text-gray-400 mb-6">
                Go to a project and use the Promotions tab to analyze social media trends
              </p>
              <Link href="/projects">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                  View Projects
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {promotions.map((promotion) => (
              <Card key={promotion.id} className="bg-gray-900/50 border-gray-700 hover:border-purple-500/30 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <Film className="w-5 h-5 mr-2 text-purple-400" />
                      {promotion.film}
                    </CardTitle>
                    <Link href={`/projects/${promotion.project_id}`}>
                      <Button size="sm" variant="outline" className="border-gray-700">
                        View Project
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(promotion.created_at)}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <Eye className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{formatNumber(promotion.total_views)}</div>
                      <div className="text-xs text-gray-400">Views</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <ThumbsUp className="w-4 h-4 text-pink-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{formatNumber(promotion.total_likes)}</div>
                      <div className="text-xs text-gray-400">Likes</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <MessageCircle className="w-4 h-4 text-green-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{formatNumber(promotion.total_comments)}</div>
                      <div className="text-xs text-gray-400">Comments</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-3">
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {promotion.industry_progress}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                    <span>{promotion.videos.length} videos analyzed</span>
                    <Link href={`/projects/${promotion.project_id}?tab=promotions`}>
                      <span className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                        View Details
                        <TrendingUp className="w-3 h-3" />
                      </span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
