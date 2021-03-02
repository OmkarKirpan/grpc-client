"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchClientWritableStream = void 0;
/**
 * Workaround for https://github.com/grpc/grpc-node/issues/1094
 *
 * @internal
 */
function patchClientWritableStream(stream) {
    const http2CallStream = stream.call.call;
    const origAttachHttp2Stream = http2CallStream.attachHttp2Stream;
    http2CallStream.attachHttp2Stream = function patchAttachHttp2Stream(stream, subchannel, extraFilterFactory) {
        const origWrite = stream.write;
        stream.write = function patchedWrite(...args) {
            if (this.writableEnded) {
                return true;
            }
            return origWrite.apply(this, args);
        };
        return origAttachHttp2Stream.call(this, stream, subchannel, extraFilterFactory);
    };
}
exports.patchClientWritableStream = patchClientWritableStream;
//# sourceMappingURL=patchClientWritableStream.js.map