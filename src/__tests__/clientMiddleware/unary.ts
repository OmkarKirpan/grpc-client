import {Metadata, MetadataValue, status} from '@grpc/grpc-js';
import getPort = require('get-port');
import {HelloRequest, HelloReply} from '../../../fixtures/helloworld_pb';
import {GreeterService} from '../../../fixtures/helloworld_grpc_pb';
import {createChannel} from '../../client/channel';
import {createClientFactory} from '../../client/ClientFactory';
import {createTestClientMiddleware} from '../utils/testClientMiddleware';
import {Server, ServerCredentials} from '@grpc/grpc-js';

test('basic', async () => {
  const actions: any[] = [];
  let metadataValue: MetadataValue | undefined;

  let server = new Server();

  function sayHello(call: any, callback: any) {
    metadataValue = call.metadata.get('test')[0];
    var reply = new HelloReply();
    reply.setMessage(call.request.getName());
    callback(null, reply);
  }
  server.addService(GreeterService, {sayHello: sayHello});

  const address = `localhost:${await getPort()}`;
  server.bindAsync(address, ServerCredentials.createInsecure(), () => {
    server.start();
  });

  const channel = createChannel(address);
  const client = createClientFactory()
    .use(createTestClientMiddleware('testOption', actions))
    .create(GreeterService, channel);

  const metadata = new Metadata();
  metadata.set('test', 'test-metadata-value');

  await expect(
    client.sayHello(new HelloRequest().setName('test'), {
      testOption: 'test-value',
      metadata,
    }),
  ).resolves.toMatchInlineSnapshot(`
          helloworld.HelloReply {
            "message": "test",
          }
        `);

  expect(metadataValue).toMatchInlineSnapshot(`"test-metadata-value"`);

  expect(actions).toMatchInlineSnapshot(`
    Array [
      Object {
        "options": Object {
          "testOption": "test-value",
        },
        "requestStream": false,
        "responseStream": false,
        "type": "start",
      },
      Object {
        "request": helloworld.HelloRequest {
          "name": "test",
        },
        "type": "request",
      },
      Object {
        "response": helloworld.HelloReply {
          "message": "test",
        },
        "type": "response",
      },
    ]
  `);

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

test('error', async () => {
  const actions: any[] = [];

  let server = new Server();

  function sayHello(call: any, callback: any) {
    callback({
      code: status.NOT_FOUND,
      message: `${status[status.NOT_FOUND]}: ${call.request.getName()}`,
      status: status.NOT_FOUND,
    });
  }
  server.addService(GreeterService, {sayHello: sayHello});

  const address = `localhost:${await getPort()}`;
  server.bindAsync(address, ServerCredentials.createInsecure(), () => {
    server.start();
  });

  const channel = createChannel(address);
  const client = createClientFactory()
    .use(createTestClientMiddleware('testOption', actions))
    .create(GreeterService, channel);

  await expect(
    client.sayHello(new HelloRequest().setName('test'), {
      testOption: 'test-value',
    }),
  ).rejects.toMatchInlineSnapshot(
    `[ClientError: /helloworld.Greeter/SayHello NOT_FOUND: NOT_FOUND: test]`,
  );

  expect(actions).toMatchInlineSnapshot(`
    Array [
      Object {
        "options": Object {
          "testOption": "test-value",
        },
        "requestStream": false,
        "responseStream": false,
        "type": "start",
      },
      Object {
        "request": helloworld.HelloRequest {
          "name": "test",
        },
        "type": "request",
      },
      Object {
        "error": [ClientError: /helloworld.Greeter/SayHello NOT_FOUND: NOT_FOUND: test],
        "type": "error",
      },
    ]
  `);

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
