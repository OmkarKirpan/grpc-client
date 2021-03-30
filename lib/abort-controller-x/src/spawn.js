"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawn = void 0;
const node_abort_controller_1 = require("node-abort-controller");
const AbortError_1 = require("./AbortError");
/**
 * Run an abortable function with `fork` and `defer` effects attached to it.
 *
 * `spawn` allows to write Go-style coroutines.
 */
function spawn(signal, fn) {
    if (signal.aborted) {
        return Promise.reject(new AbortError_1.AbortError());
    }
    const deferredFunctions = [];
    /**
     * Aborted when spawned function finishes
     * or one of forked functions throws
     * or parent signal aborted.
     */
    const spawnAbortController = new node_abort_controller_1.default();
    const spawnSignal = spawnAbortController.signal;
    const abortSpawn = () => {
        spawnAbortController.abort();
    };
    signal.addEventListener('abort', abortSpawn);
    const removeAbortListener = () => {
        signal.removeEventListener('abort', abortSpawn);
    };
    const tasks = new Set();
    const abortTasks = () => {
        for (const task of tasks) {
            task.abort();
        }
    };
    spawnSignal.addEventListener('abort', abortTasks);
    const removeSpawnAbortListener = () => {
        spawnSignal.removeEventListener('abort', abortTasks);
    };
    let promise = new Promise((resolve, reject) => {
        let result;
        let failure;
        fork(signal => fn(signal, {
            defer(fn) {
                deferredFunctions.push(fn);
            },
            fork,
        }))
            .join()
            .then(value => {
            spawnAbortController.abort();
            result = { value };
        }, error => {
            spawnAbortController.abort();
            if (!AbortError_1.isAbortError(error) || failure == null) {
                failure = { error };
            }
        });
        function fork(forkFn) {
            if (spawnSignal.aborted) {
                // return already aborted task
                return {
                    abort() { },
                    async join() {
                        throw new AbortError_1.AbortError();
                    },
                };
            }
            const taskAbortController = new node_abort_controller_1.default();
            const taskSignal = taskAbortController.signal;
            const taskPromise = forkFn(taskSignal);
            const task = {
                abort() {
                    taskAbortController.abort();
                },
                join: () => taskPromise,
            };
            tasks.add(task);
            taskPromise
                .catch(AbortError_1.catchAbortError)
                .catch(error => {
                failure = { error };
                // error in forked function
                spawnAbortController.abort();
            })
                .finally(() => {
                tasks.delete(task);
                if (tasks.size === 0) {
                    if (failure != null) {
                        reject(failure.error);
                    }
                    else {
                        resolve(result.value);
                    }
                }
            });
            return task;
        }
    });
    promise = promise.finally(() => {
        removeAbortListener();
        removeSpawnAbortListener();
        let deferPromise = Promise.resolve();
        for (let i = deferredFunctions.length - 1; i >= 0; i--) {
            deferPromise = deferPromise.finally(deferredFunctions[i]);
        }
        return deferPromise;
    });
    return promise;
}
exports.spawn = spawn;
//# sourceMappingURL=spawn.js.map