import {HelloRequest, HelloReply} from '../../fixtures/helloworld_pb';
import {GreeterService} from '../../fixtures/helloworld_grpc_pb';
import {createChannel} from '../client/channel';
import {createClient} from '../client/ClientFactory';
import {Server, ServerCredentials} from '@grpc/grpc-js';
import {status} from '@grpc/grpc-js';
import getPort = require('get-port');

test('basic', async () => {
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
  const client = createClient(GreeterService, channel);

  await expect(client.sayHello(new HelloRequest().setName('test'))).resolves
    .toMatchInlineSnapshot(`
          helloworld.HelloReply {
            "message": "test",
          }
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
  const client = createClient(GreeterService, channel);

  await expect(
    client.sayHello(new HelloRequest().setName('test')),
  ).rejects.toMatchInlineSnapshot(
    `[ClientError: /helloworld.Greeter/SayHello NOT_FOUND: NOT_FOUND: test]`,
  );

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
