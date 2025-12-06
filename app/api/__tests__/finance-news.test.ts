import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../finance-news/route';
import { NextRequest } from 'next/server';

// Mock FinanceNewsService
vi.mock('@/lib/finance-news-service', () => ({
  FinanceNewsService: {
    getInstance: vi.fn(() => ({
      getFinanceNews: vi.fn((forceRefresh: boolean) =>
        Promise.resolve([
          {
            id: '1',
            title: 'Market Update',
            description: 'Stock market news',
            url: 'https://example.com/news1',
            source: 'Financial Times',
            publishedAt: '2025-01-15T10:00:00Z',
            imageUrl: 'https://example.com/image1.jpg',
          },
          {
            id: '2',
            title: 'Economic Report',
            description: 'Latest economic indicators',
            url: 'https://example.com/news2',
            source: 'Bloomberg',
            publishedAt: '2025-01-15T09:00:00Z',
            imageUrl: 'https://example.com/image2.jpg',
          },
        ])
      ),
    })),
  },
}));

describe('Finance News API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/finance-news', () => {
    it('should return finance news articles', async () => {
      const request = new NextRequest('http://localhost:3000/api/finance-news');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.articles).toHaveLength(2);
      expect(data.count).toBe(2);
    });

    it('should return articles with correct structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/finance-news');
      const response = await GET(request);
      const data = await response.json();

      const article = data.articles[0];
      expect(article).toHaveProperty('id');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('description');
      expect(article).toHaveProperty('url');
      expect(article).toHaveProperty('source');
      expect(article).toHaveProperty('publishedAt');
    });

    it('should handle refresh parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/finance-news?refresh=true');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const { FinanceNewsService } = await import('@/lib/finance-news-service');
      vi.mocked(FinanceNewsService.getInstance).mockReturnValueOnce({
        getFinanceNews: vi.fn(() => Promise.reject(new Error('Service unavailable'))),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/finance-news');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch finance news');
      expect(data.articles).toEqual([]);
    });
  });

  describe('POST /api/finance-news', () => {
    it('should refresh finance news', async () => {
      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.refreshed).toBe(true);
      expect(data.articles).toHaveLength(2);
    });

    it('should handle refresh errors', async () => {
      const { FinanceNewsService } = await import('@/lib/finance-news-service');
      vi.mocked(FinanceNewsService.getInstance).mockReturnValueOnce({
        getFinanceNews: vi.fn(() => Promise.reject(new Error('Refresh failed'))),
      } as any);

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to refresh finance news');
    });
  });
});
