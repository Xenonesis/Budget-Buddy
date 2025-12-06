import { describe, it, expect } from 'vitest';
import { apiSuccess, apiError, ApiErrors } from '@/lib/api-response';

describe('apiSuccess', () => {
  it('should create a successful response with data', async () => {
    const data = { id: 1, name: 'Test' };
    const response = apiSuccess(data);

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(data);
  });

  it('should include meta information', async () => {
    const data = { id: 1 };
    const response = apiSuccess(data);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(data);
    expect(body.meta).toBeDefined();
    expect(body.meta.timestamp).toBeDefined();
    expect(body.meta.requestId).toBeDefined();
  });

  it('should accept custom status code via options', async () => {
    const data = { created: true };
    const response = apiSuccess(data, { status: 201 });

    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it('should include pagination in meta if provided', async () => {
    const data = [1, 2, 3];
    const pagination = { page: 1, limit: 10, total: 100 };
    const response = apiSuccess(data, { pagination });

    const body = await response.json();
    expect(body.meta?.pagination).toBeDefined();
    expect(body.meta?.pagination?.page).toBe(1);
    expect(body.meta?.pagination?.limit).toBe(10);
    expect(body.meta?.pagination?.total).toBe(100);
    expect(body.meta?.pagination?.totalPages).toBe(10);
  });

  it('should include request ID in headers', () => {
    const data = { test: true };
    const response = apiSuccess(data);

    expect(response.headers.get('X-Request-Id')).toBeTruthy();
  });
});

describe('apiError', () => {
  it('should create an error response', async () => {
    const response = apiError('NOT_FOUND', 'Resource not found', { status: 404 });

    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it('should include error information', async () => {
    const response = apiError('VALIDATION_ERROR', 'Invalid input', { status: 400 });

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('Invalid input');
  });

  it('should default to 500 status if not provided', async () => {
    const response = apiError('INTERNAL_ERROR', 'Something went wrong');

    expect(response.status).toBe(500);
  });

  it('should include request ID in headers', () => {
    const response = apiError('ERROR', 'Test error');

    expect(response.headers.get('X-Request-Id')).toBeTruthy();
  });
});

describe('ApiErrors', () => {
  it('should create badRequest error', async () => {
    const response = ApiErrors.badRequest('Bad request');
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error.code).toBe('BAD_REQUEST');
  });

  it('should create unauthorized error', async () => {
    const response = ApiErrors.unauthorized();
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('should create forbidden error', async () => {
    const response = ApiErrors.forbidden();
    expect(response.status).toBe(403);

    const body = await response.json();
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('should create notFound error', async () => {
    const response = ApiErrors.notFound('User');
    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toContain('User');
  });

  it('should create validationError', async () => {
    const errors = { email: 'Invalid email' };
    const response = ApiErrors.validationError(errors);
    expect(response.status).toBe(422);

    const body = await response.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should create internalError', async () => {
    const response = ApiErrors.internalError();
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should create conflict error', async () => {
    const response = ApiErrors.conflict('Resource already exists');
    expect(response.status).toBe(409);

    const body = await response.json();
    expect(body.error.code).toBe('CONFLICT');
  });

  it('should create rateLimited error', async () => {
    const response = ApiErrors.rateLimited();
    expect(response.status).toBe(429);

    const body = await response.json();
    expect(body.error.code).toBe('RATE_LIMITED');
  });

  it('should create serviceUnavailable error', async () => {
    const response = ApiErrors.serviceUnavailable();
    expect(response.status).toBe(503);

    const body = await response.json();
    expect(body.error.code).toBe('SERVICE_UNAVAILABLE');
  });
});
