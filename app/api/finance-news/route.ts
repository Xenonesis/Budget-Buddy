import { NextRequest, NextResponse } from 'next/server';
import { FinanceNewsService } from '@/lib/finance-news-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const newsService = FinanceNewsService.getInstance();
    const articles = await newsService.getFinanceNews(forceRefresh);

    return NextResponse.json({
      success: true,
      articles,
      count: articles.length
    });

  } catch (error) {
    console.error('Finance news API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch finance news',
        articles: []
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Force refresh by scraping new data
    const newsService = FinanceNewsService.getInstance();
    const articles = await newsService.getFinanceNews(true);

    return NextResponse.json({
      success: true,
      articles,
      count: articles.length,
      refreshed: true
    });

  } catch (error) {
    console.error('Finance news refresh API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh finance news',
        articles: []
      },
      { status: 500 }
    );
  }
}