import { supabase } from './supabase';
import { scrapeFinanceNews, FinanceNewsArticle } from './finance-news-scraper';

export interface CachedFinanceNews {
  id: string;
  articles: FinanceNewsArticle[];
  scrapedAt: string;
  expiresAt: string;
  sources: string[];
}

export class FinanceNewsService {
  private static instance: FinanceNewsService;
  private cacheExpiryMinutes = 30; // Cache for 30 minutes

  static getInstance(): FinanceNewsService {
    if (!FinanceNewsService.instance) {
      FinanceNewsService.instance = new FinanceNewsService();
    }
    return FinanceNewsService.instance;
  }

  /**
   * Get finance news articles, using cache if available and valid
   */
  async getFinanceNews(forceRefresh = false): Promise<FinanceNewsArticle[]> {
    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cachedData = await this.getCachedNews();
        if (cachedData && cachedData.articles.length > 0) {
          console.log('Using cached finance news data');
          return cachedData.articles;
        }
      }

      // Scrape fresh data
      console.log('Scraping fresh finance news data');
      const articles = await scrapeFinanceNews();

      if (articles.length > 0) {
        // Cache the scraped data
        await this.cacheNewsData(articles);
      }

      return articles;
    } catch (error) {
      console.error('Error getting finance news:', error);

      // Try to return cached data as fallback, even if expired
      try {
        const cachedData = await this.getCachedNews(true);
        if (cachedData && cachedData.articles.length > 0) {
          console.log('Using expired cached data as fallback');
          return cachedData.articles;
        }
      } catch (cacheError) {
        console.error('Error retrieving cached data as fallback:', cacheError);
      }

      return [];
    }
  }

  /**
   * Get cached news data if valid
   */
  private async getCachedNews(includeExpired = false): Promise<CachedFinanceNews | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_valid_finance_news_cache');

      if (error) {
        console.error('Error fetching cached news:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const cacheEntry = data[0];
      const now = new Date();
      const expiresAt = new Date(cacheEntry.expires_at);

      // Check if cache is still valid
      if (!includeExpired && expiresAt <= now) {
        console.log('Cached news data has expired');
        return null;
      }

      return {
        id: cacheEntry.id,
        articles: cacheEntry.articles as FinanceNewsArticle[],
        scrapedAt: cacheEntry.scraped_at,
        expiresAt: cacheEntry.expires_at,
        sources: cacheEntry.sources
      };
    } catch (error) {
      console.error('Error in getCachedNews:', error);
      return null;
    }
  }

  /**
   * Cache scraped news data
   */
  private async cacheNewsData(articles: FinanceNewsArticle[]): Promise<void> {
    try {
      const sources = ['Yahoo Finance', 'Reuters', 'Bloomberg'];

      const { error } = await supabase
        .rpc('upsert_finance_news_cache', {
          p_articles: articles,
          p_sources: sources
        });

      if (error) {
        console.error('Error caching news data:', error);
      } else {
        console.log(`Cached ${articles.length} finance news articles`);
      }
    } catch (error) {
      console.error('Error in cacheNewsData:', error);
    }
  }

  /**
   * Check if a query is finance-related
   */
  isFinanceRelatedQuery(query: string): boolean {
    const financeKeywords = [
      'stock', 'stocks', 'market', 'markets', 'finance', 'financial',
      'investment', 'investments', 'trading', 'trade', 'economy', 'economic',
      'business', 'corporate', 'company', 'companies', 'earnings', 'revenue',
      'profit', 'loss', 'bull', 'bear', 'bullish', 'bearish', 'dividend',
      'portfolio', 'bond', 'bonds', 'etf', 'mutual fund', 'crypto', 'cryptocurrency',
      'bitcoin', 'ethereum', 'nasdaq', 'dow jones', 's&p', 'sp500', 'fed',
      'federal reserve', 'interest rate', 'inflation', 'recession', 'growth',
      'valuation', 'p/e ratio', 'dividend yield', 'ipo', 'merger', 'acquisition'
    ];

    const lowerQuery = query.toLowerCase();
    return financeKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Get finance news context for AI chat
   */
  async getFinanceNewsContext(query: string): Promise<string> {
    if (!this.isFinanceRelatedQuery(query)) {
      return '';
    }

    try {
      const articles = await this.getFinanceNews();

      if (articles.length === 0) {
        return 'Note: Unable to fetch current financial news at this time.';
      }

      // Format top 5 articles for context
      const topArticles = articles.slice(0, 5);
      let context = 'Recent Financial News:\n\n';

      topArticles.forEach((article, index) => {
        context += `${index + 1}. ${article.title}\n`;
        context += `   Source: ${article.source}\n`;
        if (article.summary && article.summary !== article.title) {
          context += `   Summary: ${article.summary}\n`;
        }
        context += `   Published: ${new Date(article.publishedAt).toLocaleDateString()}\n`;
        context += `   URL: ${article.url}\n\n`;
      });

      context += 'Please consider this recent financial news when providing advice. Remember that this is for informational purposes only and not financial advice.';

      return context;
    } catch (error) {
      console.error('Error getting finance news context:', error);
      return 'Note: Unable to fetch current financial news at this time.';
    }
  }

  /**
   * Clean up expired cache entries (can be called periodically)
   */
  async cleanupExpiredCache(): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('cleanup_expired_finance_news_cache');

      if (error) {
        console.error('Error cleaning up expired cache:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in cleanupExpiredCache:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const financeNewsService = FinanceNewsService.getInstance();