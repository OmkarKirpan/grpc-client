"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerStreamingMethod = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const abort_controller_x_1 = require("@omkarkirpan/abort-controller-x");
const node_abort_controller_1 = require("node-abort-controller");
const isAsyncIterable_1 = require("../utils/isAsyncIterable");
const readableToAsyncIterable_1 = require("../utils/readableToAsyncIterable");
const ClientError_1 = require("./ClientError");
/** @internal */
function createServerStreamingMethod(definition, client, middleware, defaultOptions) {
    async function* serverStreamingMethod(request, options) {
        if (isAsyncIterable_1.isAsyncIterable(request)) {
            throw new Error('A middleware passed invalid request to next(): expected a single message for server streaming method');
        }
        const { deadline, metadata = new grpc_js_1.Metadata(), signal = new node_abort_controller_1.default().signal, onHeader, onTrailer, } = options;
        const call = client.makeServerStreamRequest(definition.path, definition.requestSerialize, definition.responseDeserialize, request, metadata, {
            deadline,
        });
        call.on('metadata', metadata => {
            onHeader === null || onHeader === void 0 ? void 0 : onHeader(metadata);
        });
        call.on('status', status => {
            onTrailer === null || onTrailer === void 0 ? void 0 : onTrailer(status.metadata);
        });
        const abortListener = () => {
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
            signal.removeEventListener('abort', abortListener);
            abort_controller_x_1.throwIfAborted(signal);
        }
    }
    const method = middleware == null
        ? serverStreamingMethod
        : (request, options) => middleware({
            definition,
            requestStream: false,
            request,
            responseStream: true,
            next: serverStreamingMethod,
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
                            throw new Error('A middleware returned a message, but expected to return void for server streaming method');
                        }
                        break;
                    }
                }
            },
        };
    };
}
exports.createServerStreamingMethod = createServerStreamingMethod;
//# sourceMappingURL=createServerStreamingMethod.js.map