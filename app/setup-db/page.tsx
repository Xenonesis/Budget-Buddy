'use client';

import { useState } from 'react';

export default function DatabaseSetupPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const setupDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/setup-db', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to setup database: ' + error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Database Setup</h1>
      
      <div className="mb-6">
        <button
          onClick={setupDatabase}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Setup Missing Tables'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">What this will do:</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Create the `goals` table with proper RLS policies</li>
          <li>Create the `smart_alerts` table with proper RLS policies</li>
          <li>Add necessary indexes for performance</li>
          <li>Set up proper foreign key relationships</li>
          <li>Test table accessibility after creation</li>
        </ul>
      </div>
    </div>
  );
}