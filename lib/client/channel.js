"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForChannelReady = exports.createChannel = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const channel_1 = require("@grpc/grpc-js/build/src/channel");
function createChannel(address, credentials, options = {}) {
    const parts = address.split(/:\/\/(.*)/);
    let protocol;
    let host;
    if (parts.length === 1) {
        protocol = 'http';
        host = address;
    }
    else {
        [protocol, host] = parts;
    }
    if (protocol === 'http') {
        credentials !== null && credentials !== void 0 ? credentials : (credentials = grpc_js_1.ChannelCredentials.createInsecure());
    }
    else if (protocol === 'https') {
        credentials !== null && credentials !== void 0 ? credentials : (credentials = grpc_js_1.ChannelCredentials.createSsl());
    }
    else {
        throw new Error(`Unsupported protocol: '${protocol}'. Expected one of 'http', 'https'`);
    }
    return new grpc_js_1.Channel(host, credentials, options);
}
exports.createChannel = createChannel;
async function waitForChannelReady(channel, deadline) {
    while (true) {
        const state = channel.getConnectivityState(true);
        if (state === channel_1.ConnectivityState.READY) {
            return;
        }
        await new Promise((resolve, reject) => {
            channel.watchConnectivityState(state, deadline, err => {
                if (err != null) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
exports.waitForChannelReady = waitForChannelReady;
//# sourceMappingURL=channel.js.map