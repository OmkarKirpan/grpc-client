import {Channel, Metadata} from '@grpc/grpc-js';
import getPort = require('get-port');
import {HelloRequest, HelloReply} from '../../fixtures/helloworld_pb';
import {GreeterService} from '../../fixtures/helloworld_grpc_pb';
import {createChannel} from '../client/channel';
import {createClient} from '../client/ClientFactory';
import {Server, ServerCredentials} from '@grpc/grpc-js';

let server: Server;
let channel: Channel;

beforeEach(async () => {
  server = new Server();
  function sayHello(call: any, callback: any) {
    var reply = new HelloReply();
    // console.log('call ', call);
    reply.setMessage(call.metadata.get('test')[0].toString());
    callback(null, reply);
  }
  server.addService(GreeterService, {sayHello: sayHello});

  const address = `localhost:${await getPort()}`;
  server.bindAsync(address, ServerCredentials.createInsecure(), () => {
    server.start();
  });

  channel = createChannel(address);
});

afterEach(async () => {
  channel.close();

  //server shutdown
  const serverShutdown = () => {
    if (server == null) {
      return;
    }
    server.tryShutdown(err => {
      if (err != null) console.log(err);
    });
  };
  serverShutdown();
});

test('all methods', async () => {
  const metadata = new Metadata();
  metadata.set('test', 'test-value');

  const client = createClient(GreeterService, channel, {
    '*': {
      metadata,
    },
  });

  await expect(client.sayHello(new HelloRequest())).resolves
    .toMatchInlineSnapshot(`
          helloworld.HelloReply {
            "message": "test-value",
          }
        `);
});

test('particular method', async () => {
  const defaultMetadata = new Metadata();
  defaultMetadata.set('test', 'test-default-value');

  const metadata = new Metadata();
  metadata.set('test', 'test-value');

  const client = createClient(GreeterService, channel, {
    '*': {
      metadata: defaultMetadata,
    },
    sayHello: {
      metadata,
    },
  });

  await expect(client.sayHello(new HelloRequest())).resolves
    .toMatchInlineSnapshot(`
          helloworld.HelloReply {
            "message": "test-value",
          }
        `);
});
