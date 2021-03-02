import { MethodDefinition } from '@grpc/grpc-js';
import { CallOptions } from './CallOptions';
export declare type ClientMiddleware<CallOptionsExt = {}, RequiredCallOptionsExt = {}> = <Request, Response>(call: ClientMiddlewareCall<Request, Response, RequiredCallOptionsExt>, options: CallOptions & Partial<CallOptionsExt & RequiredCallOptionsExt>) => AsyncGenerator<Response, Response | void, undefined>;
export declare type ClientMiddlewareCall<Request, Response, NextCallOptionsExt = {}> = {
    definition: MethodDefinition<Request, Response>;
} & ClientMiddlewareCallRequest<Request> & ClientMiddlewareCallResponse<Request, Response, NextCallOptionsExt>;
export declare type ClientMiddlewareCallRequest<Request> = {
    requestStream: false;
    request: Request;
} | {
    requestStream: true;
    request: AsyncIterable<Request>;
};
export declare type ClientMiddlewareCallResponse<Request, Response, NextCallOptionsExt> = {
    responseStream: false;
    next(request: Request | AsyncIterable<Request>, options: CallOptions & Partial<NextCallOptionsExt>): AsyncGenerator<never, Response, undefined>;
} | {
    responseStream: true;
    next(request: Request | AsyncIterable<Request>, options: CallOptions & Partial<NextCallOptionsExt>): AsyncGenerator<Response, void, undefined>;
};
