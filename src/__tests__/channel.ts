import getPort = require('get-port');
import {createChannel, waitForChannelReady} from '../client/channel';

test('invalid protocol', () => {
  expect(() =>
    createChannel('htttp://localhost:123'),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Unsupported protocol: 'htttp'. Expected one of 'http', 'https'"`,
  );
});

test('waitForChannelReady deadline', async () => {
  const address = `localhost:${await getPort()}`;

  const channel = createChannel(address);
  await expect(
    waitForChannelReady(channel, new Date(Date.now() + 1000)),
  ).rejects.toMatchInlineSnapshot(
    `[Error: Deadline passed without connectivity state change]`,
  );

  channel.close();
});
