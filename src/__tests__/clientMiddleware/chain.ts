import {HelloRequest, HelloReply} from '../../../fixtures/helloworld_pb';
import {GreeterService} from '../../../fixtures/helloworld_grpc_pb';
import {createChannel} from '../../client/channel';
import {createClientFactory} from '../../client/ClientFactory';
import {createTestClientMiddleware} from '../utils/testClientMiddleware';
import {Server, ServerCredentials} from '@grpc/grpc-js';
import getPort = require('get-port');

test('chain', async () => {
  const actions: any[] = [];

  let server = new Server();

  function sayHello(call: any, callback: any) {
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
    .use(createTestClientMiddleware('testOption1', actions, 'middleware-1-'))
    .use(createTestClientMiddleware('testOption2', actions, 'middleware-2-'))
    .create(GreeterService, channel);

  await expect(
    client.sayHello(new HelloRequest().setName('test'), {
      testOption1: 'test-value-1',
      testOption2: 'test-value-2',
    }),
  ).resolves.toMatchInlineSnapshot(`
          helloworld.HelloReply {
            "message": "test",
          }
        `);

  expect(actions).toMatchInlineSnapshot(`
    Array [
      Object {
        "options": Object {
          "testOption2": "test-value-2",
        },
        "requestStream": false,
        "responseStream": false,
        "type": "middleware-2-start",
      },
      Object {
        "request": helloworld.HelloRequest {
          "name": "test",
        },
        "type": "middleware-2-request",
      },
      Object {
        "options": Object {
          "testOption1": "test-value-1",
        },
        "requestStream": false,
        "responseStream": false,
        "type": "middleware-1-start",
      },
      Object {
        "request": helloworld.HelloRequest {
          "name": "test",
        },
        "type": "middleware-1-request",
      },
      Object {
        "response": helloworld.HelloReply {
          "message": "test",
        },
        "type": "middleware-1-response",
      },
      Object {
        "response": helloworld.HelloReply {
          "message": "test",
        },
        "type": "middleware-2-response",
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

test('set option from middleware', async () => {
  const actions: any[] = [];

  let server = new Server();

  function sayHello(call: any, callback: any) {
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
    .use<{testOption1: string}>(async function* middleware1(call, options) {
      const {testOption1, ...restOptions} = options;

      actions.push({type: 'middleware-1-start', options: {testOption1}});

      return yield* call.next(call.request, restOptions);
    })
    .use<{testOption2: string}>(async function* middleware1(call, options) {
      const {testOption1, testOption2, ...restOptions} = options;

      actions.push({
        type: 'middleware-2-start',
        options: {testOption1, testOption2},
      });

      return yield* call.next(call.request, {
        ...restOptions,
        testOption1: 'test-value-1-from-middleware-2',
      });
    })
    .create(GreeterService, channel);

  await expect(
    client.sayHello(new HelloRequest().setName('test'), {
      testOption1: 'test-value-1',
      testOption2: 'test-value-2',
    }),
  ).resolves.toMatchInlineSnapshot(`
          helloworld.HelloReply {
            "message": "test",
          }
        `);

  expect(actions).toMatchInlineSnapshot(`
    Array [
      Object {
        "options": Object {
          "testOption1": "test-value-1",
          "testOption2": "test-value-2",
        },
        "type": "middleware-2-start",
      },
      Object {
        "options": Object {
          "testOption1": "test-value-1-from-middleware-2",
        },
        "type": "middleware-1-start",
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
