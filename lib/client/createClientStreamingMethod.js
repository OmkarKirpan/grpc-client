"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientStreamingMethod = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const abort_controller_x_1 = require("@omkarkirpan/abort-controller-x");
const node_abort_controller_1 = require("node-abort-controller");
const isAsyncIterable_1 = require("../utils/isAsyncIterable");
const patchClientWritableStream_1 = require("../utils/patchClientWritableStream");
const ClientError_1 = require("./ClientError");
/** @internal */
function createClientStreamingMethod(definition, client, middleware, defaultOptions) {
    async function* clientStreamingMethod(request, options) {
        if (!isAsyncIterable_1.isAsyncIterable(request)) {
            throw new Error('A middleware passed invalid request to next(): expected a single message for client streaming method');
        }
        const { deadline, metadata = new grpc_js_1.Metadata(), signal = new node_abort_controller_1.default().signal, onHeader, onTrailer, } = options;
        return await abort_controller_x_1.execute(signal, (resolve, reject) => {
            const pipeAbortController = new node_abort_controller_1.default();
            const call = client.makeClientStreamRequest(definition.path, definition.requestSerialize, definition.responseDeserialize, metadata, {
                deadline,
            }, (err, response) => {
                pipeAbortController.abort();
                if (err != null) {
                    reject(ClientError_1.wrapClientError(err, definition.path));
                }
                else {
                    resolve(response);
                }
            });
            patchClientWritableStream_1.patchClientWritableStream(call);
            call.on('metadata', metadata => {
                onHeader === null || onHeader === void 0 ? void 0 : onHeader(metadata);
            });
            call.on('status', status => {
                onTrailer === null || onTrailer === void 0 ? void 0 : onTrailer(status.metadata);
            });
            pipeRequest(pipeAbortController.signal, request, call).then(() => {
                call.end();
            }, err => {
                if (!abort_controller_x_1.isAbortError(err)) {
                    reject(err);
                    call.cancel();
                }
            });
            return () => {
                pipeAbortController.abort();
                call.cancel();
            };
        });
    }
    const method = middleware == null
        ? clientStreamingMethod
        : (request, options) => middleware({
            definition,
            requestStream: true,
            request,
            responseStream: false,
            next: clientStreamingMethod,
        }, options);
    return async (request, options) => {
        const iterable = method(request, {
            ...defaultOptions,
            ...options,
        });
        const iterator = iterable[Symbol.asyncIterator]();
        const result = await iterator.next();
        if (!result.done) {
            throw new Error('A middleware yielded a message, but expected to only return a message for client streaming method');
        }
        if (result.value == null) {
            throw new Error('A middleware returned void, but expected to return a message for client streaming method');
        }
        return result.value;
    };
}
exports.createClientStreamingMethod = createClientStreamingMethod;
async function pipeRequest(signal, request, call) {
    for await (const item of request) {
        abort_controller_x_1.throwIfAborted(signal);
        const shouldContinue = call.write(item);
        if (!shouldContinue) {
            await abort_controller_x_1.waitForEvent(signal, call, 'drain');
        }
    }
}
//# sourceMappingURL=createClientStreamingMethod.js.map