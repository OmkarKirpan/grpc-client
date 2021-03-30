"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = void 0;
const delay_1 = require("./delay");
const AbortError_1 = require("./AbortError");
/**
 * Retry function with exponential backoff.
 */
async function retry(signal, fn, options = {}) {
    const { baseMs = 1000, maxDelayMs = 15000, onError, maxAttempts = Infinity, } = options;
    for (let attempt = 0;; attempt++) {
        try {
            return await fn(signal, attempt);
        }
        catch (error) {
            AbortError_1.rethrowAbortError(error);
            if (attempt >= maxAttempts) {
                throw error;
            }
            // https://aws.amazon.com/ru/blogs/architecture/exponential-backoff-and-jitter/
            const backoff = Math.min(maxDelayMs, Math.pow(2, attempt) * baseMs);
            const delayMs = Math.round((backoff * (1 + Math.random())) / 2);
            if (onError) {
                onError(error, attempt, delayMs);
            }
            await delay_1.delay(signal, delayMs);
        }
    }
}
exports.retry = retry;
//# sourceMappingURL=retry.js.map