/**
 * Simple logger utility for client and server side
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface Logger {
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
}

const createLogger = (): Logger => {
  const log = (level: LogLevel, message: string, ...args: unknown[]) => {
    if (typeof window !== 'undefined') {
      // Client-side
      const styles = {
        info: 'color: #3B82F6',
        warn: 'color: #F59E0B',
        error: 'color: #EF4444',
        debug: 'color: #6B7280',
      };
      console[level === 'debug' ? 'log' : level](
        `%c[${level.toUpperCase()}] ${message}`,
        styles[level],
        ...args
      );
    } else {
      // Server-side
      console[level === 'debug' ? 'log' : level](`[${level.toUpperCase()}] ${message}`, ...args);
    }
  };

  return {
    info: (message: string, ...args: unknown[]) => log('info', message, ...args),
    warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
    error: (message: string, ...args: unknown[]) => log('error', message, ...args),
    debug: (message: string, ...args: unknown[]) => log('debug', message, ...args),
  };
};

export const logger = createLogger();

