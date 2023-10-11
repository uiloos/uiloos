/**
 * A function which when called will unsubscribe from the observable.
 *
 * @since 1.0.0
 */
export type UnsubscribeFunction = () => void;

/**
 * The interface each component of uiloos/core implements so it 
 * can be subscribed to.
 *
 * Note: there is no reason to ever implement the `Observable` 
 * interface yourself. It is only exposed so bindings to frameworks
 * can use the type.
 * 
 * @since 1.4.0
 */
export interface Observable<T, E> {
   /**
   * Subscribe to changes of the Observable. The function you provide
   * will get called whenever changes occur in the Observable.
   *
   * Returns an unsubscribe function which when called will
   * unsubscribe from the Observable.
   *
   * @param {Subscriber<T, E>} subscriber The subscriber which responds to changes in the Observable.
   * @returns {UnsubscribeFunction} A function which when called will unsubscribe from the Observable.
   *
   * @since 1.4.0
   */
  subscribe(subscriber: Subscriber<T, E>): UnsubscribeFunction;
}

/**
 * A function which when called will subscribe to the observable.
 *
 * @since 1.4.0
 */
export type Subscriber<T, E> = (observerable: T, event: E) => void;
