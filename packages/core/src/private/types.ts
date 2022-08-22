/**
 * A function which when called will subscribe to the observable.
 */
export type _Subscriber<T, E> = (observerable: T, event: E) => void;
