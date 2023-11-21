import { _callSubscriber } from '../private/subscriber';
import { DateFrame } from './DateFrame';
import {
  DateFrameSubscriber,
  DateFrameSubscriberEvent,
} from './types';

/**
 * The configuration for the `createDateFrame` function.
 *
 * You should provide all methods for the events that you want to
 * listen to, the ones you are not interested
 *
 * @since 1.6.0
 */
export type CreateDateFrameSubscriberConfig<T> = {
  /**
   * Optionally whether or not you want to show debug logging.
   *
   * When `debug` is enabled whenever an event method is not provided
   * but the event is fired, a `console.warn` message is logged. This
   * allows you to easier detect missing methods during development.
   *
   * Defaults to `false`, meaning nothing will be logged to the console.
   * 
   * @since 1.6.0
   */
  debug?: boolean;
};

/**
 * A function that creates an `DateFrameSubscriber` which you can
 * provide to an `DateFrame`, which maps all `DateFrameEvent` to
 * methods.
 *
 * You provide `createDateFrame` with an object with all
 * the events you want to handle as methods and it will call the
 * methods for you. This way your code will not have any switch or
 * if-statement to distinguish between events.
 *
 * For example if you wanted to handle the `ACTIVATED` event, you
 * provide a method called `onActivated` within the config. Whenever
 * the `ACTIVATED` event occurs `onActivated` will be called.
 *
 * All methods are called with two parameters: the first is the
 * `event` that occurred and the second the `DateFrame` the event
 * occurred on.
 *
 * `createDateFrame` should only be used when using
 * Vanilla JavaScript or TypeScript and not when using a reactive
 * framework because reactive frameworks (such as React or Vue) will
 * handle the DOM manipulation for you.
 *
 * If an event is fired that you did not provide a method for,
 * an `SubscriberMissingMethodError` error will be thrown.
 *
 * @param {CreateDateFrameSubscriberConfig<T>} config An object containing all methods you want to listen to.
 * @returns {DateFrameSubscriber<T>} A subscriber function which can be passed to an DateFrame.
 * @since 1.6.0
 *
 * @example
 * A. Simple example
 *
 * The example below shows what the subscriber could look like for
 * a carousel component which has one slide active at a time.
 *
 * ```js
 * import {
 *  DateFrame,
 *  createDateFrame
 * } from "uiloos/core";
 *
 * const carouselSubscriber = createDateFrame({
 *   onActivated() {
 *     // Activate the active slide
 *     activeList.lastDeactivated.classList.remove('active');
 *
 *     // Deactivates the last activated slide
 *     activeList.lastActivated.classList.add('active');
 *   },
 * });
 *
 * const activeList = new DateFrame({
 *   // The slide div elements are the contents of the DateFrame
 *   contents: Array.from(document.querySelectorAll('.carousel .slide'))
 * }, carouselSubscriber)
 * ```
 *
 * @example
 * B. All methods implemented
 *
 * Here is a nice example to get started which includes stub
 * implementations for all method:
 *
 * ```js
 * const subscriber = createDateFrame({
 *   // TODO fill in blanks
 * });
 * ```
 */
export function createDateFrame<T>(
  config: CreateDateFrameSubscriberConfig<T>
): DateFrameSubscriber<T> {
  return (activeList: DateFrame<T>, event: DateFrameSubscriberEvent<T>) => {
    _callSubscriber(
      'createDateFrame',
      event,
      activeList,
      config
    );
  };
}
