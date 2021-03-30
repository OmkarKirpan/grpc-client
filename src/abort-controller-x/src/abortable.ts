import {execute} from './execute';

/**
 * Wrap a promise to reject with `AbortError` once `signal` is aborted.
 *
 * Useful to wrap non-abortable promises.
 * Note that underlying process will NOT be aborted.
 */
export function abortable<T>(
  signal: AbortSignal,
  promise: PromiseLike<T>,
): Promise<T> {
  return execute<T>(signal, (resolve, reject) => {
    promise.then(resolve, reject);

    return () => {};
  });
}
