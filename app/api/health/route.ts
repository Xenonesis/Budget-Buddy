import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAppVersion } from '@/lib/version';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: CheckResult;
    memory: CheckResult;
    environment: CheckResult;
  };
}

interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  latency?: number;
}

// Track server start time
const startTime = Date.now();

async function checkDatabase(): Promise<CheckResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      status: 'fail',
      message: 'Database configuration missing',
    };
  }

  const start = Date.now();
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Simple query to check database connectivity
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle();

    const latency = Date.now() - start;

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine
      return {
        status: 'fail',
        message: `Database query failed: ${error.message}`,
        latency,
      };
    }

    // Warn if latency is too high
    if (latency > 1000) {
      return {
        status: 'warn',
        message: 'Database latency is high',
        latency,
      };
    }

    return {
      status: 'pass',
      latency,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      latency: Date.now() - start,
    };
  }
}

function checkMemory(): CheckResult {
  // Note: This works in Node.js runtime, not Edge runtime
  if (typeof process !== 'undefined' && process.memoryUsage) {
    try {
      const usage = process.memoryUsage();
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
      const usagePercent = Math.round((usage.heapUsed / usage.heapTotal) * 100);

      if (usagePercent > 90) {
        return {
          status: 'fail',
          message: `Memory usage critical: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent}%)`,
        };
      }

      if (usagePercent > 75) {
        return {
          status: 'warn',
          message: `Memory usage high: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent}%)`,
        };
      }

      return {
        status: 'pass',
        message: `${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent}%)`,
      };
    } catch {
      return {
        status: 'pass',
        message: 'Memory check not available',
      };
    }
  }

  return {
    status: 'pass',
    message: 'Memory check not available in Edge runtime',
  };
}

function checkEnvironment(): CheckResult {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const optionalEnvVars = [
    'OPENAI_API_KEY',
    'GOOGLE_GEMINI_API_KEY',
    'ANTHROPIC_API_KEY',
  ];

  const missingRequired = requiredEnvVars.filter(
    (key) => !process.env[key]
  );

  if (missingRequired.length > 0) {
    return {
      status: 'fail',
      message: `Missing required environment variables: ${missingRequired.join(', ')}`,
    };
  }

  const configuredAIProviders = optionalEnvVars.filter(
    (key) => !!process.env[key]
  );

  if (configuredAIProviders.length === 0) {
    return {
      status: 'warn',
      message: 'No AI providers configured',
    };
  }

  return {
    status: 'pass',
    message: `${configuredAIProviders.length} AI provider(s) configured`,
  };
}

export async function GET() {
  const dbCheck = await checkDatabase();
  const memoryCheck = checkMemory();
  const envCheck = checkEnvironment();

  // Determine overall status
  const checks = [dbCheck, memoryCheck, envCheck];
  let overallStatus: HealthCheck['status'] = 'healthy';

  if (checks.some((c) => c.status === 'fail')) {
    overallStatus = 'unhealthy';
  } else if (checks.some((c) => c.status === 'warn')) {
    overallStatus = 'degraded';
  }

  const healthCheck: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: getAppVersion(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      database: dbCheck,
      memory: memoryCheck,
      environment: envCheck,
    },
  };

  // Return appropriate HTTP status code
  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;

  return NextResponse.json(healthCheck, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}

// Also support HEAD requests for simple uptime checks
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
