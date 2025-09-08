"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestDBConnection() {
 const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

 useEffect(() => {
    const testConnection = async () => {
      try {
        // Test authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          setError(`Authentication error: ${authError.message}`);
          setConnectionStatus('Failed');
          return;
        }
        
        if (!user) {
          setError('No user authenticated');
          setConnectionStatus('Failed');
          return;
        }
        
        setConnectionStatus('Authenticated');
        
        // Test fetching budgets
        const { data: budgets, error: budgetsError } = await supabase
          .from('budgets')
          .select('*')
          .limit(1);
          
        if (budgetsError) {
          setError(`Budgets fetch error: ${budgetsError.message}`);
          setConnectionStatus('Failed');
          return;
        }
        
        setData(budgets);
        setConnectionStatus('Success');
      } catch (err: any) {
        setError(`Unexpected error: ${err.message}`);
        setConnectionStatus('Failed');
      }
    };
    
    testConnection();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      <div className="mb-4">
        <p>Status: {connectionStatus}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
        {data && <p className="text-green-500">Data fetched successfully: {JSON.stringify(data)}</p>}
      </div>
    </div>
  );
}