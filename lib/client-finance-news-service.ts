/**
 * Client-side finance news service - uses API endpoints instead of direct scraping
 */

export interface FinanceNewsArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  category?: string;
}

export interface FinanceNewsResponse {
  success: boolean;
  articles: FinanceNewsArticle[];
  count: number;
  refreshed?: boolean;
  error?: string;
}

export class ClientFinanceNewsService {
  private static instance: ClientFinanceNewsService;

  static getInstance(): ClientFinanceNewsService {
    if (!ClientFinanceNewsService.instance) {
      ClientFinanceNewsService.instance = new ClientFinanceNewsService();
    }
    return ClientFinanceNewsService.instance;
  }

  /**
   * Get finance news articles from API
   */
  async getFinanceNews(forceRefresh = false): Promise<FinanceNewsArticle[]> {
    try {
      const url = `/api/finance-news${forceRefresh ? '?refresh=true' : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FinanceNewsResponse = await response.json();
      
      if (data.success) {
        return data.articles;
      } else {
        throw new Error(data.error || 'Failed to fetch finance news');
      }
    } catch (error) {
      console.error('Error fetching finance news:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Force refresh finance news
   */
  async refreshFinanceNews(): Promise<FinanceNewsArticle[]> {
    try {
      const response = await fetch('/api/finance-news', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FinanceNewsResponse = await response.json();
      
      if (data.success) {
        return data.articles;
      } else {
        throw new Error(data.error || 'Failed to refresh finance news');
      }
    } catch (error) {
      console.error('Error refreshing finance news:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Search finance news by keyword
   */
  async searchNews(keyword: string): Promise<FinanceNewsArticle[]> {
    const articles = await this.getFinanceNews();
    
    if (!keyword.trim()) {
      return articles;
    }

    const searchTerm = keyword.toLowerCase();
    return articles.filter(article => 
      article.title.toLowerCase().includes(searchTerm) ||
      article.summary.toLowerCase().includes(searchTerm) ||
      (article.category && article.category.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get news by category
   */
  async getNewsByCategory(category: string): Promise<FinanceNewsArticle[]> {
    const articles = await this.getFinanceNews();
    
    if (!category) {
      return articles;
    }

    return articles.filter(article => 
      article.category && article.category.toLowerCase() === category.toLowerCase()
    );
  }
}

// Export singleton instance
export const clientFinanceNewsService = ClientFinanceNewsService.getInstance();