/**
 * Production-grade structured logging utility
 * Provides consistent log formatting with levels, timestamps, and context
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isDebugEnabled = process.env.DEBUG === 'true';
  
  private formatLogEntry(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Pretty format for development
      const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
      let output = `${prefix} ${entry.message}`;
      
      if (entry.context && Object.keys(entry.context).length > 0) {
        output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
      }
      
      if (entry.error) {
        output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
        if (entry.error.stack) {
          output += `\n  Stack: ${entry.error.stack}`;
        }
      }
      
      return output;
    }
    
    // JSON format for production (better for log aggregation services)
    return JSON.stringify(entry);
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = this.sanitizeContext(context);
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    return entry;
  }

  private sanitizeContext(context: LogContext): LogContext {
    const sensitiveKeys = [
      'password',
      'token',
      'apiKey',
      'api_key',
      'secret',
      'authorization',
      'cookie',
      'session',
      'credit_card',
      'ssn',
      'anon_key',
    ];

    const sanitized: LogContext = {};

    for (const [key, value] of Object.entries(context)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(
        (sensitiveKey) =>
          lowerKey.includes(sensitiveKey) || lowerKey === sensitiveKey
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeContext(value as LogContext);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.isDebugEnabled && !this.isDevelopment) return;
    
    const entry = this.createLogEntry('debug', message, context);
    console.debug(this.formatLogEntry(entry));
  }

  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('info', message, context);
    console.info(this.formatLogEntry(entry));
  }

  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('warn', message, context);
    console.warn(this.formatLogEntry(entry));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorObj = error instanceof Error ? error : undefined;
    const entry = this.createLogEntry('error', message, context, errorObj);
    
    if (error && !(error instanceof Error)) {
      entry.context = {
        ...entry.context,
        rawError: String(error),
      };
    }
    
    console.error(this.formatLogEntry(entry));
  }

  /**
   * Create a child logger with preset context
   */
  child(defaultContext: LogContext): ChildLogger {
    return new ChildLogger(this, defaultContext);
  }

  /**
   * Log API request details
   */
  apiRequest(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    context?: LogContext
  ): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const message = `${method} ${path} ${statusCode} ${durationMs}ms`;
    
    this[level](message, {
      type: 'api_request',
      method,
      path,
      statusCode,
      durationMs,
      ...context,
    });
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, durationMs: number, context?: LogContext): void {
    this.info(`Performance: ${operation}`, {
      type: 'performance',
      operation,
      durationMs,
      ...context,
    });
  }

  /**
   * Log security-related events
   */
  security(event: string, context?: LogContext): void {
    this.warn(`Security: ${event}`, {
      type: 'security',
      event,
      ...context,
    });
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private defaultContext: LogContext
  ) {}

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.defaultContext, ...context };
  }

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, this.mergeContext(context));
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, this.mergeContext(context));
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, this.mergeContext(context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    this.parent.error(message, error, this.mergeContext(context));
  }
}

// Export a singleton instance
export const logger = new Logger();

// Export for testing/custom instances
export { Logger, ChildLogger };
export type { LogLevel, LogContext, LogEntry };
