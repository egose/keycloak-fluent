/**
 * Retry helpers for Keycloak admin operations.
 *
 * Classification is based on structured transport responses (HTTP status codes
 * surfaced on the {@link NetworkError}-like errors thrown by
 * `@keycloak/keycloak-admin-client`). A bare `Error` whose message merely
 * contains a transient-looking substring (e.g. `unknown_error`) is NOT
 * retried, because such classification can replay permanent failures and
 * mutate state ambiguously.
 *
 * Retryable statuses (transient server-side or throttling conditions):
 *   - 429 Too Many Requests
 *   - 502 Bad Gateway
 *   - 503 Service Unavailable
 *   - 504 Gateway Timeout
 *
 * Validation (4xx other than 429) and authorization (401/403) failures are
 * never retried. Network/parse errors without a status surface are not
 * retried by the default classifier either; callers that can prove
 * idempotency may pass a custom {@link RetryOptions.retryOn} predicate.
 *
 * Non-idempotent mutations are not retried by default. Callers must pass
 * {@link RetryOptions.idempotent} with a documented rationale to opt
 * mutations into retry.
 */

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);

export type TransportError = {
  response?: { status?: number };
  responseData?: unknown;
};

/**
 * Returns the HTTP status carried by a structured transport error, or
 * `undefined` when the error has no status surface. The Keycloak admin client
 * throws `NetworkError` instances that expose `error.response.status`; this
 * helper also tolerates duck-typed shapes used in tests.
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const response = (error as TransportError).response;
  const status = response?.status;

  return typeof status === 'number' ? status : undefined;
}

/**
 * Returns the Keycloak server error message carried by a structured transport
 * error, or `undefined` when no message surface exists. Keycloak serializes
 * validation errors as `{ error: '...' }` (JSON) or `{ errorMessage: '...' }`
 * (form) in {@link TransportError.responseData}; this helper tolerates both
 * shapes plus duck-typed test doubles. It returns the message string only when
 * the payload actually carries one, so callers can branch on structured error
 * text without resorting to regexp-matching {@link Error.message}.
 */
export function getResponseErrorMessage(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const data = (error as TransportError).responseData;
  if (data == null || typeof data !== 'object') {
    return undefined;
  }

  const message = (data as { error?: unknown; errorMessage?: unknown }).error;
  if (typeof message === 'string' && message.length > 0) {
    return message;
  }

  const altMessage = (data as { errorMessage?: unknown }).errorMessage;
  if (typeof altMessage === 'string' && altMessage.length > 0) {
    return altMessage;
  }

  return undefined;
}

/**
 * Default classifier. Retries only structured transport responses whose HTTP
 * status is in {@link RETRYABLE_STATUS_CODES}.
 */
export function isRetryableTransportError(error: unknown): boolean {
  const status = getErrorStatus(error);
  return status !== undefined && RETRYABLE_STATUS_CODES.has(status);
}

export type RetryOptions = {
  /** Total number of attempts including the first call. Defaults to 3. Must be an integer >= 1. */
  attempts?: number;
  /**
   * Predicate deciding whether a thrown error is retryable. Defaults to
   * {@link isRetryableTransportError}.
   */
  retryOn?: (error: unknown) => boolean;
  /** Base delay in milliseconds for the first backoff. Defaults to 50. Must be >= 0. */
  baseDelay?: number;
  /** Upper bound for the per-attempt delay in milliseconds. Defaults to baseDelay * 16. */
  maxDelay?: number;
  /** Exponential backoff factor between attempts. Defaults to 2. Must be >= 1. */
  factor?: number;
  /** When true, full jitter is applied to each delay. Defaults to true. */
  jitter?: boolean;
  /**
   * When provided, retry aborts as soon as the signal is aborted, rethrowing
   * the latest error augmented with the abort reason.
   */
  signal?: AbortSignal;
  /**
   * Injectable sleeper for deterministic tests. Defaults to a promise
   * wrapping `setTimeout`. Tests usually pass a fake-timer-aware sleeper.
   */
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
  /**
   * Mutation safety contract. Defaults to `false`. When `false`, the
   * operation only runs once and the first error is rethrown regardless of
   * the retry classifier. Set to `true` with a documented rationale to retry
   * operations whose side effects are safe to replay (e.g. idempotent cache
   * clears).
   */
  idempotent?: boolean;
};

const defaultSleep = (ms: number, signal?: AbortSignal): Promise<void> => {
  if (ms <= 0) {
    if (signal?.aborted) {
      throw getAbortError(signal);
    }

    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(getAbortError(signal));
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(getAbortError(signal));
      },
      { once: true },
    );
  });
};

function getAbortError(signal: AbortSignal): unknown {
  const reason = signal.reason;
  return reason instanceof Error ? reason : new Error('Retry aborted', { cause: { aborted: true, reason } });
}

/**
 * Returns `error` annotated so callers can still read the abort reason. When
 * `error` is an `Error`, the abort reason is attached on `cause`; otherwise a
 * fresh `Error` wraps `error` with the abort reason on `cause`. The original
 * operation error is therefore preserved across cancellation (req 4).
 */
function withAbortCause(error: unknown, signal: AbortSignal): unknown {
  const reason = getAbortError(signal);

  if (error instanceof Error) {
    const existingCause = (error as Error & { cause?: unknown }).cause;
    const mergedCause =
      existingCause === undefined ? { cancelled: true, reason } : { cancelled: true, reason, cause: existingCause };
    return new Error(error.message, { cause: mergedCause });
  }

  return new Error('Retry aborted', { cause: { cancelled: true, reason, error } });
}

function computeDelay(attemptIndex: number, baseDelay: number, maxDelay: number, factor: number, jitter: boolean) {
  const exponential = Math.min(baseDelay * factor ** attemptIndex, maxDelay);
  if (!jitter) {
    return exponential;
  }

  return Math.floor(Math.random() * exponential);
}

function validateOptions(options: Required<Omit<RetryOptions, 'signal' | 'sleep' | 'retryOn'>> & RetryOptions) {
  const { attempts, baseDelay, maxDelay, factor } = options;

  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new RangeError(`RetryOptions.attempts must be an integer >= 1 (received ${String(attempts)})`);
  }

  if (typeof baseDelay !== 'number' || !Number.isFinite(baseDelay) || baseDelay < 0) {
    throw new RangeError(`RetryOptions.baseDelay must be a finite number >= 0 (received ${String(baseDelay)})`);
  }

  if (typeof maxDelay !== 'number' || !Number.isFinite(maxDelay) || maxDelay < 0) {
    throw new RangeError(`RetryOptions.maxDelay must be a finite number >= 0 (received ${String(maxDelay)})`);
  }

  if (typeof factor !== 'number' || !Number.isFinite(factor) || factor < 1) {
    throw new RangeError(`RetryOptions.factor must be a finite number >= 1 (received ${String(factor)})`);
  }
}

/**
 * Retry an operation using a structured transport classifier with bounded
 * exponential backoff, full jitter, and `AbortSignal` support.
 *
 * The first attempt runs unconditionally. Subsequent attempts only run when
 * {@link RetryOptions.idempotent} is `true` (or the operation declares itself
 * safe to replay) and the classifier marks the error retryable.
 */
export async function retry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const resolved: Required<Omit<RetryOptions, 'signal' | 'sleep' | 'retryOn'>> & RetryOptions = {
    attempts: 3,
    baseDelay: 50,
    maxDelay: Math.max(50 * 16, 800),
    factor: 2,
    jitter: true,
    idempotent: false,
    retryOn: isRetryableTransportError,
    sleep: defaultSleep,
    ...options,
  };

  validateOptions(resolved);

  const { attempts, baseDelay, maxDelay, factor, jitter, idempotent, retryOn, sleep, signal } = resolved;
  const classifier = retryOn ?? isRetryableTransportError;
  const sleeper = sleep ?? defaultSleep;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (signal?.aborted) {
      throw lastError !== undefined ? withAbortCause(lastError, signal) : getAbortError(signal);
    }

    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === attempts - 1;
      const canRetry = idempotent && !isLastAttempt && classifier(error);

      if (!canRetry || signal?.aborted) {
        if (signal?.aborted) {
          throw withAbortCause(error, signal);
        }
        throw error;
      }

      const delay = computeDelay(attempt, baseDelay, maxDelay, factor, jitter);

      try {
        await sleeper(delay, signal);
      } catch (sleepError) {
        if (signal?.aborted) {
          throw withAbortCause(error, signal);
        }
        throw sleepError;
      }
    }
  }

  throw lastError;
}

/**
 * Entry point for admin operations that are not explicitly classified as
 * replay-safe. It preserves retry's structured classifier and option handling,
 * but defaults to one effective attempt so mutating requests are not replayed
 * after an ambiguous transient response.
 *
 * Accepts either a legacy `attempts` count or a full {@link RetryOptions}
 * object to ease migration.
 */
export async function retryTransientAdminError<T>(
  operation: () => Promise<T>,
  attemptsOrOptions: number | RetryOptions = 3,
): Promise<T> {
  const options: RetryOptions =
    typeof attemptsOrOptions === 'number' ? { attempts: attemptsOrOptions } : attemptsOrOptions;

  return retry(operation, { ...options, idempotent: options.idempotent ?? false });
}

/**
 * Retry a read-only admin operation. Use this only for side-effect-free reads;
 * mutating requests must stay on {@link retryTransientAdminError} unless an
 * endpoint-level idempotency rationale is documented and tested.
 */
export async function retryTransientAdminReadError<T>(
  operation: () => Promise<T>,
  attemptsOrOptions: number | RetryOptions = 3,
): Promise<T> {
  const options: RetryOptions =
    typeof attemptsOrOptions === 'number' ? { attempts: attemptsOrOptions } : attemptsOrOptions;

  return retry(operation, { ...options, idempotent: true });
}
