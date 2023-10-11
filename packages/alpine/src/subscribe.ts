import { UnsubscribeFunction, Observable } from '@uiloos/core';

/**
 * A function which you can use to register a `data` to Alpine.js to
 * subscribe to uiloos/core components.
 *
 * @example
 * A. ActiveList tabs example
 *
 * The example below creates a list with three items:
 * a, b and c of which only one item can be active.
 * Clicking an item makes it active.
 *
 * ```js
 * import Alpine from 'alpinejs';
 * import { ActiveList } from '@uiloos/core';
 * import { subscribe } from '@uiloos/alpine';
 *
 * const activeList = new ActiveList({
 *   active: 'a',
 *   contents: ['a', 'b', 'c']
 * });
 * Alpine.data('tabs', subscribe('tabs', activeList));
 *
 * Alpine.start();
 * ```
 *
 * Now you can use the activeList in your HTML like this:
 *
 * ```html
 * <ul x-data="tabs">
 *   <template x-for="content in tabs().contents">
 *     <li @click="content.activate()">
 *       <span x-text="content.isActive ? content.value + ' active' : content.value + ' inactive'"></span>
 *     </li>
 *   </template>
 * </ul>
 * ```
 * 
 * @example
 * B. Simple typewriter example.
 * 
 * This example creates a typewriter that uses the output from the 
 * "Typewriter Composer" to create an animation from within JavaScript:
 * 
 * Note: that the "autoPlay" is disabled, otherwise the typewriter will
 * start playing when Alpine is not ready yet. In the "x-init" you 
 * should call "play()"
 * 
 * ```js
 * import Alpine from 'alpinejs';
 * import { typewriter } from '@uiloos/alpine';
 * 
 * const typewriter = new Typewriter({
 *   // Do not start playing automatically
 *   autoPlay: false,
 *   actions: [
 *     {
 *       type: 'keyboard',
 *       text: 'a',
 *       delay: 1000,
 *       cursor: 0,
 *     },
 *     {
 *       type: 'keyboard',
 *       text: 'b',
 *       delay: 1000,
 *       cursor: 0,
 *     },
 *     {
 *       type: 'keyboard',
 *       text: 'c',
 *       delay: 1000,
 *       cursor: 0,
 *     },
 *   ],
 * });
 *
 * Alpine.data('typewriter', subscribe('typewriter', typewriter));
 *
 * Alpine.start();
 * ```
 * 
 * Now you can use the typewriter in your HTML like this, do not 
 * forget call "play()" in the "x-init".
 * 
 * ```html
 * <div x-data="typewriter" x-init="typewriter().play()">
 *   <span x-text="typewriter().text"></span>
 * </div>
 * ```
 *
 * @param {string} name The name you want to expose the observable under.
 * @param {Observable<T, E>} observable The component from uiloos/core you want to subscribe to.
 * @returns A function that when called results in a Alpine.js data component
 * @since 1.4.0
 */
export function subscribe<T, E>(name: string, observable: Observable<T, E>) {
  return () => {
    let unsubscribe: UnsubscribeFunction | null = null;

    return {
      /**
       * Initializes the component
       *
       * @since 1.4.0
       */
      init() {
        unsubscribe = observable.subscribe(() => {
          this[name] = () => observable;
        });
      },

      [name]() {
        return observable;
      },

      /**
       * Destroys the component
       *
       * @since 1.4.0
       */
      destroy() {
        if (unsubscribe) {
          unsubscribe();
        }
      },
    };
  };
}
