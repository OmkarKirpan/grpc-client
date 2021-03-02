"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBidiStreamingMethod = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const abort_controller_x_1 = require("@omkarkirpan/abort-controller-x");
const node_abort_controller_1 = require("node-abort-controller");
const isAsyncIterable_1 = require("../utils/isAsyncIterable");
const patchClientWritableStream_1 = require("../utils/patchClientWritableStream");
const readableToAsyncIterable_1 = require("../utils/readableToAsyncIterable");
const ClientError_1 = require("./ClientError");
/** @internal */
function createBidiStreamingMethod(definition, client, middleware, defaultOptions) {
    async function* bidiStreamingMethod(request, options) {
        if (!isAsyncIterable_1.isAsyncIterable(request)) {
            throw new Error('A middleware passed invalid request to next(): expected a single message for bidirectional streaming method');
        }
        const { deadline, metadata = new grpc_js_1.Metadata(), signal = new node_abort_controller_1.default().signal, onHeader, onTrailer, } = options;
        const pipeAbortController = new node_abort_controller_1.default();
        const call = client.makeBidiStreamRequest(definition.path, definition.requestSerialize, definition.responseDeserialize, metadata, {
            deadline,
        });
        patchClientWritableStream_1.patchClientWritableStream(call);
        call.on('metadata', metadata => {
            onHeader === null || onHeader === void 0 ? void 0 : onHeader(metadata);
        });
        call.on('status', status => {
            onTrailer === null || onTrailer === void 0 ? void 0 : onTrailer(status.metadata);
        });
        let pipeError;
        pipeRequest(pipeAbortController.signal, request, call).then(() => {
            call.end();
        }, err => {
            if (!abort_controller_x_1.isAbortError(err)) {
                pipeError = err;
                call.cancel();
            }
        });
        const abortListener = () => {
            pipeAbortController.abort();
            call.cancel();
        };
        signal.addEventListener('abort', abortListener);
        try {
            yield* readableToAsyncIterable_1.readableToAsyncIterable(call);
        }
        catch (err) {
            throw ClientError_1.wrapClientError(err, definition.path);
        }
        finally {
            pipeAbortController.abort();
            signal.removeEventListener('abort', abortListener);
            abort_controller_x_1.throwIfAborted(signal);
            if (pipeError) {
                throw pipeError;
            }
        }
    }
    const method = middleware == null
        ? bidiStreamingMethod
        : (request, options) => middleware({
            definition,
            requestStream: true,
            request,
            responseStream: true,
            next: bidiStreamingMethod,
        }, options);
    return (request, options) => {
        const iterable = method(request, {
            ...defaultOptions,
            ...options,
        });
        const iterator = iterable[Symbol.asyncIterator]();
        return {
            async *[Symbol.asyncIterator]() {
                while (true) {
                    const result = await iterator.next();
                    if (!result.done) {
                        yield result.value;
                    }
                    else {
                        if (result.value != null) {
                            throw new Error('A middleware returned a message, but expected to return void for bidirectional streaming method');
                        }
                        break;
                    }
                }
            },
        };
    };
}
exports.createBidiStreamingMethod = createBidiStreamingMethod;
async function pipeRequest(signal, request, call) {
    for await (const item of request) {
        abort_controller_x_1.throwIfAborted(signal);
        const shouldContinue = call.write(item);
        if (!shouldContinue) {
            await abort_controller_x_1.waitForEvent(signal, call, 'drain');
        }
    }
}
//# sourceMappingURL=createBidiStreamingMethod.js.map