import {Metadata} from '@grpc/grpc-js';

export function createMetadata(metadata: any): Metadata {
  if (metadata instanceof Metadata) {
    return metadata;
  }

  var meta = new Metadata();
  for (var k in metadata) {
    var v = metadata[k];
    if (typeof v !== 'string') {
      v = v.toString();
    }
    meta.add(k, v);
  }
  return meta;
}
