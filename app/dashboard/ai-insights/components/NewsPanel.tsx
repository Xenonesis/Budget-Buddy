"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, RefreshCw, TrendingUp, Clock, Globe } from "lucide-react";
import { toast } from "sonner";

interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  url: string;
  source: string;
  publishedAt: string;
  category?: string;
}

interface NewsPanelProps {
  className?: string;
  onNewsUpdate?: (articles: NewsArticle[]) => void;
}

export function NewsPanel({ className = "", onNewsUpdate }: NewsPanelProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchNews = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const url = new URL('/api/ai/news', window.location.origin);
      if (forceRefresh) {
        url.searchParams.set('refresh', 'true');
      }
      url.searchParams.set('limit', '8');

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.articles) {
        setArticles(data.articles);
        setLastUpdated(data.timestamp);
        onNewsUpdate?.(data.articles);
        
        if (forceRefresh) {
          toast.success(`Updated with ${data.articles.length} fresh financial news articles`);
        }
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to fetch financial news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={`${className} bg-gradient-to-br from-background via-background to-muted/20 border-2 shadow-lg`}>
      <CardHeader className="pb-4 border-b bg-gradient-to-r from-green-50/50 via-emerald-50/30 to-teal-50/20 dark:from-green-950/20 dark:via-emerald-950/10 dark:to-teal-950/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full blur-sm opacity-20"></div>
              <div className="relative w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <div className="font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Financial News
              </div>
              <div className="text-xs text-muted-foreground font-normal">
                Real-time market insights
              </div>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-green-50/50 border-green-200/50 text-green-700">
              <Globe className="w-2 h-2 mr-1" />
              Live
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNews(true)}
              disabled={loading}
              className="text-xs hover:bg-green-50 hover:border-green-300 transition-all"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        {lastUpdated && (
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
            <Clock className="h-3 w-3" />
            Last updated: {formatTimeAgo(lastUpdated)}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        {loading && articles.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No financial news available</p>
            <Button onClick={() => fetchNews(true)} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {articles.map((article) => (
              <div
                key={article.id}
                className="group p-4 rounded-lg border border-border/50 hover:border-border/80 bg-card/50 hover:bg-card/80 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    
                    {article.summary && article.summary !== article.title && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                        {article.source}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(article.publishedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 h-8 w-8"
                    onClick={() => window.open(article.url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}