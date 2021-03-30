"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = void 0;
const execute_1 = require("./execute");
/**
 * Returns a promise that fulfills after delay and rejects with
 * `AbortError` once `signal` is aborted.
 *
 * The delay time is specified as a `Date` object or as an integer denoting
 * milliseconds to wait.
 */
function delay(signal, dueTime) {
    return execute_1.execute(signal, resolve => {
        const ms = typeof dueTime === 'number' ? dueTime : dueTime.getTime() - Date.now();
        const timer = setTimeout(resolve, ms);
        return () => {
            clearTimeout(timer);
        };
    });
}
exports.delay = delay;
//# sourceMappingURL=delay.js.map