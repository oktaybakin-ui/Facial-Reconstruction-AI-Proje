/**
 * Generic retry wrapper with exponential backoff + jitter
 * Tüm AI API çağrıları için kullanılır
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
  maxTotalTimeMs: number;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 2,
  initialDelayMs: 1000,
  maxDelayMs: 15000,
  backoffMultiplier: 2,
  retryableStatusCodes: [429, 500, 502, 503, 529],
  maxTotalTimeMs: 30000, // Vercel serverless timeout güvenliği
};

function isRetryableError(error: unknown, retryableStatusCodes: number[]): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as Record<string, unknown>;

  // Anthropic SDK errors have .status
  if (typeof err.status === 'number' && retryableStatusCodes.includes(err.status)) {
    return true;
  }

  // OpenAI SDK errors
  if (typeof err.statusCode === 'number' && retryableStatusCodes.includes(err.statusCode)) {
    return true;
  }

  // Network errors (ECONNRESET, ETIMEDOUT, etc.)
  const code = err.code as string | undefined;
  if (code && ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'EPIPE', 'UND_ERR_CONNECT_TIMEOUT'].includes(code)) {
    return true;
  }

  // Check error message for common transient patterns
  const message = err.message as string | undefined;
  if (message && (message.includes('overloaded') || message.includes('rate limit') || message.includes('temporarily'))) {
    return true;
  }

  return false;
}

function addJitter(delayMs: number): number {
  // Add +/- 20% jitter to prevent thundering herd
  const jitter = delayMs * 0.2 * (Math.random() * 2 - 1);
  return Math.max(100, delayMs + jitter);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();
  let lastError: unknown;

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;

      // Don't retry if not a retryable error
      if (!isRetryableError(error, cfg.retryableStatusCodes)) {
        throw error;
      }

      // Don't retry if we've exhausted attempts
      if (attempt >= cfg.maxRetries) {
        break;
      }

      // Calculate delay
      const baseDelay = cfg.initialDelayMs * Math.pow(cfg.backoffMultiplier, attempt);
      const delay = addJitter(Math.min(baseDelay, cfg.maxDelayMs));

      // Check if we'd exceed total time limit
      const elapsed = Date.now() - startTime;
      if (elapsed + delay > cfg.maxTotalTimeMs) {
        console.warn(`Retry aborted: total time limit (${cfg.maxTotalTimeMs}ms) would be exceeded`);
        break;
      }

      const errStatus = (error as Record<string, unknown>).status || 'unknown';
      console.warn(
        `API call failed (attempt ${attempt + 1}/${cfg.maxRetries + 1}, status: ${errStatus}). ` +
        `Retrying in ${Math.round(delay)}ms...`
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
