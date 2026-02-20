import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '../health/route';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null })),
        })),
      })),
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
  })),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    })
  ),
}));

describe('Health API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://mock.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'mock-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return health status', async () => {
    const response = await GET();
    const data = await response.json();

    if (response.status !== 200) {
      console.log('Health Check Failed:', JSON.stringify(data, null, 2));
    }

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('checks');
  });

  it('should include version and uptime', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('uptime');
    expect(typeof data.uptime).toBe('number');
    expect(data.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should check database connectivity', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.checks).toHaveProperty('database');
    expect(data.checks.database).toHaveProperty('status');
    expect(['pass', 'fail', 'warn']).toContain(data.checks.database.status);
  });

  it('should check memory status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.checks).toHaveProperty('memory');
    expect(data.checks.memory).toHaveProperty('status');
    expect(['pass', 'fail', 'warn']).toContain(data.checks.memory.status);
  });

  it('should check environment configuration', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.checks).toHaveProperty('environment');
    expect(data.checks.environment).toHaveProperty('status');
    expect(['pass', 'fail', 'warn']).toContain(data.checks.environment.status);
  });

  it('should return proper status codes', async () => {
    const response = await GET();

    // Should return 200 for healthy or 503 for unhealthy
    expect([200, 503]).toContain(response.status);
  });
});
