import { _callSubscriber } from '../private/subscriber';
import { DateGallery } from './DateGallery';
import {
  DateGalleryDateDeselectedEvent,
  DateGalleryDateDeselectedMultipleEvent,
  DateGalleryDateSelectedEvent,
  DateGalleryDateSelectedMultipleEvent,
  DateGalleryEventAddedEvent,
  DateGalleryEventMovedEvent,
  DateGalleryEventRemovedEvent,
  DateGalleryFrameChangedEvent,
  DateGalleryInitializedEvent,
  DateGalleryModeChangedEvent,
  DateGallerySubscriber,
  DateGallerySubscriberEvent,
  DateGalleryEventDataChangedEvent
} from './types';

/**
 * The configuration for the `createDateGallery` function.
 *
 * You should provide all methods for the events that you want to
 * listen to, the ones you are not interested
 *
 * @since 1.6.0
 */
export type CreateDateGallerySubscriberConfig<T> = {
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

  /**
   * Method which is called whenever an `INITIALIZED` event is fired
   * from within the DateGallery.
   *
   * @param {DateGalleryInitializedEvent} event The event that was fired.
   * @param {DateGallery<T>} dateGallery The DateGallery the event was fired from
   * @since 1.6.0
   */
  onInitialized?: (event: DateGalleryInitializedEvent, dateGallery: DateGallery<T>) => void;

  /**
   * Method which is called whenever an `FRAME_CHANGED` event is fired
   * from within the DateGallery.
   *
   * @param {DateGalleryFrameChangedEvent<T>} event The event that was fired.
   * @param {DateGallery<T>} dateGallery The DateGallery the event was fired from
   * @since 1.6.0
   */
  onFrameChanged?: (event: DateGalleryFrameChangedEvent<T>, dateGallery: DateGallery<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateGallery.
   *
   * @param {DateGalleryModeChangedEvent<T>} event The event that was fired.
   * @param {DateGallery<T>} dateGallery The DateGallery the event was fired from
   * @since 1.6.0
   */
  onModeChanged?: (event: DateGalleryModeChangedEvent<T>, dateGallery: DateGallery<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateGallery.
   *
   * @param {DateGalleryDateSelectedEvent} event The event that was fired.
   * @param {DateGallery<T>} dateGallery The DateGallery the event was fired from
   * @since 1.6.0
   */
  onDateSelected?: (event: DateGalleryDateSelectedEvent, dateGallery: DateGallery<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateGallery.
   *
   * @param {DateGalleryDateSelectedMultipleEvent} event The event that was fired.
   * @param {DateGallery<T>} dateGallery The DateGallery the event was fired from
   * @since 1.6.0
   */
  onDateSelectedMultiple?: (event: DateGalleryDateSelectedMultipleEvent, dateGallery: DateGallery<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateGallery.
   *
   * @param {DateGalleryDateDeselectedEvent} event The event that was fired.
   * @param {DateGallery<T>} dateGallery The DateGallery the event was fired from
   * @since 1.6.0
   */
  onDateDeselected?: (event: DateGalleryDateDeselectedEvent, dateGallery: DateGallery<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateGallery.
   *
   * @param {DateGalleryDateDeselectedMultipleEvent} event The event that was fired.
   * @param {DateGallery<T>} dateGallery The DateGallery the event was fired from
   * @since 1.6.0
   */
  onDateDeselectedMultiple?: (event: DateGalleryDateDeselectedMultipleEvent, dateGallery: DateGallery<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateGallery.
   *
   * @param {DateGalleryEventAddedEvent<T>} event The event that was fired.
   * @param {DateGallery<T>} dateGallery The DateGallery the event was fired from
   * @since 1.6.0
   */
  onEventAdded?: (event: DateGalleryEventAddedEvent<T>, dateGallery: DateGallery<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateGallery.
   *
   * @param {DateGalleryEventRemovedEvent<T>} event The event that was fired.
   * @param {DateGallery<T>} dateGallery The DateGallery the event was fired from
   * @since 1.6.0
   */
  onEventRemoved?: (event: DateGalleryEventRemovedEvent<T>, dateGallery: DateGallery<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateGallery.
   *
   * @param {DateGalleryEventMovedEvent<T>} event The event that was fired.
   * @param {DateGallery<T>} dateGallery The DateGallery the event was fired from
   * @since 1.6.0
   */
  onEventMoved?: (event: DateGalleryEventMovedEvent<T>, dateGallery: DateGallery<T>) => void;

  /**
   * Method which is called whenever an `EVENT_DATA_CHANGED` event is fired
   * from within the DateGallery.
   *
   * @param {DateGalleryEventDataChangedEvent<T>} event The event that was fired.
   * @param {DateGallery<T>} dateGallery The DateGallery the event was fired from
   * @since 1.6.0
   */
  onEventDataChanged?: (event: DateGalleryEventDataChangedEvent<T>, dateGallery: DateGallery<T>) => void;
};

/**
 * A function that creates an `DateGallerySubscriber` which you can
 * provide to an `DateGallery`, which maps all `DateGalleryEvent` to
 * methods.
 *
 * You provide `createDateGallery` with an object with all the events 
 * you want to handle as methods and it will call the methods for you. 
 * This way your code will not have any switch or if-statement to 
 * distinguish between events.
 *
 * For example if you wanted to handle the `FRAME_CHANGED` event, you
 * provide a method called `onFrameChanged` within the config.
 * Whenever the `FRAME_CHANGED` event occurs `onFrameChanged` will be 
 * called.
 *
 * All methods are called with two parameters: the first is the
 * `event` that occurred and the second the `DateGallery` the event
 * occurred on.
 *
 * `createDateGallery` should only be used when using
 * Vanilla JavaScript or TypeScript and not when using a reactive
 * framework because reactive frameworks (such as React or Vue) will
 * handle the DOM manipulation for you.
 *
 * If an event is fired that you did not provide a method for,
 * an `SubscriberMissingMethodError` error will be thrown.
 *
 * @param {createDateGallerySubscriberConfig} config An object containing all methods you want to listen to.
 * @returns {DateGallerySubscriber<T>} A subscriber function which can be passed to an DateGallery.
 * @since 1.6.0
 *
 * @example
 * A. Simple example
 *
 * TODO
 *
 * @example
 * B. All methods implemented
 *
 * Here is a nice example to get started which includes stub
 * implementations for all method:
 *
 * ```js
 * const subscriber = createDateGallery({
 *   onInitialized(event, dateGallery) {
 *     console.log('onInitialized', event, dateGallery)
 *   },
 * 
 *   onFrameChanged(event, dateGallery) {
 *     console.log('onFrameChanged', event, dateGallery)
 *   },
 * 
 *   onModeChanged(event, dateGallery) {
 *     console.log('onModeChanged', event, dateGallery)
 *   },
 * 
 *   onDateSelected(event, dateGallery) {
 *     console.log('onDateSelected', event, dateGallery)
 *   },
 * 
 *   onDateSelectedMultiple(event, dateGallery) {
 *     console.log('onDateSelectedMultiple', event, dateGallery)
 *   },
 * 
 *   onDateDeselected(event, dateGallery) {
 *     console.log('onDateDeselected', event, dateGallery)
 *   },
 * 
 *   onDateDeselectedMultiple(event, dateGallery) {
 *     console.log('onDateDeselectedMultiple', event, dateGallery)
 *   },
 * 
 *   onEventAdded(event, dateGallery) {
 *     console.log('onEventAdded', event, dateGallery)
 *   },
 * 
 *   onEventRemoved(event, dateGallery) {
 *     console.log('onEventRemoved', event, dateGallery)
 *   },
 * 
 *   onEventMoved(event, dateGallery) {
 *     console.log('onEventMoved', event, dateGallery)
 *   },
 * 
 *   onEventDataChanged(event, dateGallery) {
 *     console.log('onEventDataChanged', event, dateGallery)
 *   },
 * });
 * ```
 */
export function createDateGallerySubscriber<T>(
  config: CreateDateGallerySubscriberConfig<T>
): DateGallerySubscriber<T> {
  return (activeList: DateGallery<T>, event: DateGallerySubscriberEvent<T>) => {
    _callSubscriber(
      'createDateGallerySubscriber',
      event,
      activeList,
      config
    );
  };
}
