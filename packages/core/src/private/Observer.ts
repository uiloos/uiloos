import { UnsubscribeFunction } from '../generic/types';
import { _Subscriber } from './types';

export class _Observer<T, E> {
  // A listeners that need to listen to the observable
  public _subscribers: _Subscriber<T, E>[] = [];

  // Listen to changes to the observable
  public _subscribe(subscriber: _Subscriber<T, E>): UnsubscribeFunction {
    this._subscribers.push(subscriber);

    return () => {
      this._unsubscribe(subscriber);
    };
  }

  // Subscribe from the observable
  public _unsubscribe(subscriber: _Subscriber<T, E>): void {
    this._subscribers = this._subscribers.filter((s) => subscriber !== s);
  }

  // Inform the _subscribers of changes to the observable
  public _inform(observable: T, event: E): void {
    this._subscribers.forEach((subscriber) => subscriber(observable, event));
  }
}
