import puppeteer, { Browser, Page } from 'puppeteer';

// Server-side only - this will throw an error if imported on client
if (typeof window !== 'undefined') {
  throw new Error('Finance news scraper can only be used on the server side');
}

export interface FinanceNewsArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  category?: string;
}

export interface ScrapedNewsData {
  articles: FinanceNewsArticle[];
  scrapedAt: string;
  source: string;
}

class FinanceNewsScraper {
  private browser: Browser | null = null;
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ];

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async createPage(): Promise<Page> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    const randomUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    await page.setUserAgent(randomUserAgent);

    // Set viewport
    await page.setViewport({ width: 1366, height: 768 });

    // Add some basic anti-detection measures
    await page.evaluateOnNewDocument(() => {
      // Override navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    return page;
  }

  async scrapeYahooFinance(): Promise<ScrapedNewsData> {
    const page = await this.createPage();

    try {
      console.log('Scraping Yahoo Finance...');
      await page.goto('https://finance.yahoo.com/news', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for content to load
      await page.waitForSelector('h3[data-test-locator="headline"]', { timeout: 10000 });

      const articles = await page.evaluate(() => {
        const articleElements = document.querySelectorAll('h3[data-test-locator="headline"]');
        const results: FinanceNewsArticle[] = [];

        articleElements.forEach((element, index) => {
          if (index >= 10) return; // Limit to 10 articles

          const titleElement = element as HTMLElement;
          const title = titleElement.textContent?.trim() || '';

          // Find the parent article element
          const articleElement = titleElement.closest('a') || titleElement.closest('[data-test-locator="mega-item"]');
          const url = articleElement ? (articleElement as HTMLAnchorElement).href : '';

          // Try to find summary
          const summaryElement = titleElement.parentElement?.nextElementSibling ||
                               titleElement.nextElementSibling;
          const summary = summaryElement?.textContent?.trim() || '';

          // Extract publication time if available
          const timeElement = articleElement?.querySelector('time') ||
                            articleElement?.parentElement?.querySelector('time');
          const publishedAt = timeElement?.getAttribute('datetime') ||
                            timeElement?.textContent ||
                            new Date().toISOString();

          if (title && url) {
            results.push({
              title,
              summary: summary || title, // Use title as fallback for summary
              url,
              source: 'Yahoo Finance',
              publishedAt,
              category: 'General'
            });
          }
        });

        return results;
      });

      return {
        articles,
        scrapedAt: new Date().toISOString(),
        source: 'Yahoo Finance'
      };

    } catch (error) {
      console.error('Error scraping Yahoo Finance:', error);
      return {
        articles: [],
        scrapedAt: new Date().toISOString(),
        source: 'Yahoo Finance'
      };
    } finally {
      await page.close();
    }
  }

  async scrapeReuters(): Promise<ScrapedNewsData> {
    const page = await this.createPage();

    try {
      console.log('Scraping Reuters...');
      await page.goto('https://www.reuters.com/business/', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for content to load
      await page.waitForSelector('h2[data-testid="Heading"]', { timeout: 10000 });

      const articles = await page.evaluate(() => {
        const articleElements = document.querySelectorAll('h2[data-testid="Heading"]');
        const results: FinanceNewsArticle[] = [];

        articleElements.forEach((element, index) => {
          if (index >= 8) return; // Limit to 8 articles

          const titleElement = element as HTMLElement;
          const title = titleElement.textContent?.trim() || '';

          // Find the link
          const linkElement = titleElement.closest('a');
          const url = linkElement ? (linkElement as HTMLAnchorElement).href : '';

          // Try to find summary
          const summaryElement = titleElement.parentElement?.nextElementSibling ||
                               titleElement.nextElementSibling;
          const summary = summaryElement?.textContent?.trim() || '';

          // Extract publication time if available
          const timeElement = linkElement?.parentElement?.querySelector('time') ||
                            linkElement?.parentElement?.parentElement?.querySelector('time');
          const publishedAt = timeElement?.getAttribute('datetime') ||
                            timeElement?.textContent ||
                            new Date().toISOString();

          if (title && url && url.includes('reuters.com')) {
            results.push({
              title,
              summary: summary || title,
              url: url.startsWith('http') ? url : `https://www.reuters.com${url}`,
              source: 'Reuters',
              publishedAt,
              category: 'Business'
            });
          }
        });

        return results;
      });

      return {
        articles,
        scrapedAt: new Date().toISOString(),
        source: 'Reuters'
      };

    } catch (error) {
      console.error('Error scraping Reuters:', error);
      return {
        articles: [],
        scrapedAt: new Date().toISOString(),
        source: 'Reuters'
      };
    } finally {
      await page.close();
    }
  }

  async scrapeBloomberg(): Promise<ScrapedNewsData> {
    const page = await this.createPage();

    try {
      console.log('Scraping Bloomberg...');
      await page.goto('https://www.bloomberg.com/markets', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for content to load
      await page.waitForSelector('h3[data-component="headline"]', { timeout: 10000 });

      const articles = await page.evaluate(() => {
        const articleElements = document.querySelectorAll('h3[data-component="headline"]');
        const results: FinanceNewsArticle[] = [];

        articleElements.forEach((element, index) => {
          if (index >= 8) return; // Limit to 8 articles

          const titleElement = element as HTMLElement;
          const title = titleElement.textContent?.trim() || '';

          // Find the link
          const linkElement = titleElement.closest('a');
          const url = linkElement ? (linkElement as HTMLAnchorElement).href : '';

          // Try to find summary
          const summaryElement = titleElement.parentElement?.nextElementSibling ||
                               titleElement.nextElementSibling;
          const summary = summaryElement?.textContent?.trim() || '';

          // Extract publication time if available
          const timeElement = linkElement?.parentElement?.querySelector('time') ||
                            linkElement?.parentElement?.parentElement?.querySelector('time');
          const publishedAt = timeElement?.getAttribute('datetime') ||
                            timeElement?.textContent ||
                            new Date().toISOString();

          if (title && url && url.includes('bloomberg.com')) {
            results.push({
              title,
              summary: summary || title,
              url: url.startsWith('http') ? url : `https://www.bloomberg.com${url}`,
              source: 'Bloomberg',
              publishedAt,
              category: 'Markets'
            });
          }
        });

        return results;
      });

      return {
        articles,
        scrapedAt: new Date().toISOString(),
        source: 'Bloomberg'
      };

    } catch (error) {
      console.error('Error scraping Bloomberg:', error);
      return {
        articles: [],
        scrapedAt: new Date().toISOString(),
        source: 'Bloomberg'
      };
    } finally {
      await page.close();
    }
  }

  async scrapeAllSources(): Promise<FinanceNewsArticle[]> {
    try {
      await this.initialize();

      const [yahooData, reutersData, bloombergData] = await Promise.allSettled([
        this.scrapeYahooFinance(),
        this.scrapeReuters(),
        this.scrapeBloomberg()
      ]);

      const allArticles: FinanceNewsArticle[] = [];

      // Collect articles from successful scrapes
      if (yahooData.status === 'fulfilled' && yahooData.value.articles.length > 0) {
        allArticles.push(...yahooData.value.articles);
      }

      if (reutersData.status === 'fulfilled' && reutersData.value.articles.length > 0) {
        allArticles.push(...reutersData.value.articles);
      }

      if (bloombergData.status === 'fulfilled' && bloombergData.value.articles.length > 0) {
        allArticles.push(...bloombergData.value.articles);
      }

      // Remove duplicates based on title similarity
      const uniqueArticles = this.removeDuplicateArticles(allArticles);

      // Sort by publication date (most recent first)
      uniqueArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      // Limit to top 15 articles
      return uniqueArticles.slice(0, 15);

    } catch (error) {
      console.error('Error scraping all sources:', error);
      return [];
    }
  }

  private removeDuplicateArticles(articles: FinanceNewsArticle[]): FinanceNewsArticle[] {
    const seen = new Set<string>();
    return articles.filter(article => {
      const normalizedTitle = article.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
      if (seen.has(normalizedTitle)) {
        return false;
      }
      seen.add(normalizedTitle);
      return true;
    });
  }
}

// Singleton instance
let scraperInstance: FinanceNewsScraper | null = null;

export async function getFinanceNewsScraper(): Promise<FinanceNewsScraper> {
  if (!scraperInstance) {
    scraperInstance = new FinanceNewsScraper();
  }
  return scraperInstance;
}

export async function scrapeFinanceNews(): Promise<FinanceNewsArticle[]> {
  const scraper = await getFinanceNewsScraper();
  return await scraper.scrapeAllSources();
}

export async function closeFinanceNewsScraper(): Promise<void> {
  if (scraperInstance) {
    await scraperInstance.close();
    scraperInstance = null;
  }
}