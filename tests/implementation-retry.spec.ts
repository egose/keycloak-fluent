import { afterEach, describe, expect, test, vi } from 'vitest';
import { getErrorStatus, isRetryableTransportError, retry, retryTransientAdminError } from '../src/utils/retry';

function transportError(status: number, message = `HTTP ${status}`) {
  return Object.assign(new Error(message), {
    response: { status },
    responseData: { error: 'unknown_error' },
  });
}

const captureTimers = () => {
  vi.useFakeTimers();
  return {
    async next(delay: number) {
      await vi.advanceTimersByTimeAsync(delay);
    },
  };
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Implementation Consistency: Retry', () => {
  test('getStatus reads response.status from structured transport errors', () => {
    expect(getErrorStatus(transportError(503))).toBe(503);
    expect(getErrorStatus(new Error('boom'))).toBeUndefined();
    expect(getErrorStatus(null)).toBeUndefined();
    expect(getErrorStatus({})).toBeUndefined();
    expect(getErrorStatus({ response: {} })).toBeUndefined();
    expect(getErrorStatus({ response: { status: '503' } })).toBeUndefined();
  });

  test('classifier retries only 429, 502, 503, 504', () => {
    for (const status of [429, 502, 503, 504]) {
      expect(isRetryableTransportError(transportError(status))).toBe(true);
    }

    for (const status of [400, 401, 403, 404, 409, 500, 505]) {
      expect(isRetryableTransportError(transportError(status))).toBe(false);
    }
  });

  test('validation and authorization failures are not retried', async () => {
    const operation = vi.fn().mockRejectedValue(transportError(401));
    await expect(retry(operation, { idempotent: true })).rejects.toThrow('HTTP 401');
    expect(operation).toHaveBeenCalledTimes(1);

    const validationOp = vi.fn().mockRejectedValue(transportError(400));
    await expect(retry(validationOp, { idempotent: true })).rejects.toThrow('HTTP 400');
    expect(validationOp).toHaveBeenCalledTimes(1);
  });

  test('an error message merely containing unknown_error is not replayed', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('unknown_error'));
    await expect(retry(operation, { idempotent: true, attempts: 3, baseDelay: 0, maxDelay: 0 })).rejects.toThrow(
      'unknown_error',
    );
    expect(operation).toHaveBeenCalledTimes(1);
  });

  test('reads retry on retryable statuses and resolve once the server recovers', async () => {
    const operation = vi.fn().mockRejectedValueOnce(transportError(503)).mockResolvedValueOnce('ok');

    await expect(retry(operation, { idempotent: true, attempts: 3, baseDelay: 0, maxDelay: 0 })).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  test('default idempotent:false means mutations never replay even if the classifier marks them retryable', async () => {
    const mutation = vi.fn().mockRejectedValue(transportError(503));
    await expect(retry(mutation, { idempotent: false, attempts: 3, baseDelay: 0, maxDelay: 0 })).rejects.toThrow(
      'HTTP 503',
    );
    expect(mutation).toHaveBeenCalledTimes(1);
  });

  test('idempotent mutations opt in and replay as documented', async () => {
    const mutation = vi.fn().mockRejectedValueOnce(transportError(503)).mockResolvedValueOnce('cleared');

    await expect(retry(mutation, { idempotent: true, attempts: 3, baseDelay: 0, maxDelay: 0 })).resolves.toBe(
      'cleared',
    );
    expect(mutation).toHaveBeenCalledTimes(2);
  });

  test('exhaustion preserves the original error and does not call the operation beyond attempts', async () => {
    const error = transportError(503);
    const operation = vi.fn().mockRejectedValue(error);

    await expect(retry(operation, { idempotent: true, attempts: 4, baseDelay: 0, maxDelay: 0 })).rejects.toBe(error);
    expect(operation).toHaveBeenCalledTimes(4);
  });

  test('invalid attempts reject before any operation runs', async () => {
    const operation = vi.fn();
    await expect(retry(operation, { attempts: 0 })).rejects.toThrow(/attempts/);
    await expect(retry(operation, { attempts: 2.5 })).rejects.toThrow(/attempts/);
    expect(operation).not.toHaveBeenCalled();
  });

  test('invalid delay and factor options reject before any operation runs', async () => {
    const operation = vi.fn();
    await expect(retry(operation, { attempts: 3, baseDelay: -1 })).rejects.toThrow(/baseDelay/);
    await expect(retry(operation, { attempts: 3, maxDelay: Number.NaN })).rejects.toThrow(/maxDelay/);
    await expect(retry(operation, { attempts: 3, factor: 0.5 })).rejects.toThrow(/factor/);
  });

  test('bounded exponential backoff with full jitter stays within [0, maxDelay]', async () => {
    const baseDelay = 100;
    const maxDelay = 400;
    const scheduled: number[] = [];
    const sleep = vi.fn().mockImplementation((ms: number) => {
      scheduled.push(ms);
      return Promise.resolve();
    });

    const operation = vi.fn().mockRejectedValue(transportError(503));
    await expect(
      retry(operation, {
        idempotent: true,
        attempts: 5,
        baseDelay,
        maxDelay,
        factor: 2,
        jitter: true,
        sleep,
      }),
    ).rejects.toThrow('HTTP 503');

    expect(scheduled).toHaveLength(4);
    for (const value of scheduled) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(maxDelay);
    }
  });

  test('jitter disabled schedules deterministic exponential delays capped by maxDelay', async () => {
    const scheduled: number[] = [];
    const sleep = vi.fn().mockImplementation((ms: number) => {
      scheduled.push(ms);
      return Promise.resolve();
    });

    const operation = vi.fn().mockRejectedValue(transportError(503));
    await expect(
      retry(operation, {
        idempotent: true,
        attempts: 5,
        baseDelay: 100,
        maxDelay: 400,
        factor: 2,
        jitter: false,
        sleep,
      }),
    ).rejects.toThrow('HTTP 503');

    expect(scheduled).toEqual([100, 200, 400, 400]);
  });

  test('cancellation via AbortSignal aborts sleeping attempts and preserves the latest error', async () => {
    const controller = new AbortController();
    const sleep = vi.fn().mockImplementation((_ms: number, signal?: AbortSignal) => {
      return new Promise<void>((_resolve, reject) => {
        signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
      });
    });

    const operation = vi.fn().mockRejectedValueOnce(transportError(503));
    const promise = retry(operation, {
      idempotent: true,
      attempts: 5,
      baseDelay: 10_000,
      maxDelay: 10_000,
      sleep,
      signal: controller.signal,
    });

    controller.abort(new Error('user cancelled'));

    const caught = await promise.catch((error) => error);
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toBe('HTTP 503');
    expect((caught as Error & { cause?: { reason?: Error } }).cause?.reason).toBeInstanceOf(Error);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  test('a pre-aborted signal throws before the first attempt and never invokes the operation', async () => {
    const controller = new AbortController();
    controller.abort();
    const operation = vi.fn();

    await expect(retry(operation, { attempts: 3, signal: controller.signal })).rejects.toThrow();
    expect(operation).not.toHaveBeenCalled();
  });

  test('injectable sleep is used and resolves with fake timers', async () => {
    const timers = captureTimers();
    const operation = vi.fn().mockRejectedValueOnce(transportError(503)).mockResolvedValueOnce('ok');

    const promise = retry(operation, {
      idempotent: true,
      attempts: 3,
      baseDelay: 100,
      maxDelay: 100,
      jitter: false,
    });
    await timers.next(100);

    await expect(promise).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  test('custom retryOn overrides the structured classifier', async () => {
    const operation = vi.fn().mockRejectedValueOnce(new Error('ephemeral')).mockResolvedValueOnce('ok');

    await expect(
      retry(operation, {
        idempotent: true,
        attempts: 3,
        baseDelay: 0,
        maxDelay: 0,
        retryOn: (error) => error instanceof Error && error.message === 'ephemeral',
      }),
    ).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  test('legacy retryTransientAdminError retries mutations by default for backward compatibility', async () => {
    const operation = vi.fn().mockRejectedValueOnce(transportError(503)).mockResolvedValueOnce('done');

    await expect(retryTransientAdminError(operation, 3)).resolves.toBe('done');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  test('legacy retryTransientAdminError accepts RetryOptions objects', async () => {
    const operation = vi.fn().mockRejectedValue(transportError(503));
    await expect(retryTransientAdminError(operation, { attempts: 2, baseDelay: 0, maxDelay: 0 })).rejects.toThrow(
      'HTTP 503',
    );
    expect(operation).toHaveBeenCalledTimes(2);
  });
});
