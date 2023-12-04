import { _callSubscriber } from '../private/subscriber';
import { DateFrame } from './DateFrame';
import {
  DateFrameDateDeselectedEvent,
  DateFrameDateDeselectedMultipleEvent,
  DateFrameDateSelectedEvent,
  DateFrameDateSelectedMultipleEvent,
  DateFrameEventAddedEvent,
  DateFrameEventMovedEvent,
  DateFrameEventRemovedEvent,
  DateFrameFrameChangedEvent,
  DateFrameInitializedEvent,
  DateFrameModeChangedEvent,
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

  /**
   * Method which is called whenever an `INITIALIZED` event is fired
   * from within the DateFrame.
   *
   * @param {DateFrameInitializedEvent} event The event that was fired.
   * @param {DateFrame<T>} dateFrame The DateFrame the event was fired from
   * @since 1.6.0
   */
  onInitialized?: (event: DateFrameInitializedEvent, dateFrame: DateFrame<T>) => void;

  /**
   * Method which is called whenever an `FRAME_CHANGED` event is fired
   * from within the DateFrame.
   *
   * @param {DateFrameFrameChangedEvent<T>} event The event that was fired.
   * @param {DateFrame<T>} dateFrame The DateFrame the event was fired from
   * @since 1.6.0
   */
  onFrameChanged?: (event: DateFrameFrameChangedEvent<T>, dateFrame: DateFrame<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateFrame.
   *
   * @param {DateFrameModeChangedEvent<T>} event The event that was fired.
   * @param {DateFrame<T>} dateFrame The DateFrame the event was fired from
   * @since 1.6.0
   */
  onModeChanged?: (event: DateFrameModeChangedEvent<T>, dateFrame: DateFrame<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateFrame.
   *
   * @param {DateFrameDateSelectedEvent} event The event that was fired.
   * @param {DateFrame<T>} dateFrame The DateFrame the event was fired from
   * @since 1.6.0
   */
  onDateSelected?: (event: DateFrameDateSelectedEvent, dateFrame: DateFrame<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateFrame.
   *
   * @param {DateFrameDateSelectedMultipleEvent} event The event that was fired.
   * @param {DateFrame<T>} dateFrame The DateFrame the event was fired from
   * @since 1.6.0
   */
  onDateSelectedMultiple?: (event: DateFrameDateSelectedMultipleEvent, dateFrame: DateFrame<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateFrame.
   *
   * @param {DateFrameDateDeselectedEvent} event The event that was fired.
   * @param {DateFrame<T>} dateFrame The DateFrame the event was fired from
   * @since 1.6.0
   */
  onDateDeselected?: (event: DateFrameDateDeselectedEvent, dateFrame: DateFrame<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateFrame.
   *
   * @param {DateFrameDateDeselectedMultipleEvent} event The event that was fired.
   * @param {DateFrame<T>} dateFrame The DateFrame the event was fired from
   * @since 1.6.0
   */
  onDateDeselectedMultiple?: (event: DateFrameDateDeselectedMultipleEvent, dateFrame: DateFrame<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateFrame.
   *
   * @param {DateFrameEventAddedEvent<T>} event The event that was fired.
   * @param {DateFrame<T>} dateFrame The DateFrame the event was fired from
   * @since 1.6.0
   */
  onEventAdded?: (event: DateFrameEventAddedEvent<T>, dateFrame: DateFrame<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateFrame.
   *
   * @param {DateFrameEventRemovedEvent<T>} event The event that was fired.
   * @param {DateFrame<T>} dateFrame The DateFrame the event was fired from
   * @since 1.6.0
   */
  onEventRemoved?: (event: DateFrameEventRemovedEvent<T>, dateFrame: DateFrame<T>) => void;
  
  /**
   * Method which is called whenever an `MOVED` event is fired
   * from within the DateFrame.
   *
   * @param {DateFrameEventMovedEvent<T>} event The event that was fired.
   * @param {DateFrame<T>} dateFrame The DateFrame the event was fired from
   * @since 1.6.0
   */
  onEventMoved?: (event: DateFrameEventMovedEvent<T>, dateFrame: DateFrame<T>) => void;
};

/**
 * A function that creates an `DateFrameSubscriber` which you can
 * provide to an `DateFrame`, which maps all `DateFrameEvent` to
 * methods.
 *
 * You provide `createDateFrame` with an object with all the events 
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
 * @param {CreateDateFrameSubscriberConfig} config An object containing all methods you want to listen to.
 * @returns {DateFrameSubscriber<T>} A subscriber function which can be passed to an DateFrame.
 * @since 1.6.0
 *
 * @example
 * A. Simple example
 *
 * TODO
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
 *   onInitialized(event, dateFrame) {
 *     console.log('onInitialized', event, dateFrame)
 *   },
 * 
 *   onFrameChanged(event, dateFrame) {
 *     console.log('onFrameChanged', event, dateFrame)
 *   },
 * 
 *   onModeChanged(event, dateFrame) {
 *     console.log('onModeChanged', event, dateFrame)
 *   },
 * 
 *   onDateSelected(event, dateFrame) {
 *     console.log('onDateSelected', event, dateFrame)
 *   },
 * 
 *   onDateSelectedMultiple(event, dateFrame) {
 *     console.log('onDateSelectedMultiple', event, dateFrame)
 *   },
 * 
 *   onDateDeselected(event, dateFrame) {
 *     console.log('onDateDeselected', event, dateFrame)
 *   },
 * 
 *   onDateDeselectedMultiple(event, dateFrame) {
 *     console.log('onDateDeselectedMultiple', event, dateFrame)
 *   },
 * 
 *   onEventAdded(event, dateFrame) {
 *     console.log('onEventAdded', event, dateFrame)
 *   },
 * 
 *   onEventRemoved(event, dateFrame) {
 *     console.log('onEventRemoved', event, dateFrame)
 *   },
 * 
 *   onEventMoved(event, dateFrame) {
 *     console.log('onEventMoved', event, dateFrame)
 *   },
 * });
 * ```
 */
export function createDateFrameSubscriber<T>(
  config: CreateDateFrameSubscriberConfig<T>
): DateFrameSubscriber<T> {
  return (activeList: DateFrame<T>, event: DateFrameSubscriberEvent<T>) => {
    _callSubscriber(
      'createDateFrameSubscriber',
      event,
      activeList,
      config
    );
  };
}
