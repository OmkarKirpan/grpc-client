"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapClientError = exports.ClientError = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
class ClientError extends Error {
    constructor(path, code, details) {
        super(`${path} ${grpc_js_1.status[code]}: ${details}`);
        this.path = path;
        this.code = code;
        this.details = details;
        this.name = 'ClientError';
        Object.defineProperty(this, '@@nice-grpc', {
            value: true,
        });
        Error.captureStackTrace(this, this.constructor);
    }
    static [Symbol.hasInstance](instance) {
        // allow instances of ClientError from different versions of nice-grpc
        // to work with `instanceof ClientError`
        return (typeof instance === 'object' &&
            instance !== null &&
            instance.name === 'ClientError' &&
            instance['@@nice-grpc'] === true);
    }
}
exports.ClientError = ClientError;
/** @internal */
function wrapClientError(error, path) {
    if (isStatusObject(error)) {
        return new ClientError(path, error.code, error.details);
    }
    return error;
}
exports.wrapClientError = wrapClientError;
function isStatusObject(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        typeof obj.code === 'number' &&
        typeof obj.details === 'string' &&
        obj.metadata instanceof grpc_js_1.Metadata);
}
//# sourceMappingURL=ClientError.js.map