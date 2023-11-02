import { _callSubscriber } from '../private/subscriber';
import { Typewriter } from './Typewriter';
import { TypewriterInitializedEvent, TypewriterChangedEvent, TypewriterPlayingEvent, TypewriterPausedEvent, TypewriterStoppedEvent, TypewriterFinishedEvent, TypewriterBlinkingEvent, TypewriterRepeatingEvent, TypewriterSubscriber, TypewriterEvent } from './types';

/**
 * The configuration for the `createTypewriterSubscriber` function.
 *
 * You should provide all methods for the events that you want to
 * listen to, the ones you are not interested
 *
 * @since 1.5.0
 */
export type CreateTypewriterSubscriberConfig<T> = {
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
   * from within the Typewriter.
   *
   * @param {TypewriterInitializedEvent} event The event that was fired.
   * @param {Typewriter<T>} typewriter The Typewriter the event was fired from
   * @since 1.5.0
   */
  onInitialized?: (event: TypewriterInitializedEvent, typewriter: Typewriter<T>) => void;

   /**
   * Method which is called whenever an `CHANGED` event is fired
   * from within the Typewriter.
   *
   * @param {TypewriterChangedEvent<T>} event The event that was fired.
   * @param {Typewriter<T>} typewriter The Typewriter the event was fired from
   * @since 1.5.0
   */
  onChanged?: (event: TypewriterChangedEvent<T>, typewriter: Typewriter<T>) => void;

   /**
   * Method which is called whenever an `PLAYING` event is fired
   * from within the Typewriter.
   *
   * @param {TypewriterPlayingEvent} event The event that was fired.
   * @param {Typewriter<T>} typewriter The Typewriter the event was fired from
   * @since 1.5.0
   */
  onPlaying?: (event: TypewriterPlayingEvent, typewriter: Typewriter<T>) => void;

   /**
   * Method which is called whenever an `PAUSED` event is fired
   * from within the Typewriter.
   *
   * @param {TypewriterPausedEvent} event The event that was fired.
   * @param {Typewriter<T>} typewriter The Typewriter the event was fired from
   * @since 1.5.0
   */
  onPaused?: (event: TypewriterPausedEvent, typewriter: Typewriter<T>) => void;

   /**
   * Method which is called whenever an `STOPPED` event is fired
   * from within the Typewriter.
   *
   * @param {TypewriterStoppedEvent} event The event that was fired.
   * @param {Typewriter<T>} typewriter The Typewriter the event was fired from
   * @since 1.5.0
   */
  onStopped?: (event: TypewriterStoppedEvent, typewriter: Typewriter<T>) => void;

   /**
   * Method which is called whenever an `FINISHED` event is fired
   * from within the Typewriter.
   *
   * @param {TypewriterFinishedEvent<T>} event The event that was fired.
   * @param {Typewriter<T>} typewriter The Typewriter the event was fired from
   * @since 1.5.0
   */
  onFinished?: (event: TypewriterFinishedEvent<T>, typewriter: Typewriter<T>) => void;

   /**
   * Method which is called whenever an `BLINKING` event is fired
   * from within the Typewriter.
   *
   * @param {TypewriterBlinkingEvent<T>} event The event that was fired.
   * @param {Typewriter<T>} typewriter The Typewriter the event was fired from
   * @since 1.5.0
   */
  onBlinking?: (event: TypewriterBlinkingEvent<T>, typewriter: Typewriter<T>) => void;

   /**
   * Method which is called whenever an `REPEATING` event is fired
   * from within the Typewriter.
   *
   * @param {TypewriterRepeatingEvent<T>} event The event that was fired.
   * @param {Typewriter<T>} typewriter The Typewriter the event was fired from
   * @since 1.5.0
   */
  onRepeating?: (event: TypewriterRepeatingEvent<T>, typewriter: Typewriter<T>) => void;
};

/**
 * A function that creates an `TypewriterSubscriber` which you can
 * provide to an `Typewriter`, which maps all `TypewriterEvent` to
 * methods.
 *
 * You provide `createTypewriterSubscriber` with an object with all
 * the events you want to handle as methods and it will call the
 * methods for you. This way your code will not have any switch or
 * if-statement to distinguish between events.
 *
 * For example if you wanted to handle the `CHANGED` event, you
 * provide a method called `onChanged` within the config. Whenever
 * the `CHANGED` event occurs `onChanged` will be called.
 *
 * All methods are called with two parameters: the first is the
 * `event` that occurred and the second the `Typewriter` the event
 * occurred on.
 *
 * `createTypewriterSubscriber` should only be used when using
 * Vanilla JavaScript or TypeScript and not when using a reactive
 * framework because reactive frameworks (such as Angular or Svelte) will
 * handle the DOM manipulation for you.
 *
 * If an event is fired that you did not provide a method for,
 * an `SubscriberMissingMethodError` error will be thrown.
 *
 * @param {CreateTypewriterSubscriberConfig<T>} config An object containing all methods you want to listen to.
 * @returns {TypewriterSubscriber<T>} A subscriber function which can be passed to an Typewriter.
 * @since 1.5.0
 *
 * @example
 * A. Simple example
 *
 * The example below shows what the subscriber could look like for
 * a typewriter which only listens to the 'CHANGED' event:
 *
 * ```js
 * import {
 *  Typewriter,
 *  createTypewriterSubscriber
 * } from "uiloos/core";
 * 
 * const subscriber = createTypewriterSubscriber({
 *   onChanged() {
 *     const typewriterEl = document.getElementById('typewriter');
 *     typewriterEl.textContent = typewriter.text;
 *   }
 * });
 * 
 * const typewriter = new Typewriter({
 *   repeat: true,
 *   repeatDelay: 1000,
 *   autoPlay: false,
 *   actions: [
 *     {
 *       type: 'keyboard',
 *       cursor: 0,
 *       text: 'H',
 *       delay: 150,
 *     },
 *     {
 *       type: 'keyboard',
 *       cursor: 0,
 *       text: 'e',
 *       delay: 132,
 *     },
 *     {
 *       type: 'keyboard',
 *       cursor: 0,
 *       text: 'y',
 *       delay: 84,
 *     },
 *   ],
 * }, subscriber);
 * ```
 *
 * @example
 * B. All methods implemented
 *
 * Here is a nice example to get started which includes stub
 * implementations for all method:
 *
 * ```js
 * const subscriber = createTypewriterSubscriber({
 *   onInitialized(event, typewriter) {
 *     console.log('onInitialized', event, typewriter);
 *   },
 *
 *   onChanged(event, typewriter) {
 *     console.log('onChanged', event, typewriter);
 *   },
 *
 *   onPlaying(event, typewriter) {
 *     console.log('onPlaying', event, typewriter);
 *   },
 *
 *   onPaused(event, typewriter) {
 *     console.log('onPaused', event, typewriter);
 *   },
 *
 *   onStopped(event, typewriter) {
 *     console.log('onStopped', event, typewriter);
 *   },
 *
 *   onFinished(event, typewriter) {
 *     console.log('onFinished', event, typewriter);
 *   },
 * 
 *   onBlinking(event, typewriter) {
 *     console.log('onBlinking', event, typewriter);
 *   },
 *  
 *   onRepeating(event, typewriter) {
 *     console.log('onRepeating', event, typewriter);
 *   }
 * });
 * ```
 */
export function createTypewriterSubscriber<T>(
  config: CreateTypewriterSubscriberConfig<T>
): TypewriterSubscriber<T> {
  return (typewriter: Typewriter<T>, event: TypewriterEvent<T>) => {
    _callSubscriber(
      'createTypewriterSubscriber',
      event,
      typewriter,
      config
    );
  };
}
