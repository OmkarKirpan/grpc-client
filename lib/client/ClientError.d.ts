import { status } from '@grpc/grpc-js';
export declare class ClientError extends Error {
    path: string;
    code: status;
    details: string;
    constructor(path: string, code: status, details: string);
    static [Symbol.hasInstance](instance: unknown): boolean;
}
