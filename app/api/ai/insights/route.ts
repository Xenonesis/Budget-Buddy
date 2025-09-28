import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateRealFinancialInsights } from '@/lib/real-financial-insights';
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

    // Fetch user's financial data
    const [transactionsResult, budgetsResult] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(100),
      supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
    ]);

    if (transactionsResult.error) {
      console.error('Error fetching transactions:', transactionsResult.error);
      return NextResponse.json(
        { error: 'Failed to fetch transaction data' },
        { status: 500 }
      );
    }

    if (budgetsResult.error) {
      console.error('Error fetching budgets:', budgetsResult.error);
      return NextResponse.json(
        { error: 'Failed to fetch budget data' },
        { status: 500 }
      );
    }

    // Generate insights
    const insights = generateRealFinancialInsights(
      transactionsResult.data || [],
      budgetsResult.data || []
    );

    // Get recent financial news for context
    let newsContext = null;
    try {
      const recentNews = await financeNewsService.getFinanceNews();
      newsContext = recentNews.slice(0, 3); // Top 3 articles
    } catch (error) {
      console.error('Error fetching news context:', error);
    }

    return NextResponse.json({
      insights,
      newsContext,
      timestamp: new Date().toISOString(),
      dataPoints: {
        transactionCount: transactionsResult.data?.length || 0,
        budgetCount: budgetsResult.data?.length || 0
      }
    });

  } catch (error) {
    console.error('Error in AI insights API:', error);
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

    const { forceRefresh = false } = await request.json();

    // Fetch user's financial data
    const [transactionsResult, budgetsResult] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(100),
      supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
    ]);

    if (transactionsResult.error || budgetsResult.error) {
      return NextResponse.json(
        { error: 'Failed to fetch financial data' },
        { status: 500 }
      );
    }

    // Generate fresh insights
    const insights = generateRealFinancialInsights(
      transactionsResult.data || [],
      budgetsResult.data || []
    );

    // Get fresh financial news if requested
    let newsContext = null;
    try {
      const recentNews = await financeNewsService.getFinanceNews(forceRefresh);
      newsContext = recentNews.slice(0, 5); // Top 5 articles for refresh
    } catch (error) {
      console.error('Error fetching fresh news:', error);
    }

    return NextResponse.json({
      insights,
      newsContext,
      timestamp: new Date().toISOString(),
      dataPoints: {
        transactionCount: transactionsResult.data?.length || 0,
        budgetCount: budgetsResult.data?.length || 0
      }
    });

  } catch (error) {
    console.error('Error refreshing AI insights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}