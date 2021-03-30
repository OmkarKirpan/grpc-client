export declare type EventTargetLike<T> = EventTargetLike.HasEventTargetAddRemove<T> | EventTargetLike.NodeStyleEventEmitter | EventTargetLike.NodeCompatibleEventEmitter | EventTargetLike.JQueryStyleEventEmitter<any, T>;
/**
 * Returns a promise that fulfills when an event of specific type is emitted
 * from given event target and rejects with `AbortError` once `signal` is
 * aborted.
 */
export declare function waitForEvent<T>(signal: AbortSignal, target: EventTargetLike<T>, eventName: string, options?: EventTargetLike.EventListenerOptions): Promise<T>;
export declare namespace EventTargetLike {
    interface NodeStyleEventEmitter {
        addListener: (eventName: string | symbol, handler: NodeEventHandler) => this;
        removeListener: (eventName: string | symbol, handler: NodeEventHandler) => this;
    }
    type NodeEventHandler = (...args: any[]) => void;
    interface NodeCompatibleEventEmitter {
        addListener: (eventName: string, handler: NodeEventHandler) => void | {};
        removeListener: (eventName: string, handler: NodeEventHandler) => void | {};
    }
    interface JQueryStyleEventEmitter<TContext, T> {
        on: (eventName: string, handler: (this: TContext, t: T, ...args: any[]) => any) => void;
        off: (eventName: string, handler: (this: TContext, t: T, ...args: any[]) => any) => void;
    }
    interface HasEventTargetAddRemove<E> {
        addEventListener(type: string, listener: ((evt: E) => void) | null, options?: boolean | AddEventListenerOptions): void;
        removeEventListener(type: string, listener: ((evt: E) => void) | null, options?: EventListenerOptions | boolean): void;
    }
    interface EventListenerOptions {
        capture?: boolean;
        passive?: boolean;
        once?: boolean;
    }
    interface AddEventListenerOptions extends EventListenerOptions {
        once?: boolean;
        passive?: boolean;
    }
}
