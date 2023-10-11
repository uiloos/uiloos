import {
  Typewriter,
  TypewriterConfig
} from '@uiloos/core';
import { subscribe } from './subscribe';

/**
 * The configuration for the typewriter Alpine.js component.
 *
 * It has all properties the TypewriterConfig has from core, plus an
 * optional `alpine` configuration object which allows you to set the
 * name for the exposed Typewriter.
 *
 * @since 1.4.0
 */
export type AlpineTypewriterConfig<T> = TypewriterConfig<T> & {
  /**
   * Additional alpine only configuration for the Typewriter.
   *
   * @since 1.4.0
   */
  alpine?: {
    /**
     * The method name you want to expose the `Typewriter` under.
     *
     * Useful when having more than one typewriter animation on the
     * page, so you can distinguish between them more easily.
     *
     * Say for example you set it to `"home"`: in the HTML you now use
     * `home().text`.
     *
     * Defaults to 'typewriter'.
     * 
     * @since 1.4.0
     */
    name?: string;
  };
};

/**
 * A function which you can use to register a `data` to Alpine.js to
 * create Typewriter instances from within HTML.
 *
 * @example
 * A. Simple typewriter example.
 * 
 * This example creates a typewriter that uses the output from the 
 * "Typewriter Composer" to create an animation:
 * 
 * First register typewriterFromSentences to alpine: 
 * 
 * ```js
 * import Alpine from 'alpinejs';
 * import { typewriter } from '@uiloos/alpine';
 * 
 * Alpine.data('typewriter', typewriter);
 *
 * Alpine.start();
 * ```
 * 
 * Now you can use the typewriter in your HTML like this:
 * 
 * ```html
 * <span 
 *   x-data="typewriter({
 *     alpine: {
 *       name: 'foo'
 *     },
 *     actions: [
 *       {
 *         type: 'keyboard',
 *         text: 'a',
 *         delay: 1000,
 *         cursor: 0,
 *       },
 *       {
 *         type: 'keyboard',
 *         text: 'b',
 *         delay: 1000,
 *         cursor: 0,
 *       },
 *       {
 *         type: 'keyboard',
 *         text: 'c',
 *         delay: 1000,
 *         cursor: 0,
 *       },
 *     ],
 *   })" 
 *   x-text="foo().text">
 * </span>
 * ```
 * 
 * @param {AlpineTypewriterConfig<T>} config The initial configuration for the Typewriter
 * @returns An Alpine.js data component
 * @since 1.4.0
 */
export function typewriter<T>(config: AlpineTypewriterConfig<T>) {
  const typewriter = new Typewriter<T>(config);

  const name = config.alpine?.name ?? 'typewriter';

  return subscribe(name, typewriter)();
}
