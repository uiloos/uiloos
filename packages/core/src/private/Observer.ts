import { Subscriber, UnsubscribeFunction } from '../generic/types';

export class _Observer<T, E> {
  // A listeners that need to listen to the observable
  public _subscribers: Subscriber<T, E>[] = [];

  // Listen to changes to the observable
  public _subscribe(subscriber: Subscriber<T, E>): UnsubscribeFunction {
    this._subscribers.push(subscriber);

    return () => {
      this._unsubscribe(subscriber);
    };
  }

  // Subscribe from the observable
  public _unsubscribe(subscriber: Subscriber<T, E>): void {
    this._subscribers = this._subscribers.filter((s) => subscriber !== s);
  }

  // Inform the _subscribers of changes to the observable
  public _inform(observable: T, event: E): void {
    this._subscribers.forEach((subscriber) => subscriber(observable, event));
  }
}
