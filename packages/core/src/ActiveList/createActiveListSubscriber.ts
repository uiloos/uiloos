import { _callSubscriber } from '../private/subscriber';
import { ActiveList } from './ActiveList';
import {
  ActiveListMovedEvent,
  ActiveListInsertedEvent,
  ActiveListInitializedEvent,
  ActiveListCooldownStartedEvent,
  ActiveListCooldownEndedEvent,
  ActiveListAutoPlayStoppedEvent,
  ActiveListAutoPlayPlayingEvent,
  ActiveListAutoPlayPausedEvent,
  ActiveListActivatedMultipleEvent,
  ActiveListActivatedEvent,
  ActiveListDeactivatedMultipleEvent,
  ActiveListDeactivatedEvent,
  ActiveListSwappedEvent,
  ActiveListRemovedEvent,
  ActiveListRemovedMultipleEvent,
  ActiveListSubscriber,
  ActiveListEvent,
} from './types';

/**
 * The configuration for the `createActiveListSubscriber` function.
 *
 * You should provide all methods for the events that you want to
 * listen to, the ones you are not interested
 *
 * @since 1.5.0
 */
export type CreateActiveListSubscriberConfig<T> = {
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
   * Method which is called whenever an `MOVED` event is fired
   * from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onMoved?: (event: ActiveListMovedEvent<T>, activeList: ActiveList<T>) => void;

  /**
   * Method which is called whenever an `INSERTED` event is fired
   * from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onInserted?: (
    event: ActiveListInsertedEvent<T>,
    activeList: ActiveList<T>
  ) => void;

  /**
   * Method which is called whenever an `INITIALIZED` event is fired
   * from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onInitialized?: (
    event: ActiveListInitializedEvent<T>,
    activeList: ActiveList<T>
  ) => void;

  /**
   * Method which is called whenever an `COOLDOWN_STARTED` event is
   * fired from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onCooldownStarted?: (
    event: ActiveListCooldownStartedEvent,
    activeList: ActiveList<T>
  ) => void;

  /**
   * Method which is called whenever an `COOLDOWN_ENDED` event is
   * fired from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onCooldownEnded?: (
    event: ActiveListCooldownEndedEvent,
    activeList: ActiveList<T>
  ) => void;

  /**
   * Method which is called whenever an `AUTO_PLAY_STOPPED` event is
   * fired from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onAutoPlayStopped?: (
    event: ActiveListAutoPlayStoppedEvent,
    activeList: ActiveList<T>
  ) => void;

  /**
   * Method which is called whenever an `AUTO_PLAY_PLAYING` event is
   * fired from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onAutoPlayPlaying?: (
    event: ActiveListAutoPlayPlayingEvent,
    activeList: ActiveList<T>
  ) => void;

  /**
   * Method which is called whenever an `AUTO_PLAY_PAUSED` event is fired
   * from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onAutoPlayPaused?: (
    event: ActiveListAutoPlayPausedEvent,
    activeList: ActiveList<T>
  ) => void;

  /**
   * Method which is called whenever an `ACTIVATED_MULTIPLE` event is fired
   * from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onActivatedMultiple?: (
    event: ActiveListActivatedMultipleEvent<T>,
    activeList: ActiveList<T>
  ) => void;

  /**
   * Method which is called whenever an `ACTIVATED` event is fired
   * from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onActivated?: (
    event: ActiveListActivatedEvent<T>,
    activeList: ActiveList<T>
  ) => void;

  /**
   * Method which is called whenever an `DEACTIVATED_MULTIPLE` event is fired
   * from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onDeactivatedMultiple?: (
    event: ActiveListDeactivatedMultipleEvent<T>,
    activeList: ActiveList<T>
  ) => void;

  /**
   * Method which is called whenever an `DEACTIVATED` event is fired
   * from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onDeactivated?: (
    event: ActiveListDeactivatedEvent<T>,
    activeList: ActiveList<T>
  ) => void;

  /**
   * Method which is called whenever an `SWAPPED` event is fired
   * from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onSwapped?: (
    event: ActiveListSwappedEvent<T>,
    activeList: ActiveList<T>
  ) => void;

  /**
   * Method which is called whenever an `REMOVED` event is fired
   * from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onRemoved?: (
    event: ActiveListRemovedEvent<T>,
    activeList: ActiveList<T>
  ) => void;

  /**
   * Method which is called whenever an `REMOVED_MULTIPLE` event is fired
   * from within the ActiveList.
   *
   * @param {ActiveListMovedEvent<T>} event The event that was fired.
   * @param {ActiveList<T>} activeList The ActiveList the event was fired from
   * @since 1.5.0
   */
  onRemovedMultiple?: (
    event: ActiveListRemovedMultipleEvent<T>,
    activeList: ActiveList<T>
  ) => void;
};

/**
 * A function that creates an `ActiveListSubscriber` which you can
 * provide to an `ActiveList`, which maps all `ActiveListEvent` to
 * methods.
 *
 * You provide `createActiveListSubscriber` with an object with all
 * the events you want to handle as methods and it will call the
 * methods for you. This way your code will not have any switch or
 * if-statement to distinguish between events.
 *
 * For example if you wanted to handle the `ACTIVATED` event, you
 * provide a method called `onActivated` within the config. Whenever
 * the `ACTIVATED` event occurs `onActivated` will be called.
 *
 * All methods are called with two parameters: the first is the
 * `event` that occurred and the second the `ActiveList` the event
 * occurred on.
 *
 * `createActiveListSubscriber` should only be used when using
 * Vanilla JavaScript or TypeScript and not when using a reactive
 * framework because reactive frameworks (such as React or Vue) will
 * handle the DOM manipulation for you.
 *
 * If an event is fired that you did not provide a method for,
 * an `SubscriberMissingMethodError` error will be thrown.
 *
 * @param {CreateActiveListSubscriberConfig<T>} config An object containing all methods you want to listen to.
 * @returns {ActiveListSubscriber<T>} A subscriber function which can be passed to an ActiveList.
 * @since 1.5.0
 *
 * @example
 * A. Simple example
 *
 * The example below shows what the subscriber could look like for
 * a carousel component which has one slide active at a time.
 *
 * ```js
 * import {
 *  ActiveList,
 *  createActiveListSubscriber
 * } from "uiloos/core";
 *
 * const carouselSubscriber = createActiveListSubscriber({
 *   onActivated() {
 *     // Activate the active slide
 *     activeList.lastDeactivated.classList.remove('active');
 *
 *     // Deactivates the last activated slide
 *     activeList.lastActivated.classList.add('active');
 *   },
 * });
 *
 * const activeList = new ActiveList({
 *   // The slide div elements are the contents of the ActiveList
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
 * const subscriber = createActiveListSubscriber({
 *   onInitialized(event, activeList) {
 *     console.log('onInitialized', event, activeList);
 *   },
 *  
 *   onActivated(event, activeList) {
 *     console.log('onActivated', event, activeList);
 *   },
 * 
 *   onDeactivated(event, activeList) {
 *     console.log('onDeactivated', event, activeList);
 *   },
 * 
 *   onInserted(event, activeList) {
 *     console.log('onInserted', event, activeList);
 *   },
 * 
 *   onRemoved(event, activeList) {
 *     console.log('onRemoved', event, activeList);
 *   },
 * 
 *   onSwapped(event, activeList) {
 *     console.log('onSwapped', event, activeList);
 *   },
 *   
 *   onMoved(event, activeList) {
 *     console.log('onMoved', event, activeList);
 *   },
 * 
 *   onCooldownStarted(event, activeList) {
 *     console.log('onCooldownStarted', event, activeList);
 *   },
 * 
 *   onCooldownEnded(event, activeList) {
 *     console.log('onCooldownEnded', event, activeList);
 *   },
 * 
 *   onAutoPlayStopped(event, activeList) {
 *     console.log('onAutoPlayStopped', event, activeList);
 *   },
 * 
 *   onAutoPlayPlaying(event, activeList) {
 *     console.log('onAutoPlayPlaying', event, activeList);
 *   },
 * 
 *   onAutoPlayPaused(event, activeList) {
 *     console.log('onAutoPlayPaused', event, activeList);
 *   },
 * 
 *   onActivatedMultiple(event, activeList) {
 *     console.log('onActivatedMultiple', event, activeList);
 *   },
 *   
 *   onDeactivatedMultiple(event, activeList) {
 *     console.log('onDeactivatedMultiple', event, activeList);
 *   },
 *  
 *   onRemovedMultiple(event, activeList) {
 *     console.log('onRemovedMultiple', event, activeList);
 *   },
 * });
 * ```
 */
export function createActiveListSubscriber<T>(
  config: CreateActiveListSubscriberConfig<T>
): ActiveListSubscriber<T> {
  return (activeList: ActiveList<T>, event: ActiveListEvent<T>) => {
    _callSubscriber(
      'createActiveListSubscriber',
      event,
      activeList,
      config
    );
  };
}
