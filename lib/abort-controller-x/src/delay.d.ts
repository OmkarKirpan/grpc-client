/**
 * Returns a promise that fulfills after delay and rejects with
 * `AbortError` once `signal` is aborted.
 *
 * The delay time is specified as a `Date` object or as an integer denoting
 * milliseconds to wait.
 */
export declare function delay(signal: AbortSignal, dueTime: number | Date): Promise<void>;
