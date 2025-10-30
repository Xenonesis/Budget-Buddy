import { useState, useEffect, useCallback, useMemo } from 'react';
import { FastDashboardService, FastDashboardStats } from '@/lib/fast-dashboard-service';
import { supabase } from '@/lib/supabase';

export function useFastDashboard(timeRange: string = 'this-month') {
  const [stats, setStats] = useState<FastDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const data = await FastDashboardService.getFastDashboardData(userData.user.id, timeRange);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoize computed values to prevent unnecessary recalculations
  const computedStats = useMemo(() => {
    if (!stats) return null;
    
    return {
      ...stats,
      netWorth: stats.totalIncome - stats.totalExpense,
      savingsRate: stats.totalIncome > 0 ? ((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100 : 0,
      avgMonthlyIncome: stats.monthlyData.length > 0 ? stats.totalIncome / stats.monthlyData.length : 0,
      avgMonthlyExpense: stats.monthlyData.length > 0 ? stats.totalExpense / stats.monthlyData.length : 0
    };
  }, [stats]);

  return {
    stats: computedStats,
    loading,
    error,
    refetch: fetchData
  };
}