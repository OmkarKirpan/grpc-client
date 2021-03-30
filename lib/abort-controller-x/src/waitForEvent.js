"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForEvent = void 0;
const execute_1 = require("./execute");
/**
 * Returns a promise that fulfills when an event of specific type is emitted
 * from given event target and rejects with `AbortError` once `signal` is
 * aborted.
 */
function waitForEvent(signal, target, eventName, options) {
    return execute_1.execute(signal, resolve => {
        let unlisten;
        let finished = false;
        const handler = (...args) => {
            resolve(args.length > 1 ? args : args[0]);
            finished = true;
            if (unlisten != null) {
                unlisten();
            }
        };
        unlisten = listen(target, eventName, handler, options);
        if (finished) {
            unlisten();
        }
        return () => {
            finished = true;
            if (unlisten != null) {
                unlisten();
            }
        };
    });
}
exports.waitForEvent = waitForEvent;
function listen(target, eventName, handler, options) {
    if (isEventTarget(target)) {
        target.addEventListener(eventName, handler, options);
        return () => target.removeEventListener(eventName, handler, options);
    }
    if (isJQueryStyleEventEmitter(target)) {
        target.on(eventName, handler);
        return () => target.off(eventName, handler);
    }
    if (isNodeStyleEventEmitter(target)) {
        target.addListener(eventName, handler);
        return () => target.removeListener(eventName, handler);
    }
    throw new Error('Invalid event target');
}
function isNodeStyleEventEmitter(sourceObj) {
    return (isFunction(sourceObj.addListener) && isFunction(sourceObj.removeListener));
}
function isJQueryStyleEventEmitter(sourceObj) {
    return isFunction(sourceObj.on) && isFunction(sourceObj.off);
}
function isEventTarget(sourceObj) {
    return (isFunction(sourceObj.addEventListener) &&
        isFunction(sourceObj.removeEventListener));
}
const isFunction = (obj) => typeof obj === 'function';
//# sourceMappingURL=waitForEvent.js.map