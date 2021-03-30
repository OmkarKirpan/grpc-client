export declare type SpawnEffects = {
    /**
     * Schedules a function to run after spawned function finishes.
     *
     * Deferred functions run serially in last-in-first-out order.
     *
     * Promise returned from `spawn` fulfills or rejects only after all deferred
     * functions finish.
     */
    defer(fn: () => void | Promise<void>): void;
    /**
     * Executes an abortable function in background.
     *
     * If a forked function throws an exception, spawned function and other forks
     * are aborted and promise returned from `spawn` rejects with that exception.
     *
     * When spawned function finishes, all forks are aborted.
     */
    fork<T>(fn: (signal: AbortSignal) => Promise<T>): ForkTask<T>;
};
export declare type ForkTask<T> = {
    /**
     * Abort a forked function.
     */
    abort(): void;
    /**
     * Returns a promise returned from a forked function.
     */
    join(): Promise<T>;
};
/**
 * Run an abortable function with `fork` and `defer` effects attached to it.
 *
 * `spawn` allows to write Go-style coroutines.
 */
export declare function spawn<T>(signal: AbortSignal, fn: (signal: AbortSignal, effects: SpawnEffects) => Promise<T>): Promise<T>;
