import {status} from '@grpc/grpc-js';
import {ClientError} from '../client/ClientError';

test('client error instanceof', () => {
  class ClientErrorFromDifferentVersion extends Error {
    constructor(
      public path: string,
      public code: status,
      public details: string,
    ) {
      super(`${status[code]}: ${details}`);

      this.name = 'ClientError';
      Object.defineProperty(this, '@@nice-grpc', {
        value: true,
      });

      Error.captureStackTrace(this, this.constructor);
    }

    static [Symbol.hasInstance](instance: unknown) {
      return (
        typeof instance === 'object' &&
        instance !== null &&
        (instance as any).name === 'ClientError' &&
        (instance as any)['@@nice-grpc'] === true
      );
    }
  }

  expect(
    new ClientErrorFromDifferentVersion('', status.UNKNOWN, '') instanceof
      ClientError,
  ).toBe(true);
});
