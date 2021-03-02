"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = exports.createClientFactory = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const composeClientMiddleware_1 = require("./composeClientMiddleware");
const createBidiStreamingMethod_1 = require("./createBidiStreamingMethod");
const createClientStreamingMethod_1 = require("./createClientStreamingMethod");
const createServerStreamingMethod_1 = require("./createServerStreamingMethod");
const createUnaryMethod_1 = require("./createUnaryMethod");
function createClientFactory() {
    return createClientFactoryWithMiddleware();
}
exports.createClientFactory = createClientFactory;
function createClient(definition, channel, defaultCallOptions) {
    return createClientFactory().create(definition, channel, defaultCallOptions);
}
exports.createClient = createClient;
function createClientFactoryWithMiddleware(middleware) {
    return {
        use(newMiddleware) {
            return createClientFactoryWithMiddleware(middleware == null
                ? newMiddleware
                : composeClientMiddleware_1.composeClientMiddleware(middleware, newMiddleware));
        },
        create(definition, channel, defaultCallOptions = {}) {
            const grpcClient = new grpc_js_1.Client('', null, {
                channelOverride: channel,
            });
            const client = {};
            const methodEntries = Object.entries(definition);
            for (const [methodName, methodDefinition] of methodEntries) {
                const defaultOptions = {
                    ...defaultCallOptions['*'],
                    ...defaultCallOptions[methodName],
                };
                if (!methodDefinition.requestStream) {
                    if (!methodDefinition.responseStream) {
                        client[methodName] = createUnaryMethod_1.createUnaryMethod(methodDefinition, grpcClient, middleware, defaultOptions);
                    }
                    else {
                        client[methodName] = createServerStreamingMethod_1.createServerStreamingMethod(methodDefinition, grpcClient, middleware, defaultOptions);
                    }
                }
                else {
                    if (!methodDefinition.responseStream) {
                        client[methodName] = createClientStreamingMethod_1.createClientStreamingMethod(methodDefinition, grpcClient, middleware, defaultOptions);
                    }
                    else {
                        client[methodName] = createBidiStreamingMethod_1.createBidiStreamingMethod(methodDefinition, grpcClient, middleware, defaultOptions);
                    }
                }
            }
            return client;
        },
    };
}
//# sourceMappingURL=ClientFactory.js.map