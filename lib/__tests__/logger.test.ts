import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log info messages', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('Test message');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should log warning messages', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('Warning message');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should log error messages with error object', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');
    logger.error('Error occurred', error);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should sanitize sensitive data in context', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('Test', { password: 'secret123', userId: '123' });
    
    const logOutput = consoleSpy.mock.calls[0][0];
    expect(logOutput).not.toContain('secret123');
    expect(logOutput).toContain('[REDACTED]');
    expect(logOutput).toContain('123');
  });

  it('should create child logger with default context', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const childLogger = logger.child({ service: 'auth' });
    childLogger.info('Child log message');
    
    const logOutput = consoleSpy.mock.calls[0][0];
    expect(logOutput).toContain('auth');
  });
});
