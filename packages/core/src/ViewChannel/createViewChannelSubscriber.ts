import { _callSubscriber } from '../private/subscriber';
import { ViewChannel } from './ViewChannel';
import {
  ViewChannelEvent,
  ViewChannelInitializedEvent,
  ViewChannelSubscriber,
  ViewChannelViewAutoDismissPausedEvent,
  ViewChannelViewAutoDismissPlayingEvent,
  ViewChannelViewAutoDismissStoppedEvent,
  ViewChannelViewDismissedAllEvent,
  ViewChannelViewDismissedEvent,
  ViewChannelViewPresentedEvent,
} from './types';

/**
 * The configuration for the `createViewChannelSubscriber` function.
 *
 * You should provide all methods for the events that you want to
 * listen to, the ones you are not interested
 *
 * @since 1.5.0
 */
export type CreateViewChannelSubscriberConfig<T, R> = {
  /**
   * Optionally whether or not you want to show debug logging.
   *
   * When `debug` is enabled whenever an event method is not provided
   * but the event is fired, a `console.warn` message is logged. This
   * allows you to easier detect missing methods during development.
   *
   * Defaults to `false`, meaning nothing will be logged to the console.
   *
   * @since 1.5.0
   */
  debug?: boolean;

  /**
   * Method which is called whenever an `INITIALIZED` event is fired
   * from within the ViewChannel.
   *
   * @param {ViewChannelInitializedEvent} event The event that was fired.
   * @param {ViewChannel<T, R>} viewChannel The ViewChannel the event was fired from
   * @since 1.5.0
   */
  onInitialized?: (
    event: ViewChannelInitializedEvent,
    viewChannel: ViewChannel<T, R>
  ) => void;

  /**
   * Method which is called whenever an `PRESENTED` event is fired
   * from within the ViewChannel.
   *
   * @param {ViewChannelViewPresentedEvent<T, R>} event The event that was fired.
   * @param {ViewChannel<T, R>} viewChannel The ViewChannel the event was fired from
   * @since 1.5.0
   */
  onPresented?: (
    event: ViewChannelViewPresentedEvent<T, R>,
    viewChannel: ViewChannel<T, R>
  ) => void;

  /**
   * Method which is called whenever an `DISMISSED` event is fired
   * from within the ViewChannel.
   *
   * @param {ViewChannelViewDismissedEvent<T, R>} event The event that was fired.
   * @param {ViewChannel<T, R>} viewChannel The ViewChannel the event was fired from
   * @since 1.5.0
   */
  onDismissed?: (
    event: ViewChannelViewDismissedEvent<T, R>,
    viewChannel: ViewChannel<T, R>
  ) => void;

  /**
   * Method which is called whenever an `DISMISSED_ALL` event is fired
   * from within the ViewChannel.
   *
   * @param {ViewChannelViewDismissedAllEvent<T, R>} event The event that was fired.
   * @param {ViewChannel<T, R>} viewChannel The ViewChannel the event was fired from
   * @since 1.5.0
   */
  onDismissedAll?: (
    event: ViewChannelViewDismissedAllEvent<T, R>,
    viewChannel: ViewChannel<T, R>
  ) => void;

  /**
   * Method which is called whenever an `AUTO_DISMISS_PLAYING` event is fired
   * from within the ViewChannel.
   *
   * @param {ViewChannelViewAutoDismissPlayingEvent<T, R>} event The event that was fired.
   * @param {ViewChannel<T, R>} viewChannel The ViewChannel the event was fired from
   * @since 1.5.0
   */
  onAutoDismissPlaying?: (
    event: ViewChannelViewAutoDismissPlayingEvent<T, R>,
    viewChannel: ViewChannel<T, R>
  ) => void;

  /**
   * Method which is called whenever an `AUTO_DISMISS_PAUSED` event is fired
   * from within the ViewChannel.
   *
   * @param {ViewChannelViewAutoDismissPausedEvent<T, R>} event The event that was fired.
   * @param {ViewChannel<T, R>} viewChannel The ViewChannel the event was fired from
   * @since 1.5.0
   */
  onAutoDismissPaused?: (
    event: ViewChannelViewAutoDismissPausedEvent<T, R>,
    viewChannel: ViewChannel<T, R>
  ) => void;

  /**
   * Method which is called whenever an `AUTO_DISMISS_STOPPED` event is fired
   * from within the ViewChannel.
   *
   * @param {ViewChannelViewAutoDismissStoppedEvent<T, R>} event The event that was fired.
   * @param {ViewChannel<T, R>} viewChannel The ViewChannel the event was fired from
   * @since 1.5.0
   */
  onAutoDismissStopped?: (
    event: ViewChannelViewAutoDismissStoppedEvent<T, R>,
    viewChannel: ViewChannel<T, R>
  ) => void;
};

/**
 * A function that creates an `ViewChannelSubscriber` which you can
 * provide to an `ViewChannel`, which maps all `ViewChannelEvent` to
 * methods.
 *
 * You provide `createViewChannelSubscriber` with an object with all
 * the events you want to handle as methods and it will call the
 * methods for you. This way your code will not have any switch or
 * if-statement to distinguish between events.
 *
 * For example if you wanted to handle the `DISMISSED` event, you
 * provide a method called `onDismissed` within the config. Whenever
 * the `DISMISSED` event occurs `onDismissed` will be called.
 *
 * All methods are called with two parameters: the first is the
 * `event` that occurred and the second the `ViewChannel` the event
 * occurred on.
 *
 * `createViewChannelSubscriber` should only be used when using
 * Vanilla JavaScript or TypeScript and not when using a reactive
 * framework because reactive frameworks (such as React or Vue) will
 * handle the DOM manipulation for you.
 *
 * If an event is fired that you did not provide a method for,
 * an `SubscriberMissingMethodError` error will be thrown.
 *
 * @param {CreateViewChannelSubscriberConfig<T>} config An object containing all methods you want to listen to.
 * @returns {ViewChannelSubscriber<T>} A subscriber function which can be passed to an ViewChannel.
 * @since 1.5.0
 *
 * @example
 * A. Simple example
 *
 * The example below shows what the subscriber could look like for
 * a modal channel which presents and dismisses modal windows.
 *
 * ```js
 * import {
 *   ViewChannel,
 *   createViewChannelSubscriber
 * } from 'uiloos/core';
 *
 * const subscriber = createViewChannelSubscriber({
 *   onPresented() {
 *     // Show the view here
 *   },
 *
 *   onDismissed() {
 *     // Hide the view here
 *   },
 * });
 *
 * export const modalChannel = new ViewChannel(
 *   {},
 *   subscriber
 * );
 * ```
 *
 * @example
 * B. All methods implemented
 *
 * Here is a nice example to get started which includes stub
 * implementations for all method:
 *
 * ```js
 * const subscriber = createViewChannelSubscriber({
 *   onInitialized(event, viewChannel) {
 *     console.log('onInitialized', event, viewChannel);
 *   },
 *
 *   onPresented(event, viewChannel) {
 *     console.log('onPresented', event, viewChannel);
 *   },
 *
 *   onDismissed(event, viewChannel) {
 *     console.log('onDismissed', event, viewChannel);
 *   },
 *
 *   onDismissedAll(event, viewChannel) {
 *      console.log('onDismissedAll', event, viewChannel);
 *   },
 *
 *   onAutoDismissPlaying(event, viewChannel) {
 *     console.log('onAutoDismissPlaying', event, viewChannel);
 *   },
 *
 *   onAutoDismissPaused(event, viewChannel) {
 *     console.log('onAutoDismissPaused', event, viewChannel);
 *   },
 *
 *   onAutoDismissStopped(event, viewChannel) {
 *     console.log('onAutoDismissStopped', event, viewChannel);
 *   },
 * });
 * ```
 */
export function createViewChannelSubscriber<T, R>(
  config: CreateViewChannelSubscriberConfig<T, R>
): ViewChannelSubscriber<T, R> {
  return (viewChannel: ViewChannel<T, R>, event: ViewChannelEvent<T, R>) => {
    _callSubscriber('createViewChannelSubscriber', event, viewChannel, config);
  };
}
