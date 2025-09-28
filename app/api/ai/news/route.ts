import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { financeNewsService } from '@/lib/finance-news-service';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // Not needed for this operation
          },
          remove(name: string, options: any) {
            // Not needed for this operation
          },
        },
      }
    );

    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    try {
      // Get financial news
      const articles = await financeNewsService.getFinanceNews(forceRefresh);
      
      return NextResponse.json({
        articles: articles.slice(0, limit),
        count: articles.length,
        timestamp: new Date().toISOString(),
        cached: !forceRefresh
      });

    } catch (error) {
      console.error('Error fetching financial news:', error);
      return NextResponse.json(
        { error: 'Failed to fetch financial news' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in financial news API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // Not needed for this operation
          },
          remove(name: string, options: any) {
            // Not needed for this operation
          },
        },
      }
    );

    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    try {
      // Get contextual financial news based on query
      const newsContext = await financeNewsService.getFinanceNewsContext(query);
      
      return NextResponse.json({
        context: newsContext,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting financial news context:', error);
      return NextResponse.json(
        { error: 'Failed to get financial news context' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in financial news context API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}