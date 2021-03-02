import { Channel, ServiceDefinition } from '@grpc/grpc-js';
import { KnownKeys } from '../utils/KnownKeys';
import { CallOptions } from './CallOptions';
import { Client } from './Client';
import { ClientMiddleware } from './ClientMiddleware';
export declare type ClientFactory<CallOptionsExt = {}> = {
    use<Ext>(middleware: ClientMiddleware<Ext, CallOptionsExt>): ClientFactory<CallOptionsExt & Ext>;
    create<Service extends ServiceDefinition>(definition: Service, channel: Channel, defaultCallOptions?: DefaultCallOptions<Service, CallOptionsExt>): Client<Service, CallOptionsExt>;
};
export declare type DefaultCallOptions<Service extends ServiceDefinition, CallOptionsExt = {}> = {
    [K in KnownKeys<Service> | '*']?: CallOptions & Partial<CallOptionsExt>;
};
export declare function createClientFactory(): ClientFactory;
export declare function createClient<Service extends ServiceDefinition>(definition: Service, channel: Channel, defaultCallOptions?: DefaultCallOptions<Service>): Client<Service>;
