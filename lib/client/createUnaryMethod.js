"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUnaryMethod = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const abort_controller_x_1 = require("@omkarkirpan/abort-controller-x");
const node_abort_controller_1 = require("node-abort-controller");
const isAsyncIterable_1 = require("../utils/isAsyncIterable");
const ClientError_1 = require("./ClientError");
/** @internal */
function createUnaryMethod(definition, client, middleware, defaultOptions) {
    async function* unaryMethod(request, options) {
        if (isAsyncIterable_1.isAsyncIterable(request)) {
            throw new Error('A middleware passed invalid request to next(): expected a single message for unary method');
        }
        const { deadline, metadata = new grpc_js_1.Metadata(), signal = new node_abort_controller_1.default().signal, onHeader, onTrailer, } = options;
        return await abort_controller_x_1.execute(signal, (resolve, reject) => {
            const call = client.makeUnaryRequest(definition.path, definition.requestSerialize, definition.responseDeserialize, request, metadata, {
                deadline,
            }, (err, response) => {
                if (err != null) {
                    reject(ClientError_1.wrapClientError(err, definition.path));
                }
                else {
                    resolve(response);
                }
            });
            call.on('metadata', metadata => {
                onHeader === null || onHeader === void 0 ? void 0 : onHeader(metadata);
            });
            call.on('status', status => {
                onTrailer === null || onTrailer === void 0 ? void 0 : onTrailer(status.metadata);
            });
            return () => {
                call.cancel();
            };
        });
    }
    const method = middleware == null
        ? unaryMethod
        : (request, options) => middleware({
            definition,
            requestStream: false,
            request,
            responseStream: false,
            next: unaryMethod,
        }, options);
    return async (request, options) => {
        const iterable = method(request, {
            ...defaultOptions,
            ...options,
        });
        const iterator = iterable[Symbol.asyncIterator]();
        const result = await iterator.next();
        if (!result.done) {
            throw new Error('A middleware yielded a message, but expected to only return a message for unary method');
        }
        if (result.value == null) {
            throw new Error('A middleware returned void, but expected to return a message for unary method');
        }
        return result.value;
    };
}
exports.createUnaryMethod = createUnaryMethod;
//# sourceMappingURL=createUnaryMethod.js.map