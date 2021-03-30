"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMetadata = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
function createMetadata(metadata) {
    if (metadata instanceof grpc_js_1.Metadata) {
        return metadata;
    }
    var meta = new grpc_js_1.Metadata();
    for (var k in metadata) {
        var v = metadata[k];
        if (typeof v !== 'string') {
            v = v.toString();
        }
        meta.add(k, v);
    }
    return meta;
}
exports.createMetadata = createMetadata;
//# sourceMappingURL=createMetadata.js.map